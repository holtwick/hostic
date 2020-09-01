const { statSync, copyFileSync, readFileSync, writeFileSync } = require('fs')
const { join, dirname } = require('path')
const { mkdir, walkSync } = require('./fileutil')

const log = require('debug')('hostic:foldermanager')


function isPattern(pattern) {
  return pattern != null && (
    pattern instanceof RegExp ||
    typeof pattern === 'string' ||
    Array.isArray(pattern))
}

function pathMatchesPatterns(path, patterns) {
  let result = (() => {
    if (!Array.isArray(patterns)) {
      patterns = [patterns]
    }
    for (let pattern of patterns) {
      if (typeof pattern === 'string') {

        // Strip leading /
        if (pattern.indexOf('/') === 0) {
          pattern = pattern.substring(1)
        }

        // Match folder ?
        if (pattern[pattern.length - 1] === '/') {
          if (path.indexOf(pattern) === 0) {
            return true
          }
        } else if (path === pattern) {
          return true
        }
      } else if (pattern instanceof RegExp) {
        pattern.lastIndex = 0
        if (pattern.test(path)) {
          return true
        }
      }
    }
    return false
  })()
  // console.info(result, path, patterns)
  return result
}

function filterByPatterns(paths, patterns, exclude) {
  return (paths || [])
    .filter(file => {
      if (pathMatchesPatterns(file, patterns || [])) {
        if (isPattern(exclude)) {
          return !pathMatchesPatterns(file, exclude || [])
        }
        return true
      }
      return false
    })
}

class FolderManager {

  // opt: Object
  // basePath: string
  // log: Function

  constructor(srcPath, basePath, opt = {
    excludePatterns: null,
    includePatterns: null,
    baseURL: '',
  }) {
    // log('Site', srcPath, basePath, opt)

    this.opt = opt

    // Filter files
    this.files = walkSync(srcPath)

    this.srcPath = srcPath
    this.dstPath = basePath
  }

  // Paths

  path(urlPath) {
    return join(this.srcPath, urlPath)
  }

  destinationPath(urlPath) {
    return join(this.dstPath, urlPath)
  }

  // All URL paths matching pattern
  paths(pattern, exclude) {
    let urlPaths = filterByPatterns(
      this.files, // walkSync(this.basePath),
      pattern,
      exclude)
    urlPaths.sort()
    return urlPaths
  }

  pathsRX(pattern) {
    return this.files.map(f => {
      pattern.lastIndex = 0
      return f.match(pattern)
    }).filter(m => m != null)
  }

  exists(urlPath) {
    try {
      let p = this.path(urlPath)
      return !!statSync(p)
    } catch (err) {

    }
    return false
  }

  // URLs

  url(path) {
    if (path[0] !== '/') {
      path = '/' + path
    }
    return path
  }

  publicURL(path) {
    if (this.opt.publicURL) {
      return this.opt.publicURL(this.url(path))
    }
    return this.opt.baseURL + this.url(path)
  }

  // absoluteURL(path: string): string {
  //     return this.opt.baseURL + this.url(path)
  // }

  // File Actions

  copy(fromPath, toPath) {
    toPath = toPath || fromPath
    fromPath = this.path(fromPath)
    toPath = this.destinationPath(toPath)
    console.debug(`copy ... ${fromPath} -> ${toPath}`)
    mkdir(dirname(toPath))
    copyFileSync(fromPath, toPath)
  }

  // copyNPM(moduleName, fromRelativePath, toPath) {
  //   console.debug(`copy npm module ${moduleName}/${fromRelativePath} -> ${toPath}`)
  //   let p = require.resolve(moduleName, {
  //     paths: [process.cwd()],
  //   })
  //   console.assert(!!p, `[site.copyNPM] Could not resolve module ${moduleName}`)
  //   let rx = /^.*\/node_modules\/[^\/]+/gi
  //   let m = rx.exec(p)
  //   console.assert(!!m, `[site.copyNPM] Could not resolve main path ${p} / ${this.basePath}`)
  //   if (m) {
  //     p = m[0]
  //     p = join(p, fromRelativePath)
  //     console.assert(existsSync(p), `[site.copyNPM] Path ${p} does not exist`)
  //     let d = this.destinationPath(toPath)
  //     mkdir(d)
  //     fsxCopySync(
  //       p,
  //       d)
  //   }
  // }

  // Read / Write

  read(urlPath) {
    try {
      if (urlPath[0] === '/') {
        urlPath = urlPath.substring(1)
      }
      let inPath = join(this.srcPath, urlPath)
      // log('read', urlPath, inPath)
      return readFileSync(inPath)
    } catch (ex) {
      console.error('Failed to .read file:', urlPath)
    }
    return null
  }

  write(urlPath, content) {
    if (urlPath[0] === '/') {
      urlPath = urlPath.substring(1)
    }
    let outPath = join(this.dstPath, urlPath)
    mkdir(dirname(outPath))
    console.debug(`write ... ${outPath}`)

    if (typeof content !== 'string') {
      content = content.toString()
    }
    writeFileSync(outPath, content, {
      mode: 0o644,
    })
  }

  stat(path) {
    return statSync(this.path(path))
  }

}

module.exports = {
  isPattern,
  pathMatchesPatterns,
  filterByPatterns,
  FolderManager,
}
