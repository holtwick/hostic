import {warn} from "../utils/error"

const { readFileSync } = require('fs')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')

// Add clean-css minification?
// https://github.com/jakubpawlowicz/clean-css
// npm install --save-dev clean-css

const log = require('debug')('hostic:mw:postcss')

export function css(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    const css = readFileSync(source, 'utf8')

    try {
      // https://www.npmjs.com/package/postcss-load-config#sync
      const {plugins, options} = postcssrc.sync({parser: true, map: 'inline'})

      let result = await postcss(plugins).process(css, {from: source, to: source})
      ctx.body = result.css
    }
    catch (e) {
      warn("Problems with PostCSS setup", e)
      ctx.body = source
    }

    await next()

    log('end')
  }

}
