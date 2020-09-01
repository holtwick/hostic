// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

const crypto = require('crypto')

export function hash(value) {
  return crypto
    .createHash('sha256')
    .update(value, 'utf8')
    .digest('hex')
}
