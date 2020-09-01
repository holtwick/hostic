import { getBasePath } from './pathutil.js'

describe('Path Utils', () => {

  it('should find correct base name', () => {
    expect(getBasePath('')).toBe('/')
    expect(getBasePath('/')).toBe('/')
    expect(getBasePath('/en')).toBe('/')
    expect(getBasePath('/en/')).toBe('/en/')
    expect(getBasePath('/en/help')).toBe('/en/')
    expect(getBasePath('en/help')).toBe('/en/')
    expect(getBasePath('/en/blog/public/article')).toBe('/en/blog/public/')
  })

})
