import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(ok: boolean, body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, status, text: async () => JSON.stringify(body), json: async () => body })),
  )
}

describe('api client', () => {
  it('returns json on success', async () => {
    mockFetch(true, { connected: true })
    await expect(api.geeStatus()).resolves.toEqual({ connected: true })
  })

  it('falls back instead of throwing when backend is down', async () => {
    mockFetch(false, { detail: 'boom' }, 500)
    await expect(api.geeStatus()).resolves.toEqual({ connected: false, reason: 'NOT_CONNECTED' })
    await expect(api.alerts()).resolves.toEqual([])
    await expect(api.incidents()).resolves.toEqual([])
  })

  it('riskProfile falls back to a default profile', async () => {
    mockFetch(false, {}, 503)
    const p = await api.riskProfile('x')
    expect(p.overall_level).toBe('HIGH')
  })

  it('alertList returns [] when backend is down', async () => {
    mockFetch(false, {}, 500)
    await expect(api.alertList()).resolves.toEqual([])
  })

  it('alertList passes through alerts on success', async () => {
    const rows = [{ id: 'a1', level: 'CRITICAL', status: 'ACTIVE', title: 'Cháy' }]
    mockFetch(true, rows)
    await expect(api.alertList()).resolves.toEqual(rows)
  })

  it('alertDetail throws on 404 so the page can show "not found"', async () => {
    mockFetch(false, { detail: 'Alert not found' }, 404)
    await expect(api.alertDetail('missing')).rejects.toThrow('404')
  })

  it('ackAlert posts acknowledge and returns new status', async () => {
    mockFetch(true, { id: 'a1', status: 'ACKNOWLEDGED' })
    await expect(api.ackAlert('a1')).resolves.toEqual({ id: 'a1', status: 'ACKNOWLEDGED' })
  })
})
