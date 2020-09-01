// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

import { parseHTML } from './vdomparser'

describe('VDOM Parser', () => {

  it('should work with js', () => {
    const html = 'Xyz <script type="text/javascript">var foo = \'<<bar>>\';</script>'
    let frag = parseHTML(html)
    let rhtml = frag.render()
    expect(rhtml).toBe('Xyz <script type="text/javascript">var foo = \'<<bar>>\';</script>')
    expect(rhtml).toBe(html)
  })

  it('should respect nested', () => {
    const html = '<div><h1>Test</h1><p>Lorem <a href="#" style="font-wAIGHT: bold;;">ipsum</a></p></div>'
    let frag = parseHTML(html)
    let rhtml = frag.render()
    // expect(rhtml).toBe('Xyz <script type="text/javascript">var foo = \'<<bar>>\';</script>')
    expect(rhtml).toBe(html)
  })

})
