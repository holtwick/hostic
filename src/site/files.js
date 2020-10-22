import minimatch from 'minimatch'
import { parsePath } from '../utils/pathutil.js'
import { warn } from '../utils/error.js'

const { statSync, readFileSync } = require('fs')
const { resolve } = require('path')
const { walkSync } = require('../utils/fileutil')

const log = require('debug')('hostic:files')

let cache = {}

export function getContent(path) {
  try {
    // let content = cache[path]
    // if (!content) {
    let content = readFileSync(path)
    //   cache[path] = content
    // }
    return content
  } catch (err) {
    warn('Can\'t get content of', path)
  }
}

export function getStat(path) {
  return statSync(path)
}

function getBasePath(basePath = null) {
  return resolve(global.basePath || process.cwd(), basePath || '.')
}

function file(path, {basePath = null}) {
  if (basePath == null) {
    basePath = getBasePath()
  }
  const fullPath = resolve(basePath, path)
  let { name, ext } = parsePath(path)

  return {
    path,
    basePath,
    fullPath,
    name,
    ext,
  }
}

export function files({
                        basePath,
                        pattern,
                        filter,
                        path,
                        dotfiles = 'ignore',
                        // extensions = []
                      } = {}) {
  // Filter files
  basePath = getBasePath(basePath)
  log('basePath', basePath)

  let paths = walkSync(basePath)

  paths = paths.filter(path => !(
    dotfiles === 'ignore' && (
      path.startsWith('.') || path.includes('/.')
    )
  ))

  if (path) {
    if (path.startsWith('/')) {
      path = path.substr(1)
    }
    if (!path.endsWith('/')) {
      path += '/'
    }
    paths = paths.filter(p => p.startsWith(path))
  }

  if (pattern) {
    if (typeof pattern === 'string') {
      // https://www.npmjs.com/package/minimatch
      pattern = minimatch.makeRe(pattern)
    }
    if (pattern instanceof RegExp) {
      pattern.lastIndex = 0
      paths = paths.filter(path => pattern.test(path))
    }
  }

  if (filter) {
    paths = paths.filter(path => filter(path))
  }

  return paths.map(path => {
    log('path', path)
    return file(path, { basePath })
  })
}
