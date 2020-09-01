import { files } from './files.js'

describe('Files', () => {

  it('should find and read files', () => {
    {
      let ff = files({ pattern: '*.json' })
      expect(ff.length).toEqual(2)
    }
    {
      let ff = files({ pattern: /^[^/]*\.json$/ })
      expect(ff.length).toEqual(2)
    }
    {
      let ff = files({ basePath: 'src/site/renderer' })
      expect(ff.length).toEqual(6)
    }
  })

})
