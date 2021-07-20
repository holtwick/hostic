import { Routes } from "./routes.js"
import { FolderManager } from "../utils/foldermanager.js"
import { UUID } from "../lib/uuid.js"
import { parsePath } from "../utils/pathutil.js"
import { getBasePath } from "../utils/pathutil.js"
import { markdown } from "../utils/markdown.js"
import { parseMarkdownStructure } from "../utils/markdown.js"
import { TYPE_HTML } from "./types.js"
import { TYPE_XML } from "./types.js"
import { TYPE_TEXT } from "./types.js"
import { TYPE_JSON } from "./types.js"
import { TYPE_YAML } from "./types.js"
import { STATUS_PAGE_PATH } from "../config.js"
import { compose } from "./compose.js"
import { context } from "../plugins/context.js"
import { file } from "../plugins/file.js"
import { css } from "../plugins/postcss.js"
import { html } from "../plugins/html.js"
import { jsx } from "../plugins/jsx.js"
import { links } from "../plugins/links.js"
import { getContent } from "./files.js"
import { files } from "./files.js"
import { assets } from "./links/assets.js"
import { status } from "./status.js"
import { error } from "../utils/error.js"
import { warn } from "../utils/error.js"
import { js } from "../plugins/ecmascript.js"
import { vdom } from "zeed-dom"
import { removeBodyContainer } from "zeed-dom"
import { checkLinks } from "../checks/links.js"

const { resolve } = require("path")

const inspect = Symbol.for("nodejs.util.inspect.custom")

const log = require("debug")("hostic:site")

export class Site {
  constructor({ path, plugins, baseURL, ...routeOpts } = {}) {
    this.uid = UUID()
    log("Site", path, this.uid)
    this.data = {}

    this.config = {
      forceSSL: true,
      noWWW: true,
      redirectLang: true,
      errorPage: "404",
      checkInternalLinks: true,
    }

    this.checks = [checkLinks]

    if (baseURL == null) {
      baseURL = process.env.BASE_URL
    }

    if (!baseURL) {
      warn(
        "You should provide a BASE_URL for appropriate meta data, sitemaps and others.\n The easiest way is to add a .env file."
      )
    }

    this.baseURL =
      (baseURL?.endsWith("/") ? baseURL?.slice(0, -1) : baseURL) || "/"

    this.sourcePath = path

    this.folderManager = new FolderManager(this.sourcePath)

    // this.options = routeOpts
    this.routes = new Routes({
      ...routeOpts,
      plugins,
      baseURL: this.baseURL,
      site: this,
    })

    this.html(STATUS_PAGE_PATH, status)
  }

  sources(condition = (_) => true) {
    return this.folderManager.files
      .map((path) => {
        if (!path.startsWith("/")) {
          path = "/" + path
        }
        if (path === STATUS_PAGE_PATH) {
          return null
        }
        let info = { ...parsePath(path), path }
        let result = condition(info)
        if (result === true) {
          return info
        }
        if (result == null || result === false) {
          return null
        }
        return result
      })
      .filter((p) => p != null)
  }

  read(path) {
    return this.folderManager.read(path)
  }

  stat(path) {
    return this.folderManager.stat(path)
  }

  readFile(file) {
    let content, sourceFolder
    if (typeof file === "string") {
      content = this.read(file)
      sourceFolder = getBasePath(file)
    } else {
      content = getContent(file.fullPath)
      sourceFolder = getBasePath(file.fullPath)
    }
    return {
      content,
      sourceFolder,
    }
  }

  readMarkdown(file, { path } = {}) {
    log("readMarkdown", file)
    let { content, sourceFolder } = this.readFile(file)
    let { body, ...info } = markdown(content)
    assets({
      body,
      site: this,
      sourceFolder,
      path,
    })
    return { body, ...info }
  }

  readHTML(file, { path } = {}) {
    let { content, sourceFolder } = this.readFile(file)
    let body = removeBodyContainer(vdom(content))
    assets({
      body,
      site: this,
      sourceFolder,
      path,
    })
    return { body }
  }

  readMarkdownProperties(path) {
    let data, sourcePath
    if (typeof path === "string") {
      data = this.read(path)
      sourcePath = getBasePath(path)
    } else {
      data = getContent(path.fullPath)
      sourcePath = getBasePath(path.fullPath)
    }
    let props = parseMarkdownStructure(data)
    props.sourcePath = sourcePath
    return props
  }

  //

