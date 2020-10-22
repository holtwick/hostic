const { parse } = require('path')

module.exports.normalizePath = function normalizePath(path, isFolder = false) {
  if (typeof path !== 'string') {
    console.warn('Invalid path', path)
  }
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  if (isFolder && !path.endsWith('/')) {
    path = path + '/'
  }
  return path
}

// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
module.exports.parsePath = function parsePath(path) {
  if (path.endsWith('/')) {
    return {
      dir: path,
    }
  }
  return parse(path)
}

module.exports.getBasePath = function getBasePath(path) {
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

