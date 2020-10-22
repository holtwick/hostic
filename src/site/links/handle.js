import { ASSETS_BASE_PATH } from '../../config.js'

const log = require('debug')('hostic:links')

const urlElements = [
  { tag: 'a', attr: 'href' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
  { tag: 'img', attr: 'src' },
]

export function handleLinks(body, handler, {
  site,
} = {}) {
  for (let info of urlElements) {
    let elements = body.querySelectorAll(`${info.tag}[${info.attr}]`)
    if (elements) {
      for (let element of elements) {
        let href = element.getAttribute(info.attr) || ''

        // #hello
        let isAnchor = href.startsWith('#')

        // http://
        let isExternal = /^(mailto:|data:|https?:)/.test(href) || element?.getAttribute('data-download') || element?.classList?.contains('download')

        // /favicon.ico
        let isInternal = !isExternal && !isAnchor

        // Not leaving the own website
        let isLocal = site && (isAnchor || !isExternal || (isExternal && href.startsWith(site.baseURL)))

        let isAsset = href.startsWith(ASSETS_BASE_PATH)

        let newHref = handler({
          href,
          element,
          isLocal,
          isExternal,
          isInternal,
          isAnchor,
          isAsset,
        })
        if (newHref != null) {
          element.setAttribute(info.attr, newHref)
        }
      }
    }
  }
}
