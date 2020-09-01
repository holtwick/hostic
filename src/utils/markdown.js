import { parseHTML } from '../html/vdomparser.js'
import { parse as parseYAML } from 'yaml'
import hljs from 'highlight.js'
import marked from 'marked'

const log = require('debug')('hostic:markdown')

function buildOutlineBS4(headers, level = 1, opt = {
  maxLevel: 2,
  class: {
    '1': 'nav flex-column',
    '2': 'nav flex-column',
    '3': 'nav flex-column',
    '4': 'nav flex-column',
    '5': 'nav flex-column',
  },
}) {
  let list = ''
  while (headers && headers.length > 0) {
    if (!list) {
      list += `<nav class="${opt.class[level.toString()]} nav-level-${level}">\n`
    }
    let h = headers[0]
    if (h) {
      if (h.level === level) {
        list += `<a class="nav-link nav-link-level-${level}" href="#${h.anchor}">${h.text}</a>\n`
        headers.shift()
        let hh = headers[0]
        if (hh && hh.level > level) {
          list += buildOutlineBS4(headers, level + 1)
        }
        // list += `</li>`
      } else if (h.level < level) {
        list += '</nav>\n'
        return list
      } else {
        if (level < opt.maxLevel) {
          list += buildOutlineBS4(headers, level + 1)
        } else {
          headers.shift()
        }
      }
    }
  }
  return list
}

export function parseMarkdownStructure(content) {
  let props = {}

  props.markdown = content.toString().replace(/^---([\s\S]*?)---/gi, function (_, propString) {
    Object.assign(props, parseYAML(propString.trim()))
    return ''
  })

  props.headline = props.title
  let c = props.markdown.trim()
  if (c.startsWith('# ')) {
    let headline = c.split('\n')[0].substr(2)
    props.headline = headline
    if (!props.title) {
      props.title = headline
    }
  }

  return props
}

export function parseMarkdown(content, opt = {}) {

  let {
    outline = false,
    stripHeadline = true,
    highlightCode = true,
  } = opt

  let props = parseMarkdownStructure(content)

  outline = outline || props.outline

  // https://github.com/chjj/marked

  let headers = []
  let ctr = 0
  let strippedTitle = false

  let renderer = new marked.Renderer()

  renderer.heading = function (text, level) {
    let anchor = null // text.toLowerCase().replace(/[^\w]+/g, '-')
    text = text.replace(/{#([^}]+)}/, (m, a) => {
      anchor = a
      return ''
    })
    if (stripHeadline && !strippedTitle && level === 1) {
      return ''
    }
    // let title = unescapeHTML(text)
    // if (!strippedTitle && title === props.title) {
    //   strippedTitle = true // avoid multiple strips
    //   return ''
    // }
    // if (!props.title && level === 1) {
    //   props.title = unescapeHTML(text)
    //   // return ''
    // }
    if (outline) {
      anchor = anchor || 'outline-' + ++ctr
      headers.push({
        level: +level,
        anchor,
        text: text.replace(/<.*?>/g, '').trim(),
      })
    }
    if (props.inc) {
      level = +level + +props.inc
    }
    if (anchor) {
      return `<h${level} data-anchor="${anchor}"><a id="${anchor}" name="${anchor}" class="anchor" href="#${anchor}">${text}</a></h${level}>`
      // return `<h${level} id="${anchor}"><a name="${anchor}" class="anchor" href="#${anchor}">${text}</a></h${level}>`
    }
    return `<h${level}>${text}</h${level}>`
  }

  let highlight
  if (highlightCode) {
    highlight = function (code, lang) {
      // console.log(lang);
      return hljs.highlightAuto(code, [lang]).value
    }
  }

  marked.setOptions({
    gfm: true, //  GitHub flavored markdown.
    highlight,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: props.sanitize == null ? false : props.sanitize,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-',
    renderer,
  })

  props.html = marked(props.markdown)
  props.body = parseHTML(props.html)
  if (outline) {
    props.outline = buildOutlineBS4(headers, headers[0].level)
    props.bodyOutline = parseHTML(props.outline)
  }

  if (typeof props.tags === 'string') props.tags = props.tags.split(',').map(s => s.trim())

  if (!props.tags) props.tags = []

  return props
}

export function markdown(content, opt = {}) {
  return parseMarkdown(content, opt)
}
