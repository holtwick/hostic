// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

import { error } from "./error.js"

const log = require("debug")("hostic:assert")

export function assert(cond, ...args) {
  if (!cond) {
    if (typeof console !== undefined) {
      if (console.assert) {
        // https://developer.mozilla.org/de/docs/Web/API/Console/assert
        console.assert(cond, ...args)
      }
      error(`Assert did fail with: ${cond}`, ...args)
    }
    // try {
    //   if (typeof expect !== undefined) {
    //     expect(cond).toBeTruthy()
    //   }
    // } catch (err) {
    //   console.warn('assert err', err)
    // }
  }
}

export function assert_equal(value, expected, ...args) {
  if (value !== expected) {
    assert(false, `Expected ${expected} got ${value}`, ...args)
  } else {
    log(`Passed equal check with value ${value}`, ...args)
  }
}
