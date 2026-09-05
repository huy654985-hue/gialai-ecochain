import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../services/api'

type SavedSim = {
  id: string
  scenario: string
  params: Record<string, number>
  affected: { villages: number; roads: number; farms: number }
}

const SCENARIOS = ['Flood', 'Heat', 'Forest', 'Road', 'Compound'] as const
const INTERVENTIONS = ['No intervention', 'Pre-position team', 'Close road + reroute'] as const

const riskColor = (r?: string) =>
  r === 'HIGH' ? '#DC2626' : r === 'MODERATE' ? '#F59E0B' : '#0F766E'

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number)=>void
}){
  return (
    <label style={{display:'block', fontSize:13}}>
      <div style={{display:'flex', justifyContent:'space-between'}}><span>{label}</span><b>+{value}{unit}</b></div>
      <input type="range" min={min} max={max} value={value} onChange={e=> onChange(Number(e.target.value))} style={{width:'100%'}} aria-label={label} />
    </label>
  )
}

export default function WhatIfLab(){
  const [scenario, setScenario] = useState<string>('Flood')
  const [rain, setRain] = useState(20)
  const [heat, setHeat] = useState(2)
  const [forestLoss, setForestLoss] = useState(500)
  const [roadHours, setRoadHours] = useState(48)
  const [baseline, setBaseline] = useState<any>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [slots, setSlots] = useState<SavedSim[]>([])
  const [intervention, setIntervention] = useState<string>(INTERVENTIONS[0])
  const [resp, setResp] = useState<any>(null)

  useEffect(()=>{
    fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'}/api/risk/overview`)
      .then(r=>r.json()).then(j=> setBaseline(j)).catch(()=> setBaseline({ overall:42 }))
  },[])

  const params = { rainfall_pct: rain, heat_c: heat, forest_loss_ha: forestLoss, road_closure_h: roadHours }

  const run = async ()=>{
    setRunning(true); setError('')
    try{
      const j: any = await api.simWhatIf(scenario, params)
      const affected = j.result?.affected ?? { villages: 0, roads: 0, farms: 0 }
      const slot: SavedSim = { id: j.simulation_id || `${Date.now()}`, scenario, params: { ...params }, affected }
      setSlots(s => [...s.slice(-2), slot])
    }catch(e:any){ setError(String(e.message || e)) }
    finally{ setRunning(false) }
  }

  const runIntervention = async (v: string)=>{
    setIntervention(v)
    try{ setResp(await api.simResponse(v)) }catch(e:any){ setResp({ error: String(e.message || e) }) }
  }

  const chartData = ['villages', 'roads', 'farms'].map(k=> ({
    metric: k === 'villages' ? 'Làng' : k === 'roads' ? 'Đường' : 'Trại',
    ...Object.fromEntries(slots.map((s, i)=> [`${String.fromCharCode(65+i)} · ${s.scenario}`, (s.affected as any)[k] ?? 0])),
  }))
  const slotColors = ['#0F766E', '#F59E0B', '#6366F1']
  const worst = slots.length > 1
    ? slots.reduce((a, b)=> (a.affected.villages + a.affected.roads) >= (b.affected.villages + b.affected.roads) ? a : b)
    : null

  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <h1>What-if Lab — Mô phỏng tương lai (Digital Twin)</h1>

      <div style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:16, padding:16}}>
        <h3>1 · Dựng kịch bản</h3>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
          {SCENARIOS.map(s=> (
            <button key={s} onClick={()=> setScenario(s)} style={{background: scenario===s ? '#0B1412' : '#F1F5F3', color: scenario===s ? '#fff' : '#0B1412', padding:'8px 12px', borderRadius:999, border:0}}>{s}</button>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <Slider label="🌧 Mưa tăng" value={rain} min={0} max={60} unit="%" onChange={setRain} />
          <Slider label="🌡 Nóng thêm" value={heat} min={0} max={5} unit="°C" onChange={setHeat} />
          <Slider label="🔥 Mất rừng" value={forestLoss} min={0} max={2000} unit=" ha" onChange={setForestLoss} />
          <Slider label="🛣 Đóng đường" value={roadHours} min={0} max={120} unit="h" onChange={setRoadHours} />
        </div>
        <button onClick={run} disabled={running} style={{marginTop:12, background:'#0F766E', color:'#fff', padding:'10px 20px', borderRadius:999, border:0, fontWeight:700}}>
          {running ? 'Đang mô phỏng...' : `▶ Chạy ${scenario} → lưu slot ${String.fromCharCode(65 + (slots.length % 3))}`}
        </button>
        {error && <div style={{marginTop:8, fontSize:13, color:'#DC2626'}}>Lỗi: {error}</div>}
        <div style={{fontSize:12, color:'#64748B', marginTop:8}}>Baseline rủi ro hiện tại: {baseline?.overall ?? '…'} · Nguồn: vệ tinh + thời tiết + FIRMS · {baseline ? 'LIVE' : 'DEMO DATA'}</div>
      </div>

      {slots.length > 0 && (
        <div style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:16, padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>2 · So sánh kịch bản A/B/C ({slots.length}/3)</h3>
            <button onClick={()=> setSlots([])} style={{fontSize:12, background:'#fff', border:'1px solid #E2E8E5', borderRadius:999, padding:'4px 10px'}}>Xóa hết</button>
          </div>
          {worst && <div style={{fontSize:13, marginBottom:8}}>Nặng nhất: <b>slot {String.fromCharCode(65 + slots.indexOf(worst))} · {worst.scenario}</b> ({worst.affected.villages} làng, {worst.affected.roads} đường)</div>}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              {slots.map((s, i)=> <Bar key={s.id} dataKey={`${String.fromCharCode(65+i)} · ${s.scenario}`} fill={slotColors[i % 3]} />)}
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'grid', gridTemplateColumns:`repeat(${slots.length}, 1fr)`, gap:10, marginTop:10}}>
            {slots.map((s, i)=> (
              <div key={s.id} style={{border:'1px solid #E2E8E5', borderRadius:12, padding:10, fontSize:12, lineHeight:1.7}}>
                <b>Slot {String.fromCharCode(65+i)} · {s.scenario}</b><br/>
                Mưa +{s.params.rainfall_pct}% · +{s.params.heat_c}°C · {s.params.forest_loss_ha} ha · {s.params.road_closure_h}h<br/>
                🏘 {s.affected.villages} làng · 🛣 {s.affected.roads} đường · 🚜 {s.affected.farms} trại<br/>
                <button onClick={()=> setSlots(x => x.filter(y => y.id !== s.id))} style={{fontSize:11, marginTop:4, background:'#fff', border:'1px solid #E2E8E5', borderRadius:999, padding:'2px 8px'}}>Xóa slot</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background:'#0B1412', color:'#fff', borderRadius:16, padding:16}}>
        <h3 style={{color:'#fff'}}>3 · Thử biện pháp ứng phó</h3>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {INTERVENTIONS.map(v=> (
            <button key={v} onClick={()=> runIntervention(v)} style={{background: intervention===v ? '#0F766E' : '#1F2937', color:'#fff', padding:'8px 12px', borderRadius:999, border:0}}>{v}</button>
          ))}
        </div>
        {resp && !resp.error && (
          <div style={{marginTop:10, fontSize:14}}>Rủi ro còn lại: <b style={{color: riskColor(resp.risk)}}>{resp.risk}</b> <span style={{fontSize:11, color:'#94A3B8'}}>với “{resp.intervention}”</span></div>
        )}
        {resp?.error && <div style={{marginTop:8, fontSize:13, color:'#FCA5A5'}}>{resp.error}</div>}
      </div>

      <Link to="/missions" style={{background:'#0F766E', color:'#fff', padding:'10px', borderRadius:999, textAlign:'center', textDecoration:'none'}}>TẠO NHIỆM VỤ PHẢN HỒI →</Link>
      <div style={{fontSize:12, color:'#64748B'}}>Mô phỏng là kịch bản phân tích (seeded, chạy lại ra số giống nhau), không phải dự báo chắc chắn. Dữ liệu: vệ tinh + thời tiết + FIRMS · <span style={{background:'#FEF3C7', padding:'2px 6px', borderRadius:999}}>DEMO DATA nếu GEE chưa LIVE</span></div>
    </div>
  )
}
