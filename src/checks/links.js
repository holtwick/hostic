import { warn } from '../utils/error.js'
import { error } from '../utils/error.js'
import { TYPE_HTML } from '../site/types.js'
import { parseHTML } from 'hostic-dom'

export async function checkLinks(site) {
  const routes = site.routes
  let paths = [...routes.keys()]
  let issues = 0
  for (let path of paths) {
    try {
      let { type } = routes.get(path)
      if (type === TYPE_HTML) {
        let { content } = await routes.render(path, { site })
        let body = parseHTML(content)
        body.querySelectorAll('a[href]').forEach(el => {
          if (el.getAttribute('data-ignore-check') == null) {
            let href = el.getAttribute('href')
            if (href.startsWith('/') && !href.startsWith('/goto/')) {
              href = href.replace(/[#?].*$/, '')
              if (!site.routes.has(href)) {
                warn(`Invalid link to ${href} "${el.textContent}" (found in ${path})`)
                issues += 1
                // incrementErrorCount()
              }
            }
          }
        })
      }
    } catch (err) {
      error(err)
      issues += 1
    }
  }
  return {
    name: 'Check internal links',
    success: issues === 0,
    issues,
  }
}
