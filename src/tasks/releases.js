// (C)opyright 2020-10-22 Dirk Holtwick, holtwick.it. All rights reserved.

/*

  Source files do NOT follow semver for now, but this pattern:

      <name>-<major>.<minor>.<patch>b<beta>-<build>.zip

  `patch`, `beta` and `build` are optional

  Corresponding description files always have this pattern, avoiding `build`:

      <name>-<major>.<minor>.<patch>b<beta>.md

  Returns:

    - `entries`: Entries ordered by build and version, latest first
    - `latest`: The latest non beta version
    - `latestBeta`: The latest beta version, if not `latest` is newer, then `null`

 */

export function releases({
                           site,
                           files,
                           requiresMarkdown = false,
                         } = {}) {
  console.log('files', files)
  let entries = files
    .map(({ path }) => {
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
      // if (!existsSync(site.path(descPath))) {
      //   descPath = null
      // }

      if (!requiresMarkdown || descPath) {
        //   const stat = statSync(site.path(path)) || {}
        return {
          // date: stat.mtime, // creation time
          // size: stat.size,
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

  let latest = null
  let latestBeta = null

  for (let entry of entries) {
    if (!latest && !entry.beta) {
      latest = entry
      break
    }
    if (!latest && !latestBeta && entry.beta) {
      latestBeta = entry
    }
  }

  console.log('entries', entries)
  return {
    latest,
    latestBeta,
    entries
  }
}
