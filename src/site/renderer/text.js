import { baseRender } from "./base.js"

export async function render(context = {}) {
  let { body } = context

  body = await baseRender({
    ...context,
    body,
  })

  if (Array.isArray(body)) {
    body = body
      .filter((l) => l != null)
      .map((l) => l.toString())
      .join("\n")
  }

  return body
}

export { render as textRender }
