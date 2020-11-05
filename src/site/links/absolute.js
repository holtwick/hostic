import { resolve } from 'url'

/*

  Identifies local links:
  - Remove baseURL if found

 */

export function absolute({
                           body,
                           path,
                           site,
                           targetBlank = true,   // Add target=_blank for external links
                           allAbsolute = false,  // Add baseURL to all local links
                         }) {
  body.handle('a[href]', e => {
    let href = e.getAttribute('href')
    if (/^(mailto:|data:|https?:|\/goto\/)/.test(href)) {
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
