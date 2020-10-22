// (C)opyright 2020-10-22 Dirk Holtwick, holtwick.it. All rights reserved.

import { existsSync, statSync } from 'fs'

export function versions(files): Array<Object> {
  let pattern = new RegExp('\/.*\.(zip|exe|dmg|AppImage)$')

  let entries = files
    .filter(p => /\.\d+(b\d+)?(-\d+)?\.(zip|exe|dmg|AppImage)$/.test(p))
    .map(path => {
      const r = /(^.+[^\d.])(((\d+)\.(\d+)(\.(\d+))?(\.(\d+))?(b(\d+))?)(-(\d+))?)\.[^.]+$/.exec(path)
      // console.log('r', r)
      const prefix = r[1]
      const fullVersion = r[2]
      const version = r[3]
      const major = +r[4] || 0
      const minor = +r[5] || 0
      const patch = +r[7] || 0
      const fix = +r[9] || 0
      const beta = +r[11] || 0
      const build = +r[13] || 0

      let descPath = `${prefix}${version}.md`
      if (!existsSync(site.path(descPath))) {
        descPath = null
      }

      if (opt.skipMD || descPath) {
        const stat = statSync(site.path(path)) || {}
        return {
          date: stat.mtime, // creation time
          size: stat.size,
          major,
          minor,
          patch,
          fix,
          beta,
          version,
          fullVersion,
          build,
          // md,
          path,
          prefix,
          descPath,
        }
      }
    })
    .filter(o => !!o) // exclude empty ones
    .sort((a, b) => { // by build and version numbers
      let r
      r = a.build - b.build
      if (r === 0) {
        r = a.major - b.major
        if (r === 0) {
          r = a.minor - b.minor
          if (r === 0) {
            r = a.patch - b.patch
            if (r === 0) {
              r = a.fix - b.fix
              if (r === 0) {
                r = a.beta - b.beta
              }
            }
          }
        }
      }
      return r
    })
    .reverse()

  // console.log('entries', entries)
  return entries
}
