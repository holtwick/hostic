import { resolve } from 'url'

export function absolute({ body, path, site, targetBlank = true, allAbsolute = false }) {
  body.handle('a[href]', e => {
    let href = e.getAttribute('href')
    if (/^(mailto:|data:|https?:)/.test(href)) {
      if (!allAbsolute) {
        if (href.startsWith(site.baseURL)) {
          e.setAttribute('href', href.substr(site.baseURL.length))
        } else if (targetBlank) {
          e.setAttribute('target', '_blank')
          e.setAttribute('rel', 'noopener noreferrer')
          e.classList.add('external')
        }
      }
    } else if (!href.startsWith('#')) {
      if (href === '') href = '.'
      let url = resolve(path, href)
      if (allAbsolute) {
        url = resolve(site.baseURL, url)
      }
      e.setAttribute('href', url)
    } else if (allAbsolute) {
      e.setAttribute('href', site.baseURL + href)
    }
  })

}
