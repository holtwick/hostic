const log = require("debug")("hostic:mw:file")
const { statSync, copyFileSync, readFileSync, writeFileSync } = require("fs")

export function file(source) {
  return async (ctx, next) => {
    log("start") //, source, ctx, next)
    // let opt = Object.assign({}, defaultOpt, pluginOpt, { path: ctx.file })
    ctx.body = readFileSync(source)
    await next()
    log("end")
  }
}
