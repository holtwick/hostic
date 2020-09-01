import { vdom } from '../html/vdomparser.js'
import { hFactory } from '../html/h.js'
import { document } from '../html/vdom.js'
import { TYPE_HTML } from '../site/types.js'
import { TYPE_XML } from '../site/types.js'
import { assert } from '../utils/assert.js'

const log = require('debug')('hostic:mw:jsx')

export function jsx(opt = {}) {

  return {
    name: 'jsx',
    priority: 0.99,
    types: [TYPE_HTML, TYPE_XML],
    middleware: async (ctx, next) => {
      log('start', ctx)

      ctx.document = document
      ctx.body = vdom(ctx.body)

      assert(document)
      assert(ctx.body)

      // Fallback for those that forget the { h }
      global.h = hFactory(ctx)

      await next()

      // assets({
      //   body: ctx.body,
      //   basePath: ctx.site.sourcePath,
      //   site: ctx.site,
      // })
      //
      // absolute({
      //   body: ctx.body,
      //   site: ctx.site,
      //   path: ctx.path,
      // })

    },
  }

}
