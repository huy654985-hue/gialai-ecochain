import { describe, expect, it } from 'vitest'
import { LANGS, tFor } from './i18n'

describe('i18n', () => {
  it('has 3 languages', () => {
    expect(LANGS.map(l => l.id).sort()).toEqual(['ede', 'jr', 'vi'])
  })

  it('falls back to Vietnamese for missing keys', () => {
    expect(tFor('jr', 'com.post')).toBe('Đăng')
    expect(tFor('ede', 'hdr.search')).toBe('Tìm xã, thôn, sự cố...')
    expect(tFor('vi', 'no.such.key')).toBe('no.such.key')
  })

  it('translates community core words to Jrai/Ede', () => {
    expect(tFor('jr', 'nav.community')).toBe('Plei')
    expect(tFor('ede', 'nav.community')).toBe('Buôn')
    expect(tFor('jr', 'com.fire')).toBe('apui')
    expect(tFor('ede', 'com.fire')).toBe('pui')
    expect(tFor('jr', 'com.village')).toBe('plei')
    expect(tFor('ede', 'com.village')).toBe('buôn')
  })
})
