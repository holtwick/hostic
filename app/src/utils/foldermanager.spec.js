import { filterByPatterns } from './foldermanager.js'
import { FolderManager } from './foldermanager.js'
import { join } from 'path'

describe('Site', () => {

  const files = [
    'index.html',
    'readme.md',
    'php/index.html',
    'php/todo.php',
    'img/logo.png',
  ]

  it('should apply patterns correctly', () => {
    expect(filterByPatterns(files, 'unknown')).toEqual([])
    expect(filterByPatterns(files, 'index.html')).toEqual([
      'index.html',
    ])
    expect(filterByPatterns(files, /\.html/)).toEqual([
      'index.html',
      'php/index.html',
    ])
    expect(filterByPatterns(files, /\.html/, 'php')).toEqual([
      'index.html',
      'php/index.html',
    ])
    expect(filterByPatterns(files, /\.html/, 'php/')).toEqual([
      'index.html',
    ])
    expect(filterByPatterns(files, [/\.html/], ['php/'])).toEqual([
      'index.html',
    ])
    expect(filterByPatterns(files, ['php/'], [/html/])).toEqual([
      'php/todo.php',
    ])
  })

  it('should collect files', () => {
    let site = new FolderManager(join(__dirname, '..'))
    // console.log(__dirname)
    expect(site.files.length).toBeGreaterThan(0)
    let blog = site.paths(/utils\/.*?.js/)
    // console.log('blog', blog)
    expect(blog.length).toBeGreaterThan(0)

    // let mms = site.pathsRX(/blog\/(.*?).md/)
    // console.log(mms)
  })

})
