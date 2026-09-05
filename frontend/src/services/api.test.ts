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

  it('simWhatIf returns simulation result', async () => {
    const sim = { simulation_id: 's1', result: { affected: { villages: 12, roads: 3 } } }
    mockFetch(true, sim)
    await expect(api.simWhatIf('Flood', { rainfall: 20 })).resolves.toEqual(sim)
  })

  it('simResponse returns risk for an intervention', async () => {
    mockFetch(true, { intervention: 'Pre-position team', risk: 'MODERATE' })
    await expect(api.simResponse('Pre-position team')).resolves.toEqual({ intervention: 'Pre-position team', risk: 'MODERATE' })
  })

  it('scenarioCreate + scorecard wire WhatIfEngine', async () => {
    mockFetch(true, { id: 'sc1', name: 'Mưa lớn', type: 'DISASTER', version: 1 })
    await expect(api.scenarioCreate('Mưa lớn', 'DISASTER', { rainfall_pct: 30 })).resolves.toEqual({ id: 'sc1', name: 'Mưa lớn', type: 'DISASTER', version: 1 })
    mockFetch(true, { risk: 62, cost: 40, co2: 55, forest: 70, logistics: 60, resilience: 65 })
    const s = await api.scenarioScorecard('sc1')
    expect(s.risk).toBe(62)
  })

  it('scenariosCompare returns server-side comparison', async () => {
    mockFetch(true, { scenarios: [{ id: 'sc1', risk: 62 }], baseline: 'sc1' })
    await expect(api.scenariosCompare(['sc1'])).resolves.toEqual({ scenarios: [{ id: 'sc1', risk: 62 }], baseline: 'sc1' })
  })

  it('simCascade returns temporal + spatial chain', async () => {
    mockFetch(true, { cascade: ['EXTREME RAIN', 'FLOOD'], temporal: { 'T+0': 'Event' } })
    const c = await api.simCascade('Flood')
    expect(c.cascade).toContain('FLOOD')
  })

  it('nlWhatIf parses a Vietnamese question into params', async () => {
    mockFetch(true, { scenario_id: 'sc9', params: { rainfall: '+30%' }, requires_confirmation: true })
    const r = await api.nlWhatIf('Mưa lớn 30% thì sao?')
    expect(r.params.rainfall).toBe('+30%')
  })
})
