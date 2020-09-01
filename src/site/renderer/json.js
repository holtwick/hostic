import { baseRender } from './base.js'

export async function render(context = {}) {
  let { body } = context

  body = await baseRender({
    ...context,
    body,
  })

  if (typeof body === 'object') {
    body = JSON.stringify(body, null, 2)
  }

  return body
}

export { render as jsonRender }
