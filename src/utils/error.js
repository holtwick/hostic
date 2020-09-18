const { red, yellow } = require('chalk')

global.errorStats = {}

module.exports.clearErrorStats = function clearErrorStats() {
  global.errorStats.errors = 0
  global.errorStats.warnings = 0
  global.errorStats.messages = []
}

module.exports.getErrorStats = function getErrorStats() {
  return { ...global.errorStats }
}

module.exports.incrementErrorCount = function incrementErrorCount() {
  ++global.errorStats.errors
}

function prepareMessage(args) {
  const message = (args.map(a => a.toString()).join(' '))
  const now = new Date()
  let info = {
    message,
    datetime: now.toISOString(),
    timestamp: now.getTime()
  }
  global.errorStats.messages.push(info)
  return info
}

module.exports.error = function error(...args) {
  let msg = prepareMessage(args)
  console.error(red('\nError: ' + msg.message))
  incrementErrorCount()
  let err = args.find(a => a instanceof Error)
  if (err) {
    console.error(err)
  } else {
    console.trace()
  }
}

module.exports.warn = function warn(...args) {
  let msg = prepareMessage(args)
  console.error(yellow('\nWarning: ' + msg.message))
  ++global.errorStats.warnings
  let err = args.find(a => a instanceof Error)
  if (err) {
    console.warn(err)
  }
}

module.exports.clearErrorStats()
