const { red, yellow } = require("chalk")

global.errorStats = {}
global.errorCallback = null

function clearErrorStats() {
  global.errorStats.errors = 0
  global.errorStats.warnings = 0
  global.errorStats.messages = []
}

clearErrorStats()

//

function getErrorStats() {
  return { ...global.errorStats }
}

function incrementErrorCount() {
  ++global.errorStats.errors
}

function setErrorCallback(fn = null) {
  global.errorCallback = fn
}

function prepareMessage(args, level) {
  const message = args.map((a) => a.toString()).join(" ")
  const now = new Date()
  let info = {
    message,
    level,
    datetime: now.toISOString(),
    timestamp: now.getTime(),
  }
  global.errorStats.messages.push(info)
  if (global.errorCallback) {
    global.errorCallback(info)
  }
  return info
}

function error(...args) {
  let msg = prepareMessage(args, "error")
  // console.error(red('\nError: ' + msg.message))
  console.error(red("\n" + msg.message))
  incrementErrorCount()
  let err = args.find((a) => a instanceof Error)
  if (err) {
    console.error(err)
    // } else {
    //   console.trace()
  }
}

function warn(...args) {
  let msg = prepareMessage(args, "warn")
  // console.error(yellow('\nWarning: ' + msg.message))
  console.warn(yellow("\n" + msg.message))
  ++global.errorStats.warnings
  let err = args.find((a) => a instanceof Error)
  if (err) {
    console.warn(err)
  }
}

module.exports = {
  clearErrorStats,
  getErrorStats,
  incrementErrorCount,
  error,
  warn,
  setErrorCallback,
}
