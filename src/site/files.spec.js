import { files } from './files.js'

describe('Files', () => {

  it('should find and read files', () => {
    {
      let ff = files({
        basePath: __dirname,
        pattern: 'files.*',
      })
      expect(ff.length).toEqual(2)
      expect(ff).toEqual([
        {
          'basePath': __dirname,
          'ext': '.js',
          'fullPath': __dirname + '/files.js',
          'name': 'files',
          'path': 'files.js',
        },
        {
          'basePath': __dirname,
          'ext': '.js',
          'fullPath': __dirname + '/files.spec.js',
          'name': 'files.spec',
          'path': 'files.spec.js',
        },
      ])
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
