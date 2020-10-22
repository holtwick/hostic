// (C)opyright 2020-10-22 Dirk Holtwick, holtwick.it. All rights reserved.

export function sparkle(
  {
    site,
    releases,
    title = 'Sparkle Feed',
    description = 'Most recent changes with links to updates.',
    path = 'sparklecast.xml',
    lang = 'en',
    publicURL,
  }) {

  site.xml(path, ctx => {
    let { url } = ctx

    if (!releases) {
      releases = ctx.releases
    }

    console.log('res', releases)

    let r = releases?.entries?.[0] || {}

    // const handleURL = (url) => {
    //   url = new URL(url)
    //   if (matomoCampaign) {
    //     url.searchParams.append('pk_campaign', matomoCampaign)
    //     url.searchParams.append('pk_kwd', 'main')
    //   }
    //   return url.toString()
    // }

    ctx.body = <rss xmlns__sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"
                    xmlns__dc="http://purl.org/dc/elements/1.1/"
                    version="2.0">
      <channel>
        <title>{title}</title>
        <link>
          {publicURL || url}
        </link>
        <description>{description}</description>
        <language>{lang}</language>
        <item>
          <title>Version {r.version}</title>
          <description>
            <cdata>
              {/*{html(<div>*/}
              {/*  {r.html ? HTML(r.html) : 'Stability improvements.'}*/}
              {/*  <hr/>*/}
              {/*  <p>For details about previous changes visit <a*/}
              {/*    href={site.publicURL('changelog')}>{site.publicURL('changelog')}</a>.*/}
              {/*  </p>*/}
              {/*  <p>*/}
              {/*    <b>In case of update problems please download the current version directly from*/}
              {/*      <a href="https://onepile.app">https://onepile.app</a>*/}
              {/*      or contact <a href="https://onepile.app/support">support</a>.</b>*/}
              {/*  </p>*/}
              {/*</div>)}*/}
            </cdata>
          </description>
          <sparkle__releaseNotesLink>{site.baseURL}/sparklecast.html</sparkle__releaseNotesLink>
          <pubDate>{r.date?.toGMTString()}</pubDate>
          <enclosure url={`${site.baseURL}${r.url}`}
                     length={r.size?.toString()}
                     type="application/octet-stream"
                     sparkle__version={r.build}
                     sparkle__shortVersionString={r.version}
                     sparkle__minimumSystemVersion="10.13"
          />
        </item>
      </channel>
    </rss>
  })
}
