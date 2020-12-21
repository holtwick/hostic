import { normalizePath } from "../utils/pathutil.js"
import { TYPE_HTML } from "./types.js"
import { TYPE_TEXT } from "./types.js"
import { TYPE_YAML } from "./types.js"
import { TYPE_JSON } from "./types.js"
import { TYPE_XML } from "./types.js"
import { htmlRender } from "./renderer/html.js"
import { textRender } from "./renderer/text.js"
import { xmlRender } from "./renderer/xml.js"
import { jsonRender } from "./renderer/json.js"
import { yamlRender } from "./renderer/yaml.js"
import { baseRender } from "./renderer/base.js"
import { STATUS_PAGE_PATH } from "../config.js"
import { error } from "../utils/error.js"
import { warn } from "../utils/error.js"

const log = require("debug")("hostic:routes")

export class Routes {
  routes = {}
  plugins = []

  _site
  _defaultRenderer = baseRender
  _renderer = {}

  constructor({ plugins = [], site, baseURL = "" }) {
    this.baseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL
    this._site = site
    this.plugins = plugins

    this.setRenderer(TYPE_TEXT, textRender)
    this.setRenderer(TYPE_HTML, htmlRender)
    this.setRenderer(TYPE_XML, xmlRender)
    this.setRenderer(TYPE_JSON, jsonRender)
    this.setRenderer(TYPE_YAML, yamlRender)
  }

  setRenderer(type, renderer) {
    this._renderer[type] = renderer
  }

  set(path, context = {}) {
    path = normalizePath(path)
    let url = this.baseURL + path
    log("set", path, "next", context.next)
    this.routes[path] = { ...context, path, url }
  }

  get(path) {
    let context = this.routes[normalizePath(path)]
    if (context) {
      context.path = path
    }
    return context
  }

  has(path) {
    return this.routes[normalizePath(path)] != null
  }

  keys() {
    return Object.keys(this.routes).filter((p) => p !== STATUS_PAGE_PATH)
  }

  entries() {
    return Object.entries(this.routes).filter(([p]) => p !== STATUS_PAGE_PATH)
  }

  values() {
    return Object.values(this.routes).filter(
      (p) => p?.path !== STATUS_PAGE_PATH
    )
  }

  async render(path, { site }) {
    try {
      log("Render path", path)

      let page = this.get(path)
      if (!page) {
        return { error: "404" }
      }
      log("Render page", page)

      let { type, next } = page

      if (type != null && !type.includes("/")) {
        warn(`Suspicious page content type: ${type}`)
      }

      let renderer = this._renderer[type] || this._defaultRenderer

      let ctx = {
        ...page,
        site,
        path,
        type,
      }

      delete ctx.next

      log("next", next, path)
      await next(ctx)

      log("before render", ctx)

      let content = await renderer(ctx)
      if (content != null) {
        return {
          type,
          content,
        }
      }
      return { error: "Empty" }
    } catch (err) {
      error(`Route Exception for path ${path}:`, err)
      // console.error(err)
      return { error: err.toString() }
    }
  }
}
