import { vdom, createHTMLDocument } from 'hostic-dom'
import { TYPE_HTML } from '../site/types.js'

const log = require('debug')('hostic:mw:html')

// const defaultOpt = {}

export function html(opt = {}) {

  return {
    name: 'html',
    priority: 0.5,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      log('start', ctx, next)

      // let opt = Object.assign({}, defaultOpt, opt, ctx['tidy'])

      let { path, site } = ctx

      await next()

      // Add the general document structure with html, head, body
      ctx.body = vdom(ctx.body)
      if (ctx.body.ownerDocument == null) {
        const document = createHTMLDocument()
        let htmlBody = ctx.body.querySelector('body')
        if (htmlBody == null) {
          document.body.appendChild(ctx.body)
        } else {
          document.body.replaceWith(htmlBody)
          let htmlHead = ctx.body.querySelector('head')
          if (htmlHead) {
            document.head.replaceWith(htmlHead)
          }
        }
        ctx.body = document
      }

      // Move head stuff to right location
      ctx.body.querySelectorAll('meta, link, style, title').forEach(e => {
        if (e?.parentNode?.tagName !== 'HEAD') {
          ctx.body.head.appendChild(e)
        }
      })

      // Use ctx.title as page title, if not yet set
      if (!ctx.body.title && ctx.title) {
        ctx.body.title = ctx.title
      }

      log('end')
    },
  }

}
