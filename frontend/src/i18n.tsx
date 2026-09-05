import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'vi' | 'jr' | 'ede'
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'jr', label: 'Jrai' },
  { id: 'ede', label: 'Êđê' },
]

// Core UI strings. Jarai/Êđê cover common community words; anything missing
// falls back to Vietnamese (t() below) — dictionaries are marked beta and
// open to community corrections.
const dict: Record<Lang, Record<string, string>> = {
  vi: {
    'nav.main': 'CHÍNH',
    'nav.eco': 'Eco Map',
    'nav.events': 'Event Intelligence',
    'nav.whatif': 'What-if Lab',
    'nav.missions': 'Missions',
    'nav.community': 'Cộng đồng',
    'nav.twin': 'Bản sao số',
    'nav.settings': 'Cài đặt',
    'nav.help': 'Trợ giúp',
    'nav.adminName': 'Quản trị Tỉnh',
    'hdr.search': 'Tìm xã, thôn, sự cố...',
    'hdr.live': 'Hệ thống trực tiếp',
    'hdr.assistant': 'Trợ lý AI',
    'hdr.notif': 'Thông báo',
    'hdr.langNote': 'Bản dịch Jrai/Êđê đang hoàn thiện — từ nào thiếu sẽ hiện tiếng Việt',
    'com.title': 'Cộng đồng',
    'com.need': 'Cần xác minh',
    'com.done': 'Đã xác minh',
    'com.all': 'Tất cả',
    'com.reload': 'Tải lại',
    'com.composerPh': 'thấy gì ở hiện trường?',
    'com.areaPh': 'Khu vực (vd: Xã Ia Mơr)',
    'com.post': 'Đăng',
    'com.confirm': 'Xác nhận',
    'com.object': 'Phản đối',
    'com.details': 'Chi tiết',
    'com.photo': 'Ảnh',
    'com.commentPh': 'Viết bình luận kèm lượt xác minh...',
    'com.fire': 'cháy',
    'com.village': 'thôn',
  },
  jr: {
    'nav.community': 'Plei',
    'com.title': 'Plei',
    'com.fire': 'apui',
    'com.village': 'plei',
  },
  ede: {
    'nav.community': 'Buôn',
    'com.title': 'Buôn',
    'com.fire': 'pui',
    'com.village': 'buôn',
  },
}

export function tFor(lang: Lang, key: string): string {
  return dict[lang]?.[key] ?? dict.vi[key] ?? key
}

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: 'vi',
  setLang: () => {},
  t: (k: string) => tFor('vi', k),
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(()=>{
    try{ const v = localStorage.getItem('ecogl_lang'); return v === 'jr' || v === 'ede' ? v : 'vi' }catch{ return 'vi' }
  })
  useEffect(()=>{ try{ localStorage.setItem('ecogl_lang', lang) }catch{} },[lang])
  return (
    <LangCtx.Provider value={{ lang, setLang: setLangState, t: (k: string) => tFor(lang, k) }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = ()=> useContext(LangCtx)
