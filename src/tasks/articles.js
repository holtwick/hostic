import { parseDate } from '../utils/dateutils.js'
import { getStat } from '../site/files.js'

export function getArticle({ file, site, routePath = '/' }) {
  let props = {
    sourceType: 'html',
  }

  if (['.md', '.mdown', '.markdown'].includes(file.ext)) {
    props = site.readMarkdownProperties(file) || {}
    props.sourceType = 'markdown'
  }

  let slug = props.slug || file.name
  slug = slug === 'index' ? '' : slug

  // Hidden
  if (file.name.startsWith('-')) {
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

  let path = `${routePath}/${slug}`
  props.path = path
  props.sourceFile = file

  return { props, path }
}

export function getArticleBody({ ctx, site }) {
  if (ctx.sourceType === 'markdown') {
    ctx.markdown = site.readMarkdown(ctx.sourceFile, { path: ctx.path })
    ctx.body = ctx.markdown.body
  } else {
    ctx.html = site.readHTML(ctx.sourceFile, { path: ctx.path })
    ctx.body = ctx.html.body
  }
}

export function articles({ site, files, handleProps, routePath, body } = {}) {
  let bodyFn = body

  routePath = routePath.endsWith('/') ? routePath.slice(0, -1) : routePath

  files.forEach(file => {

    let { props, path } = getArticle({ file, site, routePath })

    if (handleProps) {
      if (handleProps(props) === false) {
        return
      }
    }

    site.html(
      path,
      props,
      ctx => {
        getArticleBody({ ctx, site })
        ctx.body = bodyFn(ctx) || ctx.body
      })
  })
}

