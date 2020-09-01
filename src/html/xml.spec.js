// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

import { h } from './xml'

describe('HTML', () => {

  it('should xml', () => {
    let s = h('a', {
        href: 'example.com',
        empty: null,
        x: true,
        false: false,
      },
      h('hr'),
      h('b', {}, 'Welcome'))
    expect(s).toEqual('<a href="example.com" x="x"><hr /><b>Welcome</b></a>')
  })

  it('should use JSX', () => {
    let spread = {
      title: 'Hello',
      id: 'greeting',
    }
    let s = <a href="example.com" x {...spread}>
      <hr/>
      <b>Welcome</b></a>
    expect(s).toEqual('<a href="example.com" x="x" title="Hello" id="greeting"><hr /><b>Welcome</b></a>')
  })

})
