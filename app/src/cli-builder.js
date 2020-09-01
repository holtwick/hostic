const esbuild = require('esbuild')
const { resolve } = require('path')
const fs = require('fs')
const { buildOptions } = require('./build-options.js')

const log = require('debug')('hostic:cli-builder')

const BUNDLE = resolve('.hostic/cli.js')

// BUILD - ESBUILD

async function build() {
  log('Build CLI ...', BUNDLE)

  // https://github.com/evanw/esbuild#command-line-usage
  const options = {
    ...buildOptions,
    write: false,
    entryPoints: ['./src/cli.js'],
  }

  log('Build options', options)

  let { outputFiles } = await esbuild.build(options)

  let file = fs.openSync('./cli.js', 'w', 0o755)
  fs.writeSync(file, '#!/usr/bin/env node\n\n')
  fs.writeSync(file, outputFiles[0].contents)
  fs.closeSync(file)
}

build().then()
