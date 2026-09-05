import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../services/api'

export default function Reports(){
  const [category, setCategory] = useState('bug')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')
  const loc = useLocation()

  const send = async ()=>{
    if(message.trim().length < 5){ setError('Mô tả ít nhất 5 ký tự để admin hiểu lỗi'); return }
    setSending(true); setError(''); setDone('')
    try{
      const r: any = await api.sendFeedback({
        category, message: message.trim(),
        page_url: loc.pathname, contact: contact.trim() || undefined,
      })
      setDone(`Đã nhận báo lỗi #${r.id} — cảm ơn bạn!`)
      setMessage('')
    }catch(e:any){ setError(String(e.message || e).slice(0, 200)) }
    finally{ setSending(false) }
  }

  return (
    <div className="page">
      <h1>Reports — DRAFT until verified publication</h1>
      <div className="grid"><div className="card">Monthly Environmental — Preview | Generate | PDF/Excel</div><div className="card">Forest Monitoring — Methodology, Sources, Confidence</div><div className="card">EUDR Traceability — Supply Chain Coverage 92%</div></div>
      <div className="card" style={{marginTop:14}}>
        <h3 style={{margin:'0 0 4px'}}>🐞 Báo lỗi sử dụng</h3>
        <div style={{fontSize:12, color:'#64748B'}}>Thấy nút hỏng, số liệu sai hay chữ khó hiểu? Gửi ở đây, admin sẽ thấy và xử lý.</div>
        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <select value={category} onChange={e=> setCategory(e.target.value)} aria-label="Loại báo lỗi" style={{border:'1px solid #E2E8E5', borderRadius:999, padding:'8px 12px', fontSize:13}}>
            <option value="bug">Lỗi chức năng</option>
            <option value="data">Sai dữ liệu</option>
            <option value="suggestion">Góp ý</option>
          </select>
          <input value={contact} onChange={e=> setContact(e.target.value)} placeholder="Liên hệ (tùy chọn)" aria-label="Liên hệ" style={{border:'1px solid #E2E8E5', borderRadius:999, padding:'8px 12px', fontSize:13, flex:1, minWidth:160}} />
        </div>
        <textarea value={message} onChange={e=> setMessage(e.target.value)} placeholder="Mô tả lỗi: đang ở trang nào, bấm gì, thấy gì..." aria-label="Mô tả lỗi" style={{width:'100%', minHeight:80, border:'1px solid #E2E8E5', borderRadius:12, padding:10, fontSize:13, marginTop:8}} />
        <button onClick={send} disabled={sending} style={{marginTop:8, background:'#0F766E', color:'#fff', border:0, borderRadius:999, padding:'8px 16px', fontWeight:700}}>{sending ? 'Đang gửi...' : 'Gửi báo lỗi'}</button>
        {done && <div style={{marginTop:8, fontSize:13, color:'#166534', background:'#DCFCE7', borderRadius:8, padding:'6px 10px'}}>{done}</div>}
        {error && <div style={{marginTop:8, fontSize:13, color:'#991B1B', background:'#FEE2E2', borderRadius:8, padding:'6px 10px'}}>{error}</div>}
      </div>
      <style>{`.grid{display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px} .card{background:#fff; border:1px solid #E2E8E5; border-radius:16px; padding:16px} @media (max-width: 640px){ .grid{ grid-template-columns:1fr; } }`}</style>
    </div>
  )
}
