const { setupEnv } = require('./lib/env.js')
const { startServer } = require('./server.js')
const { writeStatic } = require('./static.js')
const esbuild = require('esbuild')
const { resolve } = require('path')
const { buildOptions } = require('./build-options.js')
const { duration } = require('./utils/perfutil.js')

const log = require('debug')('hostic:main')
const BUNDLE = resolve('.hostic/bundle.js')
const sitePath = resolve('site')

let service
let bundle

async function performUserSetup() {
  try {
    global.basePath = sitePath
    return bundle?.default(sitePath)
  } catch (err) {
    console.error('Exception:', err)
  }
}

async function build() {
  log('Build...', BUNDLE)

  if (!service) {
    service = await esbuild.startService()
    log('ESBuild service', service)
  }

  // https://github.com/evanw/esbuild#command-line-usage
  const options = {
    ...buildOptions,
    outfile: BUNDLE,
    entryPoints: [sitePath + '/index.js'],
  }
  log('Build options', options)

  await service.build(options)

  delete require.cache[require.resolve(BUNDLE)]
  bundle = require(BUNDLE)

  return performUserSetup() // bundle?.default(sitePath)
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
