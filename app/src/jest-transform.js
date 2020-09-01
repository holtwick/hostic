// Inspired by https://github.com/aelbore/esbuild-jest#readme

const fs = require('fs')
const pkg = require('../package.json')
const esbuild = require('esbuild')
const { buildOptions } = require('./build-options.js')

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]

module.exports = {

  // https://jestjs.io/docs/en/troubleshooting#caching-issues
  getCacheKey() {
    return Math.random().toString()
  },

  process(content, filename) {
    let file = `.hostic/${Math.random()}.js`

    esbuild.buildSync({
      ...buildOptions,
      outfile: file,
      entryPoints: [filename],
      external,
    })

    let js = fs.readFileSync(file, 'utf-8')
    fs.unlinkSync(file)

    return js
  },
}
