const { red, yellow } = require('chalk')

global.errorStats = {}

module.exports.clearErrorStats = function clearErrorStats() {
  global.errorStats.errors = 0
  global.errorStats.warnings = 0
}

module.exports.getErrorStats = function getErrorStats() {
  return { ...global.errorStats }
}

module.exports.incrementErrorCount = function incrementErrorCount() {
  ++global.errorStats.errors
}

module.exports.error = function error(...args) {
  console.error(red('\nError: ' + (args.map(a => a.toString()).join(' '))))
  incrementErrorCount()
  let err = args.find(a => a instanceof Error)
  if (err) {
    console.error(err)
  } else {
    console.trace()
  }
}

module.exports.warn = function warn(...args) {
  console.error(yellow('\nWarning: ' + (args.map(a => a.toString()).join(' '))))
  ++global.errorStats.warnings
  let err = args.find(a => a instanceof Error)
  if (err) {
    console.warn(err)
  }
}

module.exports.clearErrorStats()
