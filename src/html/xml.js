import { markup } from './html.js'
import { hArgumentParser } from './h.js'

export function xml(itag, iattrs, ...ichildren) {
  let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren)
  return markup(true, tag, attrs, children)
}

xml.firstLine = '<?xml version="1.0" encoding="utf-8"?>'
xml.xml = true

export let h = xml
