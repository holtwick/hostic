// Append HTML to body like tracking code from Umami etc.

import { parseHTML } from "zeed-dom"
import { TYPE_HTML } from "../site/types.js"

export function append(pluginOpt = {}) {
  return {
    name: "append",
    priority: 0.6,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      await next()
      let { html = "" } = Object.assign({}, pluginOpt, ctx.append || {})
      if (html) {
        // console.log("html", html)
        let body = ctx.body.ownerDocument.body
        body.appendChild(parseHTML(html))
      }
    },
  }
}
