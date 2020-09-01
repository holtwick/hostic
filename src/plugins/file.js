const log = require('debug')('hostic:mw:file')

export function file(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)
    // let opt = Object.assign({}, defaultOpt, pluginOpt, { path: ctx.file })
    ctx.body = ctx.site.folderManager.read(source)
    await next()
    log('end')
  }

}
