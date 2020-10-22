import { files } from './files.js'
import { getStat } from './files.js'

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
      let ff = files({ pattern: /^[^/]*\.json$/, stat: true })
      expect(ff.length).toEqual(2)
      expect(ff[0].stat.size).toEqual(217357)
    }
    {
      let ff = files({ basePath: 'src/site/renderer' })
      expect(ff.length).toEqual(6)
    }
  })

  it('should stat', () => {
    let stat = getStat('12345')
    expect(stat).toEqual(null)
  })

})
