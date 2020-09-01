import { TYPE_HTML } from '../site/types.js'

export function sitemap(site, opt = {}) {
  let { excludes = [] } = opt

  site.text('sitemap.txt', ctx => {
    ctx.body = ctx.site.routes.entries().map(([path, { type, url }]) => {
      if (!excludes.includes(path)) {
        if (type === TYPE_HTML) {
          return url
        }
      }
    })
  })

  // https://www.sitemaps.org/protocol.html
  site.xml('sitemap.xml', ctx => {
    ctx.body =  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns__xhtml="http://www.w3.org/1999/xhtml">
      {
        site.routes.entries().map(([path, { type, url, priority, lang, alt, alternate }]) => {
          try {
            if (!excludes.includes(path)) {
              if (type === TYPE_HTML) {
                alt = alternate || alt
                return <url>
                  <loc>{url}</loc>
                  {priority && <priority>{(+priority).toFixed(1)}</priority>}
                  <xhtml__link rel="alternate" hrefLang={lang} href={url}/>
                  {
                    alt && Object.entries(alt).map(([lang, href]) => {
                      if (lang === '' || lang === '*') {
                        lang = 'x-default' // https://www.sistrix.de/frag-sistrix/onpage-optimierung/wie-nutze-ich-das-x-default-hreflang-link-attribut-richtig/
                      }
                      return <xhtml__link rel="alternate" hrefLang={lang} href={href}/>
                    })
                  }
                </url>
              }
            }
          } catch (err) {
            console.error(`Sitmap generation error at ${path}:`, err)
          }
        })
      }
    </urlset>
  })
}
