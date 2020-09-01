import * as p from 'path'

export function normalizePath(path) {
  if (typeof path !== 'string') {
    console.warn('Invalid path', path)
  }
  if (!path.startsWith('/')) {
    return '/' + path
  }
  return path
}

// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
export function parsePath(path) {
  if (path.endsWith('/')) {
    return {
      dir: path,
    }
  }
  return p.parse(path)
}

export function getBasePath(path) {
  let basePath = path
  if (!path.endsWith('/')) {
    basePath = path.replace(/[^/]*$/, '')
  }
  if (basePath.length <= 0) return '/'
  if (!basePath.startsWith('/')) basePath = '/' + basePath
  return basePath
}

// export function name(path) {
//   return p.parse(path)?.name
// }

