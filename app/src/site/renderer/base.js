export async function render(context = {}) {
  let { body } = context

  // if (!type) {
  //   mime.gues
  // }

  if (typeof body === 'string') {
    return body
  }

  if (typeof body === 'function') {
    body = body(context)
  }

  if (body instanceof Promise) {
    body = await body
  }

  if (body && body.render) { // like VDOM
    body = body.render()
  }

  return body
}

export { render as baseRender }
