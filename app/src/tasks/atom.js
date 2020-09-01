import { markdown } from '../utils/markdown.js'
import { CDATA } from '../html/html.js'
import { absolute } from '../site/links/absolute.js'
import { assets } from '../site/links/assets.js'
import { tidyDOM } from '../html/tidy.js'

// https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fholtwick.de%2Fatom.xml

export function atom(
  {
    site,
    posts,
    title,
    subtitle,
    path,
    authorName,
    authorEmail,
    authorURL,
    icon,
    handleBody,
  }) {

  site.xml(path, ctx => {
    let { url } = ctx
    ctx.body = <feed xmlns="http://www.w3.org/2005/Atom">
      <title type="text">{title}</title>
      {subtitle && <subtitle type="text">{subtitle}</subtitle>}
      <link href={url} rel="self" type="application/atom+xml"/>
      <link href={site.baseURL} type="text/html"/>
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
          let summary = 'The full article is available on holtwick.de'
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

              body.handle('iframe', e => e.remove())

              html = body.render()
            }
            if (html) {
              summary = html
            }
          }
          return <entry>
            <id>{post.url}</id>
            <title type="text">{post.headline}</title>
            <link rel="self" href={post.url}/>
            <updated>{post.date?.toISOString()}</updated>
            <content type="html">{
              CDATA(summary)
            }</content>
          </entry>
        })
      }
    </feed>
  })
}
