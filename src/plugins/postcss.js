const log = require('debug')('hostic:mw:postcss')

const { readFileSync } = require('fs')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')

export function css(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    const css = readFileSync(source, 'utf8')
    const cssctx = { parser: true, map: 'inline' }
    const { plugins, options } = postcssrc.sync(cssctx)
    let result = await postcss(plugins).process(css, { from: source, to: source })
    ctx.body = result.css

    await next()

    log('end')
  }

}
