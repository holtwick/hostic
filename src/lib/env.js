// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright
// Adopted from https://github.com/motdotla/dotenv BSD-2

const fs = require('fs')
const path = require('path')

const log = require('debug')('hostic:env')

const NEWLINE = '\n'
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
const RE_NEWLINES = /\\n/g
const NEWLINES_MATCH = /\n|\r|\r\n/

// Parses src into an Object
function parse(src, options) {
  const obj = {}

  // convert Buffers before splitting into lines and processing
  src.toString().split(NEWLINES_MATCH).forEach(function (line, idx) {
    // matching "KEY' and 'VAL' in 'KEY=VAL'
    const keyValueArr = line.match(RE_INI_KEY_VAL)
    // matched?
    if (keyValueArr != null) {
      const key = keyValueArr[1]
      // default undefined or missing values to empty string
      let val = (keyValueArr[2] || '')
      const end = val.length - 1
      const isDoubleQuoted = val[0] === '"' && val[end] === '"'
      const isSingleQuoted = val[0] === '\'' && val[end] === '\''

      // if single or double quoted, remove quotes
      if (isSingleQuoted || isDoubleQuoted) {
        val = val.substring(1, end)

        // if double quoted, expand newlines
        if (isDoubleQuoted) {
          val = val.replace(RE_NEWLINES, NEWLINE)
        }
      } else {
        // remove surrounding whitespace
        val = val.trim()
      }

      obj[key] = val
    } else if (line?.trim()?.length > 1) {
      log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
    }
  })

  return obj
}

// Populates process.env from .env file
module.exports.setupEnv = function setupEnv(options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')
  let dotenvPathLocal = dotenvPath + '.local'

  let encoding = 'utf8'

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path
    }
    if (options.encoding != null) {
      encoding = options.encoding
    }
  }

  log(`env path=${dotenvPath}`)

  try {
    // specifying an encoding returns a string instead of a buffer
    const parsedEnv = fs.existsSync(dotenvPath) ? parse(fs.readFileSync(dotenvPath, { encoding })) : {}
    const parsedEnvLocal = fs.existsSync(dotenvPathLocal) ? parse(fs.readFileSync(dotenvPathLocal, { encoding })) : {}

    const parsed = Object.assign({}, parsedEnv, parsedEnvLocal)

    Object.keys(parsed).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        log(`set env ${key}=${parsed[key]}`)
        process.env[key] = parsed[key]
      } else {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`)
      }
    })

    return { parsed }
  } catch (e) {
    log('error', e)
    return { error: e }
  }
}

