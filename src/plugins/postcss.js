// import { resolve } from 'path'
const { readFileSync } = require('fs')
const postcss = require('postcss')
// const postcssrc = require('postcss-load-config')

const log = require('debug')('hostic:mw:postcss')

export function css(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    const css = readFileSync(source, 'utf8')
    // ctx.body = css

    const cssctx = { parser: true, map: 'inline' }
    // let { plugins = [] } = await import('./postcss.config.js') //  resolve(process.cwd(), 'postcss.config.css'))
    // const { plugins, options } = postcssrc.sync(cssctx)
    let plugins = []
    let result = await postcss(plugins).process(css, { from: source, to: source })
    ctx.body = result.css

    await next()

    log('end')
  }

}
