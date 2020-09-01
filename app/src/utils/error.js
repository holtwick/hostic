const { red, yellow } = require('chalk')

global.errorStats = {}

module.exports.clearErrorStats = function clearErrorStats() {
  global.errorStats.errors = 0
  global.errorStats.warnings = 0
}

module.exports.getErrorStats = function getErrorStats() {
  return { ...global.errorStats }
}

module.exports.error = function error(...args) {
  console.error(red('Error: ' + (args.map(a => a.toString()).join(' '))))
  ++global.errorStats.errors
}

module.exports.warn = function warn(...args) {
  console.error(yellow('Warning: ' + (args.map(a => a.toString()).join(' '))))
  ++global.errorStats.warnings
}

module.exports.clearErrorStats()
