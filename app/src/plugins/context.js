const log = require('debug')('hostic:mw:context')

export function context(ctxProperties = {}) {

  return async (ctx, next) => {
    log('start') // , ctx, next)
    if (!ctx) ctx = {}
    Object.assign(ctx, ctxProperties)
    await next()
    log('end')
  }

}
