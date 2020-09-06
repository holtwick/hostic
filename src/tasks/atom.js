import { markdown } from '../utils/markdown.js'
import { CDATA, tidyDOM } from 'hostic-dom'
import { absolute } from '../site/links/absolute.js'
import { assets } from '../site/links/assets.js'

// https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fholtwick.de%2Fatom.xml

export function atom(
  {
    site,
    posts,
    title,
    subtitle,
    fallbackContent = '',
    path,
    authorName,
    authorEmail,
    authorURL,
    icon,
    handleBody,
    matomoCampaign,
    matomoKeyword,
  }) {

  site.xml(path, ctx => {
    let { url } = ctx

    const handleURL = (url) => {
      url = new URL(url)
      if (matomoCampaign) {
        url.searchParams.append('pk_campaign', matomoCampaign)
        url.searchParams.append('pk_kwd', 'main')
      }
      return url.toString()
    }

    ctx.body = <feed xmlns="http://www.w3.org/2005/Atom">
      <title type="text">{title}</title>
      {subtitle && <subtitle type="text">{subtitle}</subtitle>}
      <link href={url} rel="self" type="application/atom+xml"/>
      <link href={handleURL(site.baseURL)} type="text/html"/>
      {
        icon && <fragment>
          <icon>{icon}</icon>
          <logo>{icon}</logo>
        </fragment>
      }
      <id>{url}</id>
      <updated>{(new Date()).toISOString()}</updated>
      <author>
        <name>{authorName}</name>
        <email>{authorEmail}</email>
        <uri>{authorURL || site.baseURL}</uri>
      </author>

      {
        posts.map(post => {
          let postURL = post.url
          let content = fallbackContent
          if (post.markdown) {
            let { html, body } = markdown(post.markdown, {
              outline: false,
              highlightCode: false,
            })
            if (body) {
              if (handleBody) {
                handleBody(body)
              }

              assets({
                body,
                site,
                path: post.path,
                sourceFolder: post.sourcePath,
                allAbsolute: true,
              })

              absolute({
                body,
                site,
                path: post.path,
                allAbsolute: true,
                targetBlank: false,
              })

              tidyDOM(body)

              body.handle(`a[href^="${site.baseURL}"]`, e => {
                if (matomoCampaign) {
                  let url = new URL(e.getAttribute('href'))
                  url.searchParams.append('pk_campaign', matomoCampaign)
                  url.searchParams.append('pk_kwd', post.path)
                  e.setAttribute('href', url.toString())
                }
              })
              body.handle('iframe', e => e.remove())



              html = body.render()
            }
            if (html) {
              content = html
            }
            if (matomoCampaign) {
              let url = new URL(postURL)
              url.searchParams.append('pk_campaign', matomoCampaign)
              url.searchParams.append('pk_kwd', post.path)
              postURL = url.toString()
            }
          }
          return <entry>
            <id>{post.url}</id>
            <title type="text">{post.headline}</title>
            <link rel="self" href={postURL}/>
            <updated>{post.date?.toISOString()}</updated>
            <content type="html">{
              CDATA(content)
            }</content>
          </entry>
        })
      }
    </feed>
  })
}
