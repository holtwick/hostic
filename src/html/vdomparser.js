// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

import { VDocumentFragment, VElement, VTextNode, document } from './vdom'
import { VNode } from './vdom'
import { Parser } from 'htmlparser2'

// Makes sure we operate on VNodes
export function vdom(obj = null) {
  if (obj instanceof VNode) {
    return obj
  }
  if (obj instanceof Buffer) {
    obj = obj.toString('utf-8')
  }
  if (typeof obj === 'string') {
    return parseHTML(obj)
  }
  // console.warn('Cannot convert to VDOM:', obj)
  return new VElement('div')
}

export function parseHTML(html) {
  let frag = new VDocumentFragment()

  let stack = [frag]
  let currentElement = frag

  let parser = new Parser({
    onopentag: (name, attrs) => {
      let element = document.createElement(name, attrs)
      stack.push(element)
      currentElement.appendChild(element)
      currentElement = element
    },
    ontext: function (text) {
      if (currentElement?.lastChild?.nodeType === VNode.TEXT_NODE) {
        currentElement.lastChild._text += text
      } else {
        currentElement.appendChild(new VTextNode(text))
      }
    },
    onclosetag: function (name) {
      let element = stack.pop()
      currentElement = stack[stack.length - 1]
      // if (element.nodeName !== currentElement.nodeName) {
      //   console.log('error', element, currentElement)
      // }
    },
  }, { decodeEntities: true })
  parser.write(html)
  parser.end()

  // console.log('frag', frag.innerHTML)

  return frag
}

VElement.prototype.setInnerHTML = function (html) {
  let frag = parseHTML(html)
  this._childNodes = frag._childNodes
  this._fixChildNodesParent()
}
