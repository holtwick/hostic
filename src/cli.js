#!/usr/bin/env node

require('source-map-support/register')

const hostic = require('./cli-main.js')
hostic.main().then().catch(err => {
  process.exit(1)
})
