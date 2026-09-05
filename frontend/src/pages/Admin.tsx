import { useEffect, useState } from 'react'
import ModelSwitcher from '../components/ModelSwitcher'

const API = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'

const SERVICES = [
  { key: 'gee', name: 'Google Earth Engine', env: 'GEE_PROJECT_ID / GEE_SERVICE_ACCOUNT / GEE_PRIVATE_KEY' },
  { key: 'sentinel_hub', name: 'Sentinel Hub (S2/S1)', env: 'SENTINELHUB_CLIENT_ID / SENTINELHUB_CLIENT_SECRET' },
  { key: 'firms', name: 'NASA FIRMS (điểm nóng)', env: 'FIRMS_MAP_KEY' },
  { key: 'llm', name: 'AI (Gemini/Groq)', env: 'GEMINI_API_KEY / GROQ_API_KEY' },
  { key: 'weather', name: 'Thời tiết (Open-Meteo)', env: 'không cần key' },
  { key: 'database', name: 'Database', env: 'DATABASE_URL' },
]

function statusColor(s?: string){
  if(s === 'LIVE') return '#DCFCE7'
  if(s === 'DEMO' || s === 'CACHED') return '#FEF3C7'
  return '#FEE2E2'
}

function ConfigBoard({ geo }: { geo: any }){
  return (
    <div style={{display:'grid', gap:8, marginTop:8}}>
      {geo.summary?.all_live && <div style={{fontSize:13, fontWeight:700, color:'#166534'}}>● Tất cả đã LIVE</div>}
      {SERVICES.map(sv=>{
        const g = geo[sv.key] || {}
        return (
          <div key={sv.key} style={{display:'flex', gap:10, alignItems:'center', border:'1px solid #E2E8E5', borderRadius:10, padding:'8px 10px', fontSize:13, flexWrap:'wrap'}}>
            <b style={{minWidth:180}}>{sv.name}</b>
            <span style={{background: statusColor(g.status), padding:'2px 10px', borderRadius:999, fontWeight:700, fontSize:12}}>{g.status || '?'}</span>
            <span style={{fontSize:11, color:'#64748B'}}>{g.configured === false ? 'chưa thiết lập' : g.configured ? 'đã thiết lập' : ''} · <code>{sv.env}</code></span>
          </div>
        )
      })}
      <div style={{fontSize:11, color:'#64748B'}}>Thiết lập key trong Environment Variables của backend rồi redeploy. Không bao giờ dán key lên web.</div>
    </div>
  )
}

