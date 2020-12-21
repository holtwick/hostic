import { xml } from "hostic-dom"

const log = require("debug")("hostic:render:html")

export async function render(ctx = {}) {
  log("Render ctx =", ctx)
  let { body } = ctx
  return '<?xml version="1.0" encoding="utf-8"?>\n' + body.render(xml)
}

export { render as xmlRender }
