const { performance } = require('perf_hooks')

module.exports.duration = function () {
  const t0 = performance.now()

  return function () {
    const t1 = performance.now()
    const duration = t1 - t0
    if (duration > 500) {
      return `${(duration / 1000).toFixed(4)}s`
    }

    // https://elijahmanor.com/format-js-numbers
    // https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier
    return duration.toLocaleString('en-US', {
      style: 'unit',
      unit: 'millisecond',
      notation: 'compact',
      compactDisplay: 'long',
    })
  }
}
