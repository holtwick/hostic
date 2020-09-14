import { TYPE_HTML } from '../site/types.js'
import { TYPE_XML } from '../site/types.js'
import { assets } from '../site/links/assets.js'
import { absolute } from '../site/links/absolute.js'

export function links(opt = {}) {

  return {
    name: 'jsx',
    priority: 0.80,
    types: [TYPE_HTML, TYPE_XML],
    middleware: async (ctx, next) => {
      await next()

      assets({
        body: ctx.body,
        site: ctx.site,
        path: ctx.path,
        sourceFolder: ctx.site.sourcePath,
      })

      absolute({
        body: ctx.body,
        site: ctx.site,
        path: ctx.path,
      })

    },
  }

}
