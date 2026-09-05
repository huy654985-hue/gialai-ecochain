import { Bell, Bot, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModeSwitch from './ModeSwitch'
import { api } from '../services/api'
import { LANGS, useLang } from '../i18n'

export default function Header({ onMenu }: { onMenu: ()=>void }) {
  const [now, setNow] = useState(new Date())
  const [activeCount, setActiveCount] = useState(0)
  const nav = useNavigate()
  const { lang, setLang, t } = useLang()
  useEffect(()=>{
    const id=setInterval(()=> setNow(new Date()), 1000)
    api.alertList().then((d: any)=> {
      const rows = Array.isArray(d) ? d : []
      setActiveCount(rows.filter((a: any)=> a.status === 'ACTIVE').length)
    }).catch(()=> {})
    return ()=> clearInterval(id)
  },[])
  const timeStr = now.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) + ' - ' + now.toLocaleDateString('vi-VN')
  return (
    <header className="header">
      <button className="menu" onClick={onMenu} aria-label="Menu"><Menu size={20}/></button>

      <div className="scope">
        <span style={{fontWeight:700}}>Gia Lai</span>
        <span className="scope-badge">TRỰC TIẾP</span>
        <ModeSwitch />
      </div>
      <div className="hdr-search" style={{flex:1, maxWidth:420, margin:'0 16px', display:'flex', alignItems:'center', background:'#F8FAF9', border:'1px solid #E2E8E5', borderRadius:999, padding:'6px 12px', gap:8}}>
        <span style={{opacity:0.5}}>⌕</span>
        <input placeholder={t('hdr.search')} style={{border:0, outline:'none', flex:1, fontSize:13, background:'transparent'}} onKeyDown={e=>{ if(e.key==='Enter') alert('Tìm: '+(e.target as HTMLInputElement).value)}} />
      </div>

      <div className="header-right">
        <span className="status"><span className="dot live" style={{animation:'pulse 1.5s infinite'}}/> {t('hdr.live')}</span>
        <span className="meta">Cập nhật: {timeStr}</span>
        <span title={t('hdr.langNote')} style={{display:'flex', gap:4, alignItems:'center'}}>
          {LANGS.map(l=> (
            <button key={l.id} onClick={()=> setLang(l.id)} aria-label={l.label} style={{border: lang===l.id ? '1px solid #0F766E' : '1px solid #E2E8E5', background: lang===l.id ? '#0F766E' : '#fff', color: lang===l.id ? '#fff' : '#000', borderRadius:999, padding:'4px 8px', fontSize:11, fontWeight:700}}>{l.id === 'vi' ? 'VI' : l.id === 'jr' ? 'JR' : 'EĐ'}</button>
          ))}
        </span>
        <button className="icon-btn" aria-label={t('hdr.notif')} onClick={()=> nav('/notifications')}><Bell size={18}/>{activeCount > 0 && <span className="badge">{activeCount}</span>}</button>
        <button className="assistant"><Bot size={16}/> {t('hdr.assistant')}</button>
        <div className="user">QT</div>
      </div>

      <style>{`
        .header{ height:64px; background:#FFFFFF; border-bottom:1px solid #E2E8E5; display:flex; align-items:center; gap:16px; padding:0 20px; position:sticky; top:0; z-index:10; }
        .menu{ display:none; background:#fff; border:1px solid #E2E8E5; border-radius:10px; padding:8px; }
        .scope{ display:flex; gap:8px; align-items:center; }
        .scope select{ background:#F8FAF9; border:1px solid #E2E8E5; border-radius:10px; padding:8px 10px; font-size:13px; font-weight:600; }
        .scope-badge{ font-size:11px; letter-spacing:0.6px; background:#0F766E; color:#fff; padding:4px 8px; border-radius:999px; }
        .header-right{ margin-left:auto; display:flex; gap:12px; align-items:center; }
        .status{ font-size:12px; color:#0F766E; font-weight:600; display:flex; gap:6px; align-items:center; }
        .dot{ width:8px; height:8px; border-radius:999px; background:#10B981; display:inline-block; }
        .meta{ font-size:12px; color:#64748B; }
        .demo{ font-size:11px; border:1px solid #E2E8E5; padding:6px 10px; border-radius:999px; background:#fff; }
        .demo.on{ background:#FEF3C7; border-color:#F59E0B; color:#92400E; }
        .icon-btn{ position:relative; background:#fff; border:1px solid #E2E8E5; border-radius:999px; width:36px; height:36px; display:grid; place-items:center; }
        .badge{ position:absolute; top:-6px; right:-6px; background:#DC2626; color:#fff; font-size:10px; padding:2px 5px; border-radius:999px; }
        .assistant{ background:#0B1412; color:#fff; border-radius:999px; padding:8px 12px; font-size:13px; display:flex; gap:6px; align-items:center; }
        .user{ width:32px; height:32px; border-radius:999px; background:#0F766E; color:#fff; display:grid; place-items:center; font-weight:700; font-size:12px; }
        @media (max-width: 900px){
          .menu{ display:grid; }
          .meta, .status{ display:none; }
          .assistant span{ display:none; }
        }
      `}</style>
    </header>
  )
}
