import { beforeEach, describe, expect, it } from 'vitest'
import { useScope } from './useScope'

describe('useScope', () => {
  beforeEach(() => {
    useScope.setState({ scope: { province: 'Gia Lai', role: 'province' }, villages: [] })
  })

  it('starts at province scope', () => {
    const { scope, communes } = useScope.getState()
    expect(scope.role).toBe('province')
    expect(communes.length).toBeGreaterThan(0)
  })

  it('setCommune narrows role and loads villages', () => {
    useScope.getState().setCommune('Huyện Chư Prông')
    const { scope, villages } = useScope.getState()
    expect(scope.role).toBe('commune')
    expect(scope.commune).toBe('Huyện Chư Prông')
    expect(villages).toContain('Thôn 1')
  })

  it('setCommune(undefined) resets to province', () => {
    useScope.getState().setCommune('Huyện Chư Prông')
    useScope.getState().setCommune(undefined)
    const { scope, villages } = useScope.getState()
    expect(scope.role).toBe('province')
    expect(villages).toEqual([])
  })

  it('unknown commune yields empty villages, not crash', () => {
    useScope.getState().setCommune('Xã Không Tồn Tại')
    expect(useScope.getState().villages).toEqual([])
  })

  it('setVillage derives village role', () => {
    useScope.getState().setCommune('Huyện Chư Prông')
    useScope.getState().setVillage('Thôn 1')
    expect(useScope.getState().scope.role).toBe('village')
  })
})
