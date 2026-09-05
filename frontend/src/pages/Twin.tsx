import { useEffect, useState } from 'react'
import { api } from '../services/api'

type ScRow = { id: string; name: string; type: string; version: number; status?: string }

const TYPES = ['COMPOUND', 'CLIMATE', 'DISASTER', 'FOREST', 'LOGISTICS', 'CARBON']

export default function Twin(){
  const [states, setStates] = useState<any>(null)
  const [rows, setRows] = useState<ScRow[]>([])
  const [scores, setScores] = useState<Record<string, any>>({})
  const [name, setName] = useState('Mưa lớn +20%')
  const [type, setType] = useState('COMPOUND')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cascade, setCascade] = useState<any>(null)
  const [cascadeFor, setCascadeFor] = useState('')

  const refresh = async ()=>{
    const [st, list] = await Promise.all([api.twinStates('gia-lai'), api.scenariosList()])
    setStates(st)
    setRows(Array.isArray(list) ? list : [])
  }
  useEffect(()=>{ refresh().catch((e)=> setError(String(e.message || e))) },[])

  const create = async ()=>{
    setLoading(true); setError('')
    try{
      const sc: any = await api.scenarioCreate(name || 'Scenario', type, { from: 'twin' })
      const sc1: any = await api.scenarioScorecard(sc.id)
      setScores(s => ({ ...s, [sc.id]: sc1 }))
      await refresh()
    }catch(e:any){ setError(String(e.message || e)) }
    finally{ setLoading(false) }
  }

  const showCascade = async (r: ScRow)=>{
    if(cascadeFor === r.id){ setCascadeFor(''); setCascade(null); return }
    setCascadeFor(r.id)
    try{ setCascade(await api.simCascade(r.type)) }catch(e:any){ setCascade({ error: String(e.message || e) }) }
  }

  const stateCards = states ? Object.entries(states) : []
  return (
    <div className="page" style={{display:'flex', flexDirection:'column', gap:16}}>
      <h1>DIGITAL TWIN — Gia Lai Environmental System</h1>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10}}>
        {stateCards.map(([k, v]: any)=> (
          <div key={k} style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:12, padding:12}}>
            <div style={{fontSize:11, color:'#64748B', fontWeight:700}}>{k}</div>
            <div style={{fontSize:20, fontWeight:800}}>🌲 {(v as any)?.forest ?? '—'}</div>
          </div>
        ))}
        {stateCards.length === 0 && <div className="card">Chưa có trạng thái twin.</div>}
      </div>

      <div className="whatif">
        <h3>Kịch bản mới (lưu DB qua WhatIfEngine)</h3>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <input value={name} onChange={e=> setName(e.target.value)} aria-label="Tên kịch bản" style={{flex:1, minWidth:180, border:'1px solid #E2E8E5', borderRadius:999, padding:'8px 14px', fontSize:13}} />
          <select value={type} onChange={e=> setType(e.target.value)} aria-label="Loại kịch bản" style={{border:'1px solid #E2E8E5', borderRadius:999, padding:'8px 12px'}}>
            {TYPES.map(t=> <option key={t}>{t}</option>)}
          </select>
          <button className="run" onClick={create} disabled={loading} style={{marginLeft:0}}>{loading ? 'Đang lưu...' : 'TẠO + CHẤM ĐIỂM'}</button>
        </div>
        {error && <div style={{marginTop:8, fontSize:13, color:'#DC2626'}}>{error}</div>}
      </div>

      <div style={{display:'grid', gap:10}}>
        {rows.map(r=> (
          <div key={r.id} className="result">
            <div style={{display:'flex', justifyContent:'space-between', gap:8, flexWrap:'wrap'}}>
              <b>{r.name}</b>
              <span style={{fontSize:11, background:'#F1F5F3', padding:'2px 8px', borderRadius:999}}>{r.type} · v{r.version} · {r.status}</span>
            </div>
            {scores[r.id] && typeof scores[r.id] === 'object' && (
              <div style={{fontSize:12, marginTop:4}}>Risk {scores[r.id].risk} · Cost {scores[r.id].cost} · CO₂ {scores[r.id].co2} · Rừng {scores[r.id].forest} · Logistics {scores[r.id].logistics} · Chống chịu {scores[r.id].resilience}</div>
            )}
            <button onClick={()=> showCascade(r)} style={{fontSize:11, marginTop:6, background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:999, padding:'2px 8px'}}>⛓ Cascade {cascadeFor === r.id ? '▴' : '▾'}</button>
            {cascadeFor === r.id && cascade && !cascade.error && (
              <div style={{marginTop:6, fontSize:12, background:'#F8FAF9', borderRadius:8, padding:8}}>
                <div>⛓ {(cascade.cascade || []).join(' → ')}</div>
                <div style={{marginTop:4}}>{Object.entries(cascade.temporal || {}).map(([t, v])=> <div key={t}><b>{t}</b>: {String(v)}</div>)}</div>
              </div>
            )}
            {cascadeFor === r.id && cascade?.error && <div style={{color:'#DC2626', fontSize:12}}>{cascade.error}</div>}
          </div>
        ))}
        {rows.length === 0 && <div className="result" style={{color:'#64748B'}}>Chưa có kịch bản nào trong DB — tạo mới ở trên. Reload trang không mất vì lưu backend.</div>}
      </div>

      <div style={{fontSize:12, color:'#64748B'}}>Điểm số seeded theo params — chạy lại giống nhau. Không phải dự báo chắc chắn.</div>
      <style>{`.whatif{background:#fff; border:1px solid #E2E8E5; border-radius:16px; padding:16px} .run{background:#0F766E; color:#fff; border:0; padding:8px 12px; border-radius:999px; margin-left:12px} .result{background:#fff; border:1px solid #E2E8E5; border-radius:16px; padding:16px}`}</style>
    </div>
  )
}
