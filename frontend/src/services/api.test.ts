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
})
