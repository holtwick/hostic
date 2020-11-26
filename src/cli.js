#!/usr/bin/env node

require("./code-utils")

const hostic = require("./cli-main.js")
hostic.main().then().catch(err => {
  process.exit(1)
})
