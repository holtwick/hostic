import { resolve as resolvePath } from 'path'
import { resolve as resolveURL } from 'url'

import { ASSETS_BASE_PATH } from '../../config.js'
import { hash } from '../../lib/hash.js'
import { handleLinks } from './handle.js'
import { getContent } from '../files.js'
import { optimizeImage } from './optimize.js'
import { error } from '../../utils/error.js'

const log = require('debug')('hostic:links:assets')

export function assets({ body, site, path = '/', sourceFolder, allAbsolute = false }) {
  let routes = site.routes
  handleLinks(body, ({ href, element, isAsset, isInternal }) => {
    if (isAsset || !isInternal) return

    let m = href.match(/([^\/]*?)\.([^.]+)$/)
    if (m) {
      let [, name, ext] = m
      let url = resolveURL(path, href)
      // console.log('url', path, href)
      if (ext?.length > 0 && ext !== 'html' && ext !== 'xml' && !routes.has(url)) {
        if (href.startsWith('/')) {
          href = href.substring(1)
        }
        let filePath = resolvePath(sourceFolder, href)
        let data = getContent(filePath)
        if (data) {

          if (element.tagName === 'IMG') {
            optimizeImage({ data, element, src: href })
          }

          let newHref = `${ASSETS_BASE_PATH}/${name}-${hash(data).slice(0, 8)}.${ext}`
          routes.set(newHref, {
            next: async ctx => ctx.body = data,
          })
          if (allAbsolute) {
            return resolveURL(site.baseURL, newHref)
          }
          return newHref
        } else {
          error('Empty or not existing file at', filePath, 'referred to by', href)
        }
      }

      if (allAbsolute) {
        return resolveURL(site.baseURL, url)
      }
    }
  })
}
