import { baseRender } from './base.js'
import { stringify } from 'yaml'

export async function render(context = {}) {
  let { body } = context

  body =  await baseRender({
    ...context,
    body,
  })

  if (typeof body === 'object') {
    body = stringify(body, null, 2)
  }

  return body
}

export { render as yamlRender }