// NOTE (security): service-account private keys must NEVER touch the browser.
// They live only in backend env / secret manager. This page therefore has no
// key input — it only shows the live backend GEE status + setup instructions.
export default function Admin(){
  const [gee, setGee] = useState<any>(null)
  const [geo, setGeo] = useState<any>(null)
  useEffect(()=>{
    // one-time purge: older builds stored a GEE key in the browser — remove it
    try{ localStorage.removeItem('ecogl_gee_key') }catch{}
    fetch(`${API}/api/earth-engine/status`).then(r=>r.json()).then(setGee).catch(()=> setGee({ connected:false }))
    fetch(`${API}/api/health/geospatial`).then(r=>r.json()).then(setGeo).catch(()=> setGeo(null))
  },[])
  const saveMap = ()=>{
    const v=(document.getElementById('map_key2') as HTMLInputElement)?.value || ''
    localStorage.setItem('ecogl_map_key', v); localStorage.setItem('ecogl_map_style', v); location.reload()
  }
  const connected = gee?.connected === true
  return (
    <div className="page">
      <h1>Quản trị — Người dùng · Vai trò · Nguồn dữ liệu · Agent · Sức khỏe hệ thống</h1>
      <div className="health"><div>Cơ sở dữ liệu ● Trực tuyến</div><div>API ● Trực tuyến</div><div>GEE ● {gee ? (connected ? 'Đã kết nối LIVE' : 'Chưa cấu hình (cần key ở backend)') : 'Đang kiểm tra...'}</div><div>AI Services ● Trực tuyến</div></div>
      <div className="agents"><div>AGENT RỪNG ● TRỰC TUYẾN 99.1% <span style={{fontSize:10, padding:'2px 6px', borderRadius:999, background:'#FEF3C7'}}>DEMO DATA</span></div><div>AGENT THIÊN TAI ● TRỰC TUYẾN</div><div>AGENT LOGISTICS ● TRỰC TUYẾN</div></div>

      <div className="card" style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:12, padding:16, marginTop:12}}>
        <h3>0. Tình trạng cấu hình (live từ backend)</h3>
        {!geo && <div style={{fontSize:13, color:'#64748B'}}>Đang kiểm tra...</div>}
        {geo && <ConfigBoard geo={geo} />}
      </div>

      <div className="card" style={{background:'#fff', border:'1px solid #E2E8E5', borderRadius:12, padding:16, marginTop:12}}>
        <h3>1. Nhập API Bản đồ hiển thị (Map Tiles — cho Bản đồ trực tiếp)</h3>
        <p style={{fontSize:12, color:'#64748B'}}>Dùng cho nền bản đồ, không phải dữ liệu vệ tinh phân tích. Để trống = OSM miễn phí. Có key thì dán vào đây hoặc ngay trên Bản đồ.</p>
        <input id="map_key2" placeholder="MapTiler key hoặc URL style JSON (https://api.maptiler.com/...)" style={{width:'100%', padding:'8px', border:'1px solid #E2E8E5', borderRadius:8, marginTop:8}} />
        <button onClick={saveMap} style={{marginTop:8, background:'#0F766E', color:'#fff', border:0, padding:'8px 12px', borderRadius:999}}>Lưu & Tải lại bản đồ</button>
        <div style={{fontSize:11, color:'#64748B', marginTop:6}}>Vị trí file: trình duyệt localStorage <code>ecogl_map_key</code> · Hoặc set <code>VITE_MAP_STYLE</code> trong <code>frontend/.env</code></div>
      </div>

      <div className="card" style={{background:'#FFF7ED', border:'1px solid #FDBA74', borderRadius:12, padding:16, marginTop:12}}>
        <h3>2. Vệ tinh EE Sentinel (Google Earth Engine — cho phân tích NDVI/Rừng)</h3>
        <p style={{fontSize:12, color:'#7C2D12'}}>Đây là cấu hình <b>backend</b>, không phải bản đồ nền. Cần Service Account của Google Cloud. <a href="https://code.earthengine.google.com" target="_blank">Lấy tại code.earthengine.google.com</a></p>
        <div style={{fontSize:13, marginTop:8}}>Trạng thái backend: <b>{gee ? (connected ? '● LIVE đã kết nối' : '○ chưa cấu hình — đang dùng DEMO DATA') : 'Đang kiểm tra...'}</b></div>
        <div style={{fontSize:12, color:'#DC2626', marginTop:8, background:'#fff', border:'1px solid #FECACA', borderRadius:8, padding:10}}>
          ⛔ Không bao giờ dán private key vào trình duyệt hay bất kỳ ô nhập web nào — key chỉ tồn tại trong biến môi trường backend / secret manager.
        </div>
        <div style={{fontSize:12, marginTop:10, background:'#fff', border:'1px solid #E2E8E5', borderRadius:8, padding:10}}>
          <b>Để bật vệ tinh thực (trên máy chủ backend):</b><br/>
          1. Mở file <code>backend/.env</code> (tạo từ <code>.env.example</code>)<br/>
          2. Điền:<br/>
          <code>GEE_PROJECT_ID=...</code><br/>
          <code>GEE_SERVICE_ACCOUNT=...@....iam.gserviceaccount.com</code><br/>
          <code>GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."</code><br/>
          3. Restart backend rồi kiểm tra <code>/api/earth-engine/status</code> phải trả <code>{`{"connected":true}`}</code><br/>
          <span style={{color:'#DC2626'}}>Không commit file .env lên Git!</span>
        </div>
      </div>

      <ModelSwitcher />
      <div className="audit">Nhật ký: 14:32 Quản trị Tỉnh đã xác minh sự cố Thôn A — THÀNH CÔNG</div>
      <style>{`.health,.agents{display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:12px} .health div,.agents div{background:#fff; border:1px solid #E2E8E5; border-radius:12px; padding:12px; font-size:13px} .audit{background:#fff; border:1px solid #E2E8E5; border-radius:12px; padding:12px; margin-top:12px; font-size:13px; font-family:monospace}`}</style>
    </div>
  )
}
