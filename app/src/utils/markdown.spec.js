import { markdown } from './markdown'

describe('Markdown', () => {

  it('parses correctly', () => {
    let r = markdown('Hello **world**')
    expect(r.markdown).toEqual('Hello **world**')
    expect(r.html).toEqual('<p>Hello <strong>world</strong></p>\n')
    // expect(r).toEqual({})
  })

  it('parses properties', () => {
    let r = markdown(`---
title: One World
---

# This is a world

\`\`\`js
alert(1)
alert(2)
\`\`\`        

Lorem **ipsum**
`)
    expect(r.title).toEqual('One World')
    expect(r.headline).toEqual('This is a world')
    expect(r.html).toBe('<pre><code class="lang-js">alert(1)\nalert(2)</code></pre>\n<p>Lorem <strong>ipsum</strong></p>\n')
  })

})
