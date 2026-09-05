import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }

  static getDerivedStateFromError(e: unknown){
    return { error: String((e as Error)?.message || e).slice(0, 300) }
  }

  render(){
    if(this.state.error){
      return (
        <div style={{padding:24, maxWidth:560, margin:'40px auto', background:'#fff', border:'1px solid #FECACA', borderRadius:16}}>
          <h1>Ứng dụng gặp lỗi hiển thị</h1>
          <div style={{fontSize:13, color:'#64748B', margin:'8px 0'}}>Thử tải lại trang. Nếu còn lỗi, gửi nội dung dưới cho admin qua mục Báo lỗi.</div>
          <code style={{fontSize:12, display:'block', background:'#F8FAF9', padding:8, borderRadius:8}}>{this.state.error}</code>
          <button onClick={()=> location.reload()} style={{marginTop:12, background:'#0F766E', color:'#fff', border:0, borderRadius:999, padding:'8px 16px'}}>Tải lại trang</button>
        </div>
      )
    }
    return this.props.children
  }
}
