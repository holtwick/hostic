// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright
// Adopted from https://github.com/jczaplew/csv-express MIT

import { ServerResponse } from "http"

const res = ServerResponse.prototype

// Configurable settings
export const separator = ","
export const preventCast = false
export const ignoreNullOrUndefined = true

// Stricter parseFloat to support hexadecimal strings from
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/parseFloat#A_stricter_parse_function
function filterFloat(value) {
  if (/^([-+])?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
    return Number(value)
  }
  return NaN
}

function escape(field) {
  if (ignoreNullOrUndefined && field === undefined) {
    return ""
  }
  if (preventCast) {
    return '="' + String(field).replace(/"/g, '""') + '"'
  }
  if (!isNaN(filterFloat(field)) && isFinite(field)) {
    return parseFloat(field)
  }
  return '"' + String(field).replace(/"/g, '""') + '"'
}

res.csv = function (data, headerRow, headers, status) {
  let body = ""
  let statusCodeSet = true

  this.charset = this.charset || "utf-8"
  this.header("Content-Type", "text/csv")

  // Set custom headers
  if (headers && headers instanceof Object) {
    // Use res.header() instead of res.set() to maintain backward compatibility with Express 2
    // Change to res.set() in next major version so that iteration is not required
    Object.keys(headers).forEach(
      function (header) {
        this.header(header, headers[header])
      }.bind(this)
    )
  }

  // Set response status code
  if (status && Number.isInteger(status)) {
    // res.status does not work in Express 2, so make sure the error would be trapped
    try {
      this.status(status)
    } catch (error) {
      statusCodeSet = false
    }
  }

  // Append the header row to the response if requested
  if (headerRow) {
    body = headerRow.join(separator) + "\r\n"
  }

  // Convert the data to a CSV-like structure
  for (let i = 0; i < data.length; i++) {
    body += data[i].map(escape).join(separator) + "\r\n"
  }

  if (!statusCodeSet) {
    return this.send(body, status)
  }

  return this.send(body)
}
