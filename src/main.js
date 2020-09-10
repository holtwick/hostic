const { setupEnv } = require('./lib/env.js')
const { startServer } = require('./server.js')
const { writeStatic } = require('./static.js')
const esbuild = require('esbuild')
const { resolve } = require('path')
const { buildOptions } = require('./build-options.js')
const { duration } = require('./utils/perfutil.js')

const log = require('debug')('hostic:main')

// const BUNDLE = resolve('.hostic/bundle.js')
const sitePath = resolve('site')

let service
// let bundle
let code

async function performUserSetup() {
  try {
    global.basePath = sitePath

    if (code) {
      code = `(function(exports) {
        ${code}
        return exports;
      })({})`
      let result = eval(code)
      // console.log('code =', code)
      console.log('result =', result)
      return result.default(sitePath)
    }
    // if (bundle) {
    //   return bundle.default(sitePath)
    // }
  } catch (err) {
    console.error('Exception:', err)
  }
}

async function build() {
  log('Build...')

  if (!service) {
    service = await esbuild.startService()
    log('ESBuild service', service)
  }

  // https://github.com/evanw/esbuild#command-line-usage
  const options = {
    ...buildOptions,
    // outfile: BUNDLE,
    entryPoints: [sitePath + '/index.js'],
    write: false,
  }
  log('Build options', options)

  let result = await service.build(options)

  code = new TextDecoder('utf-8').decode(result.outputFiles[0].contents)

  // delete require.cache[require.resolve(BUNDLE)]
  // bundle = require(BUNDLE)

  return performUserSetup()
}

async function main() {
  let time = duration()

  setupEnv()

  // console.log('env =', process.env.BASE_URL)

  // BUILD STATIC SITE
  const STATIC = process.argv.includes('--build') || process.argv.includes('build')
  if (STATIC) {
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
    let site = await build()
    await writeStatic({ site, time })
    process.exit()
  }

  // DYNAMIC PREVIEW SERVER
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
  }

  startServer({
    performUserSetup,
    sitePath,
    build,
    time,
  })
}

module.exports.main = main
