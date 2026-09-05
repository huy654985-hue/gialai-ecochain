import { useEffect, useState } from 'react'

const STEPS = ['Đến vị trí', 'Chụp ảnh', 'Thu thập bằng chứng', 'Xác minh'] as const
const LS_KEY = 'ecogl_mission_042'

type Saved = { steps: boolean[]; started: boolean; location: string; log: string[] }

function load(): Saved {
  try{
    const raw = localStorage.getItem(LS_KEY)
    if(raw){ const j = JSON.parse(raw); return { steps: j.steps ?? [false,false,false,false], started: !!j.started, location: j.location ?? '', log: j.log ?? [] } }
  }catch{}
  return { steps: [false,false,false,false], started: false, location: '', log: [] }
}

export default function Missions(){
  const [role, setRole]= useState<'public'|'verifier'>( 'public')
  const [steps, setSteps] = useState<boolean[]>(load().steps)
  const [started, setStarted] = useState(load().started)
  const [location, setLocation] = useState(load().location)
  const [log, setLog] = useState<string[]>(load().log)

  useEffect(()=>{
    try{ localStorage.setItem(LS_KEY, JSON.stringify({ steps, started, location, log })) }catch{}
  },[steps, started, location, log])

  const pushLog = (m: string)=> setLog(l => [...l.slice(-9), `${new Date().toLocaleTimeString('vi-VN')} ${m}`])

  const toggle = (i: number)=>{
    setSteps(s => s.map((v, j)=> j === i ? !v : v))
    pushLog(`${steps[i] ? 'Bỏ tick' : 'Hoàn thành'}: ${STEPS[i]}`)
  }

  const useMyLocation = ()=>{
    if(!navigator.geolocation){ pushLog('Trình duyệt không hỗ trợ vị trí'); return }
    navigator.geolocation.getCurrentPosition(
      (p)=> { setLocation(`${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`); pushLog('Đã gắn vị trí hiện tại') },
      ()=> pushLog('Bị từ chối quyền vị trí'),
    )
  }

  const done = steps.filter(Boolean).length

  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h1>Missions</h1>
        <select value={role} onChange={e=> setRole(e.target.value as any)} style={{padding:'6px 10px', borderRadius:999, border:'1px solid #E2E8E5'}}>
          <option value="public">Public / Community</option>
          <option value="verifier">Field Verifier</option>
        </select>
      </div>

      {role==='verifier' ? (
        <div style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:16, padding:16}}>
          <h3>NHIỆM VỤ #042 — Xác minh bất thường rừng {started && <span style={{fontSize:11, background:'#DCFCE7', padding:'2px 8px', borderRadius:999}}>ĐANG THỰC HIỆN</span>}</h3>
          <div>📍 {location || 'Gia Lai'} · Ưu tiên CAO · Vì vệ tinh + thời tiết + cộng đồng</div>
          <div style={{marginTop:8, fontSize:13}}>Tiến độ: {done}/{STEPS.length}</div>
          <div style={{marginTop:8, display:'grid', gap:6, fontSize:13}}>
            {STEPS.map((s, i)=> (
              <label key={s}><input type="checkbox" checked={steps[i]} onChange={()=> toggle(i)} /> {s}</label>
            ))}
          </div>
          <button onClick={()=> { setStarted(true); pushLog('Bắt đầu nhiệm vụ') }} disabled={started} style={{marginTop:10, background:'#0B1412', color:'#fff', padding:'8px 12px', borderRadius:999, border:0, width:'100%'}}>{started ? 'ĐANG THỰC HIỆN...' : 'BẮT ĐẦU NHIỆM VỤ'}</button>
          <div style={{marginTop:10, display:'flex', gap:6, flexWrap:'wrap'}}>
            <button onClick={()=> pushLog('Đã chụp ảnh bằng chứng')}>📷 Ảnh</button>
            <button onClick={()=> pushLog('Đã quay video hiện trường')}>🎥 Video</button>
            <button onClick={useMyLocation}>📍 Vị trí</button>
            <button onClick={()=> pushLog('🚨 Đã gửi tín hiệu khẩn cấp')}>🚨 Khẩn cấp</button>
          </div>
          {log.length > 0 && (
            <div style={{marginTop:10, fontSize:12, background:'#F8FAF9', borderRadius:8, padding:8}}>
              {log.map((l, i)=> <div key={i}>{l}</div>)}
            </div>
          )}
          <div style={{marginTop:8, fontSize:12, color:'#64748B'}}>Tick/mốc thời gian được lưu trên trình duyệt này (reload không mất). Gửi: Kết quả + Ảnh + Vị trí + Mô tả → AI đánh giá</div>
        </div>
      ) : (
        <div style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:16, padding:16}}>
          <h3>Nhiệm vụ #042 — Xác minh bất thường rừng</h3>
          <div>📍 Gia Lai · Ưu tiên CAO</div>
          <div style={{marginTop:8, fontSize:13, color:'#334155'}}>Nhiệm vụ chứa vị trí, sự kiện, ưu tiên, hành động khuyến nghị, bằng chứng cần thiết.</div>
          <button onClick={()=> setRole('verifier')} style={{marginTop:10, background:'#0F766E', color:'#fff', padding:'8px 12px', borderRadius:999, border:0}}>Bắt đầu</button>
        </div>
      )}

      <div style={{background:'#F8FAF9', border:'1px solid #E2E8E5', borderRadius:12, padding:12, fontSize:13}}>
        <b>Vòng lặp học tập (ví dụ minh họa):</b> AI dự đoán CAO (87%) → Thực địa XÁC NHẬN → So sánh → Đánh giá mô hình → Cập nhật Digital Twin <span style={{fontSize:10, padding:'2px 6px', borderRadius:999, background:'#FEF3C7'}}>DEMO DATA</span><br/>
        <span style={{fontSize:12, color:'#64748B'}}>Dự đoán: Cháy 82% · Thực tế: Đã xác nhận cháy · Kết quả: ĐÚNG · Dùng cho cải tiến liên tục</span>
      </div>

      <div style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:16, padding:16}}>
        <h4>Tác động môi trường (khi sự kiện gần nông nghiệp)</h4>
        <div style={{fontSize:13, lineHeight:1.8}}>
          Rừng: -12 ha · Carbon: +X tCO₂e (ước tính) · EUDR: Nguy cơ truy xuất · Logistics: +2.4h trễ · Chỉ hiện khi liên quan
        </div>
      </div>
    </div>
  )
}
