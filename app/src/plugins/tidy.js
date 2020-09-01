import { tidyDOM } from '../html/tidy.js'
import { vdom } from '../html/vdomparser.js'
import { TYPE_HTML } from '../site/types.js'

const log = require('debug')('hostic:mw:tidy')

const defaultOpt = {}

export function tidy(options = {}) {

  return {
    name: 'tidy',
    priority: 0.98,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      log('start')

      await next()

      let opt = Object.assign({},
        defaultOpt,
        options,
        ctx['tidy'] || {})

      if (ctx.type === TYPE_HTML) {

        // Make sure we have a VDOM
        ctx.body = vdom(ctx.body)

        // Changes everything in place
        tidyDOM(ctx.body, opt)
      }

      log('end')
    },
  }

}
