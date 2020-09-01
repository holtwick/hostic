import { error } from '../../utils/error.js'

const log = require('debug')('hostic:render:html')

export async function callRenderer(renderer, context, body) {
  let result
  let originalBody = context.body
  try {
    context.body = body
    result = await renderer(context)
  } catch (err) {
    error('Exception:', err)
  }
  context.body = originalBody
  return result
}

export async function render(ctx = {}) {
  log('Render ctx =', ctx)
  let { body } = ctx
  return body.render()
}

export { render as htmlRender }
