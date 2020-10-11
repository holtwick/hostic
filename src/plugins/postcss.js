const { readFileSync } = require('fs')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')

const log = require('debug')('hostic:mw:postcss')

export function css(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    const css = readFileSync(source, 'utf8')

    // https://www.npmjs.com/package/postcss-load-config#sync
    const { plugins, options } = postcssrc.sync({ parser: true, map: 'inline' })

    let result = await postcss(plugins).process(css, { from: source, to: source })

    ctx.body = result.css

    await next()

    log('end')
  }

}
