import { parseDate } from "../utils/dateutils.js"
import { getStat } from "../site/files.js"
import { markdown } from "../utils/markdown.js"

// class Article {
//
//   constructor(props) {
//     Object.assign(this, props)
//     this._body = null
//   }
//
//   get body() {
//     if (this._body == null) {
//       console.log(this)
//       if (this.sourceType === 'markdown') {
//         this.markdown = this.site.readMarkdown(this.sourceFile, { path: this.path })
//         this._body = this.markdown.body
//       } else {
//         this.html = this.site.readHTML(this.sourceFile, { path: this.path })
//         this._body = this.html.body
//       }
//     }
//     return this._body
//   }
//
//   set body(body) {
//     this._body = body
//   }
//
// }

export function getArticle({ file, site, routePath = "/", body = false }) {
  let props = {
    sourceType: "html",
  }

  if ([".md", ".mdown", ".markdown"].includes(file.ext)) {
    if (body) {
      props = site.readMarkdown(file) || {}
    } else {
      props = site.readMarkdownProperties(file) || {}
    }
    props.sourceType = "markdown"
  }

  let slug = props.slug || file.name
  slug = slug === "index" ? "" : slug

  // Hidden
  if (file.name.startsWith("-")) {
    props.hidden = true
    slug = slug.substr(1)
  }

  // Date
  let date = parseDate(props.date, file.name) || null
  if (!date) {
    const stat = getStat(file.fullPath)
    date = stat?.mtime
  }
  props.date = date || null

  // Slug normalization
  slug = slug.replace(/[^\p{L}[0-9]+/gmu, "-")

  props.path = `${routePath}/${slug}`
  props.sourceFile = file

  return props
}

export function getArticleBody({ ctx, site }) {
  if (ctx.sourceType === "markdown") {
    ctx.markdown = site.readMarkdown(ctx.sourceFile, { path: ctx.path })
    ctx.body = ctx.markdown.body
  } else {
    ctx.html = site.readHTML(ctx.sourceFile, { path: ctx.path })
    ctx.body = ctx.html.body
  }
}

export function articles({
  site,
  files,
  handleProps,
  routePath = "/",
  body,
} = {}) {
  let bodyFn = body

  routePath = routePath.endsWith("/") ? routePath.slice(0, -1) : routePath

  files.forEach((file) => {
    let props = getArticle({ file, site, routePath })

    if (handleProps) {
      if (handleProps(props) === false) {
        return
      }
    }

    site.html(props.path, props, (ctx) => {
      getArticleBody({ ctx, site })
      ctx.body = bodyFn(ctx) || ctx.body
    })
  })
}
