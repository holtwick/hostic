import { TYPE_HTML } from '../../site/types.js'

const log = require('debug')('hostic:plugin:meta')

export function meta(pluginOpt = {}) {

  // url:         absolute canonical link to page
  // lang:        page language like 'en'
  // alternate:   dictionary with lang:url pairs; '' or '*' is 'x-default' i.e. for unknown lang or redirect
  // title:       page title
  // desc|decription
  // keywords     meta keywords
  // image:
  // video:
  // type:        website (default), article or blog
  // generator:   Hostic :)
  // twitter:     handle like @holtwick (site and creator)
  // twitterSite: handle specific to the site

  // facebook:    idem

  // https://ogp.me/#types

  return {
    name: 'youtube',
    priority: 0.55,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      await next()

      let opt = Object.assign(
        {},
        pluginOpt,
        ctx.meta || {},
        ctx)

      let document = ctx.body.ownerDocument
      // let body = document.body
      let head = document.head

      function removeAll(selector) {
        ctx.body.querySelectorAll(selector).forEach(e => e.remove())
      }

      let { lang = 'en', url } = opt

      // Canonical
      if (url) {
        // if (!isAbsoluteURL(url)) {
        //   console.warn('Canonical URLs need to be absolute, including the host name, instead got:', url)
        // } else {
        removeAll('link[rel="canonical"]')
        removeAll('meta[property="og:url"]')
        head.appendChild(<link rel="canonical" href={url}/>)
        head.appendChild(<meta property="og:url" content={url}/>)
      }

      // Language
      if (lang) {
        document.documentElement.setAttribute('lang', lang)
        // head.appendChild(<meta property="og:locale" content={lang}/>)
        if (url) {
          head.appendChild(<link rel="alternate" hrefLang={lang} href={url}/>)
        }
      }

      // Alternate
      let alt = opt.alternate || opt.alt
      if (alt) {
        for (let [lang, href] of Object.entries(alt)) {
          if (lang === '' || lang === '*') {
            lang = 'x-default' // https://www.sistrix.de/frag-sistrix/onpage-optimierung/wie-nutze-ich-das-x-default-hreflang-link-attribut-richtig/
          }
          head.appendChild(<link rel="alternate" hrefLang={lang} href={href}/>)
        }
      }

      // Title
      let title = opt.title || document.title
      if (title) {
        document.title = title
        removeAll('meta[property="og:title"]')
        head.appendChild(<meta property="og:title" content={title}/>)
      }

      // Description
      if (opt.description) {
        removeAll('meta[name="description"]')
        removeAll('meta[property="og:description"]')
        head.appendChild(<meta name="description" property="og:description" content={opt.description}/>)
      }

      // Keywords
      if (opt.keywords) {
        if (Array.isArray(opt.keyword)) {
          opt.keywords = opt.keywords.join(',')
        }
        removeAll('meta[name="keywords"]')
        removeAll('meta[property="og:keywords"]')
        head.appendChild(<meta name="keywords" property="og:keywords" content={opt.keywords}/>)
      }

      // Image
      if (opt.image) {
        // if (!isAbsoluteURL(opt.image)) {
        //   console.warn('Image URLs need to be absolute, including the host name, instead got:', url)
        // } else {
        removeAll('meta[property="og:image"]')
        head.appendChild(<meta property="og:image" content={opt.image}/>)
        if (title) {
          head.appendChild(<meta property="og:image:alt" content={title}/>)
        }
        // }
      }

      // Facebook
      // https://developers.facebook.com/tools/debug/
      // https://developers.facebook.com/docs/sharing/webmasters#markup
      if (opt.facebook) {
        removeAll('meta[property="fb:app_id"]')
        head.appendChild(<meta property="fb:app_id" content={opt.facebook}/>)
      }

      // Twitter
      // https://developer.twitter.com/en/docs/tweets/optimize-with-cards/guides/getting-started
      if (opt.twitter) {
        let { twitter, twitterSite } = opt

        if (twitter[0] !== '@') twitter = '@' + twitter
        if (!twitterSite) twitterSite = twitter

        removeAll('meta[name="twitter:site"]')
        removeAll('meta[name="twitter:creator"]')
        removeAll('meta[name="twitter:card"]')
        head.appendChild(<meta name="twitter:site" content={twitterSite}/>)
        head.appendChild(<meta name="twitter:creator" content={twitter}/>)
        head.appendChild(<meta name="twitter:card" content="summary"/>)
      }

      // Author

      // Video
      if (opt.video) {
        removeAll('meta[property="og:video"]')
        head.appendChild(<meta property="og:video" content={opt.video}/>)
      }

      // Generator, Type
      {
        let { type = 'website', generator = 'Hostic, https://github.com/holtwick/hostic/' } = opt
        removeAll('meta[name="generator"]')
        removeAll('meta[property="og:type"]')
        head.appendChild(<meta name="generator" content={generator}/>)
        head.appendChild(<meta property="og:type" content={type}/>)
      }

      // Important

      if (!ctx.body.querySelector('meta[name=viewport]')) {
        head.insertBefore(<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>)
      }

      if (!ctx.body.querySelector('meta[http-equiv="X-UA-Compatible"]')) {
        head.insertBefore(<meta http-equiv="X-UA-Compatible" content="IE=edge"/>)
      }

      if (!ctx.body.querySelector('meta[charset]')) {
        head.insertBefore(<meta charSet="utf-8"/>)
      }
    },
  }
}
