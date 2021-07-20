// Inspired by https://github.com/aelbore/esbuild-jest#readme

const pkg = require("../package.json")
const esbuild = require("esbuild")
const { buildOptions } = require("./build-options.js")

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...buildOptions.external,
]
module.exports = {
  // https://jestjs.io/docs/en/troubleshooting#caching-issues
  getCacheKey() {
    return Math.random().toString()
  },

  process(content, filename) {
    let result = esbuild.buildSync({
      ...buildOptions,
      external,
      write: false,
      entryPoints: [filename],
    })
    return new TextDecoder("utf-8").decode(result.outputFiles[0].contents)
  },
}