  static(path, source = null) {
    if (!source) source = path

    let ff
    if (this.stat(source)?.isDirectory()) {
      ff = files({
        path,
      })
    } else {
      let fullPath = resolve(global.basePath || process.cwd(), ".", source)
      ff = [
        {
          path,
          fullPath,
        },
      ]
    }
    for (let { path, fullPath } of ff) {
      let next = compose([context({ path }), file(fullPath)])
      this.routes.set(path, {
        path,
        next,
      })
    }
  }

  css(path, source = null) {
    if (!source) source = path
    // let ff
    // if (this.stat(source)?.isDirectory()) {
    //   ff = files({
    //     path,
    //   })
    // } else {
    let fullPath = resolve(global.basePath || process.cwd(), ".", source)
    let ff = [
      {
        path,
        fullPath,
      },
    ]
    // }
    for (let { path, fullPath } of ff) {
      let next = compose([context({ path }), css(fullPath)])
      this.routes.set(path, {
        path,
        next,
      })
    }
  }

  js(path, source = null) {
    if (!source) source = path
    // let ff
    // if (this.stat(source)?.isDirectory()) {
    //   ff = files({
    //     path,
    //   })
    // } else {
    let fullPath = resolve(global.basePath || process.cwd(), ".", source)
    let ff = [
      {
        path,
        fullPath,
      },
    ]
    // }
    for (let { path, fullPath } of ff) {
      let next = compose([context({ path }), js(fullPath)])
      this.routes.set(path, {
        path,
        next,
      })
    }
  }

  registeredMiddlewares = {
    [TYPE_HTML]: [html(), jsx(), links()],
    [TYPE_XML]: [jsx()],
  }

  use(middleware, opt = {}) {
    let type
    let {} = opt
    if (opt.type && middleware?.type && opt.type !== middleware?.type) {
      error(
        `Using middleware of type ${middleware?.type} for ${
          opt.type
        } is not allowed: ${middleware?.name || middleware}`
      )
    }
    type = opt.type || middleware?.type || TYPE_HTML
    if (this.registeredMiddlewares[type] == null) {
      this.registeredMiddlewares[type] = []
    }
    if (typeof middleware === "function") {
      middleware = {
        middleware,
      }
    }
    this.registeredMiddlewares[type].push(middleware)
  }

  _splitMiddlewares(ctx, mixedMiddlewares) {
    let top = [],
      bottom = [],
      middlewares = []
    for (let mw of mixedMiddlewares) {
      if (typeof mw === "function") {
        mw = { middleware: mw }
      }
      if (mw.middleware == null) {
        ctx = Object.assign(ctx, mw)
      } else {
        middlewares.push(mw.middleware)
        if (+mw.priority > 0) {
          top.push(mw)
        } else {
          bottom.push(mw.middleware)
        }
      }
    }
    top.sort((a, b) => b.priority - a.priority)
    log(
      "MW order",
      top.map((mw) => mw?.name || mw?.middleware?.constructor?.name).join(", ")
    )
    top = top.map((mw) => mw.middleware)
    return { top, bottom, ctx, middlewares }
  }

  _compose(ctx, useMiddlewares, typeMiddlewares, pageMiddlewares) {
    if (useMiddlewares == null) {
      useMiddlewares = []
    }

    let useMW = this._splitMiddlewares(ctx, useMiddlewares)
    let pageMW = this._splitMiddlewares(ctx, pageMiddlewares)

    let middlewares = [
      context(ctx),
      ...useMW.top,
      ...typeMiddlewares,
      ...useMW.bottom,
      ...pageMW.middlewares,
    ]

    log("middlewares", middlewares)
    return {
      ctx,
      next: compose(middlewares),
    }
  }

  _page(path, type, typeMiddlewares = [], pageMiddlewares = []) {
    if (!path.startsWith("/")) {
      path = "/" + path
    }
    let initialContext = {
      path,
      url: this.baseURL + path,
    }
    let { ctx, next } = this._compose(
      initialContext,
      this.registeredMiddlewares[type],
      typeMiddlewares,
      pageMiddlewares
    )
    this.routes.set(path, {
      ...ctx,
      next,
      path,
      type,
    })
  }

  html(path, ...middlewares) {
    this._page(path, TYPE_HTML, [], middlewares)
  }

  xml(path, ...middlewares) {
    this._page(path, TYPE_XML, [], middlewares)
  }

  text(path, ...middlewares) {
    this._page(path, TYPE_TEXT, [], middlewares)
  }

  json(path, ...middlewares) {
    this._page(path, TYPE_JSON, [], middlewares)
  }

  yaml(path, ...middlewares) {
    this._page(path, TYPE_YAML, [], middlewares)
  }

  [inspect]() {
    return `${this.constructor.name} <path=${this.sourcePath}, baseURL=${this.baseURL}>`
  }
}
