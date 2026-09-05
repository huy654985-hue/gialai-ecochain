const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function req(path: string, init?: RequestInit) {
  const r = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) }, ...init })
  if(!r.ok) throw new Error(`${r.status} ${await r.text()}`)
  return r.json()
}

export const api = {
  dashboard: ()=> req('/api/dashboard/green-economy').catch(()=> null),
  riskProfile: (id:string)=> req(`/api/risk/${id}`).catch(()=> ({ overall_score: 62, overall_level:'HIGH', breakdown:{}})),
  alerts: ()=> req('/api/alerts-unified').catch(()=> []),
  alertList: ()=> req('/api/alerts').catch(()=> []),
  alertDetail: (id:string)=> req(`/api/alerts/${id}`),
  ackAlert: (id:string, actor = 'web-user')=> req(`/api/alerts/${id}/acknowledge`, { method:'POST', body: JSON.stringify({ actor_id: actor }) }),
  simWhatIf: (scenario:string, params:Record<string, unknown>)=> req('/api/simulate/what-if', { method:'POST', body: JSON.stringify({ scenario, params }) }),
  simResponse: (intervention:string)=> req('/api/simulate/response', { method:'POST', body: JSON.stringify({ intervention }) }),
  simCompare: (scenarios:unknown[])=> req('/api/simulate/scenario-comparison', { method:'POST', body: JSON.stringify({ scenarios }) }),
  forestHealth: ()=> Promise.resolve({ healthy:78.4, trend:2.8 }),
  geeStatus: ()=> req('/api/earth-engine/status').catch(()=> ({ connected:false, reason:'NOT_CONNECTED' })),
  incidents: ()=> req('/api/incidents').catch(()=>[]),
  mapSearch: (q:string)=> req(`/api/search/global?q=${q}`).catch(()=>null),
}
