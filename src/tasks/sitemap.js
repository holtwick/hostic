import { TYPE_HTML } from "../site/types.js"

/*

  Generates sitemaps in TXT and XML format

  Property `excludes` can hold a list of paths that should be excluded from the list.

  If `priority` is provides as a value between `0` and `1` (default is `0.5`) the `<priority>` element will be set.

  If `priority === 0` the entry will be excluded from the list.

  `alt` properties will be used to add the `<xhtml:link rel='alternate'>` entries. `x-default` can be provided as well.

 */

export function sitemap(site, opt = {}) {
  let { excludes = [] } = opt

  site.text("sitemap.txt", (ctx) => {
    ctx.body = ctx.site.routes
      .entries()
      .map(([path, { type, url, priority }]) => {
        if (!excludes.includes(path) && (priority == null || priority > 0)) {
          if (type === TYPE_HTML) {
            return url
          }
        }
      })
  })

  // https://www.sitemaps.org/protocol.html
  site.xml("sitemap.xml", (ctx) => {
    ctx.body = (
      <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns__xhtml="http://www.w3.org/1999/xhtml"
      >
        {site.routes
          .entries()
          .map(([path, { type, url, priority, lang, alt, alternate }]) => {
            try {
              if (
                !excludes.includes(path) &&
                (priority == null || priority > 0)
              ) {
                if (type === TYPE_HTML) {
                  alt = alternate || alt
                  return (
                    <url>
                      <loc>{url}</loc>
                      {priority && (
                        <priority>{(+priority).toFixed(1)}</priority>
                      )}
                      <xhtml__link rel="alternate" hreflang={lang} href={url} />
                      {alt &&
                        Object.entries(alt).map(([lang, href]) => {
                          if (lang === "" || lang === "*") {
                            lang = "x-default" // https://www.sistrix.de/frag-sistrix/onpage-optimierung/wie-nutze-ich-das-x-default-hreflang-link-attribut-richtig/
                          }
                          return (
                            <xhtml__link
                              rel="alternate"
                              hreflang={lang}
                              href={href}
                            />
                          )
                        })}
                    </url>
                  )
                }
              }
            } catch (err) {
              console.error(`Sitemap generation error at ${path}:`, err)
            }
          })}
      </urlset>
    )
  })
}
