import { VNode } from "zeed-dom"
import { TYPE_HTML } from "../site/types.js"

const log = require("debug")("hostic:plugin:locale")

export function locale(pluginOpt = {}) {
  return {
    name: "locale",
    priority: 0.8,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      let { lang, missing, languages } = Object.assign(
        {
          lang: "en",
          languages: {},
        },
        pluginOpt,
        ctx
      )

      await next()

      lang = lang.toLowerCase()
      if (lang) {
        // log('Locale to', lang)

        let strings = languages[lang] || {}
        // log('strings', strings)

        let translateString = (s) => {
          let sr = strings[s] || strings[s.trim()]
          if (!sr && missing) {
            missing[s.trim()] = s.trim()
          }
          return sr || s
        }

        const excludeAttrs = ["target"]

        // <input placeholder="_Translate me"
        let textNodes = ctx.body.flattenNodes().filter((node) => {
          if (node.nodeType === VNode.TEXT_NODE) {
            return true
          } else if (node.nodeType === VNode.ELEMENT_NODE) {
            let attr = node.attributes
            for (let [name, value] of Object.entries(attr)) {
              if (!excludeAttrs.includes(name) && value?.startsWith("_")) {
                node.setAttribute(name, translateString(value.substr(1)))
              }
            }
          }
        })

        // <div>_Translate me</div>
        textNodes.forEach((node) => {
          let text = node?.nodeValue?.trim() || ""
          if (text.startsWith("_")) {
            // This is VTextNode specific!
            node._text = translateString(text.substr(1))
          }
        })

        // <en> or <de> tags
        let langTagNames = ["en", "de", "fr", "es", "it"]
        Object.keys(languages).forEach((l) => {
          if (!langTagNames.includes(l)) {
            langTagNames.push(l)
          }
        })

        let selector = langTagNames.join(",")
        ctx.body.handle(selector, (e) => {
          let tagLang = e.tagName.toLowerCase()
          if (tagLang !== lang) {
            e.remove()
          } else {
            e.replaceWith(...e.childNodes)
          }
        })

        // data-lang="en" attributes
        ctx.body.handle(`[data-lang]`, (e) => {
          if (e.getAttribute("data-lang") !== lang) {
            e.remove()
          } else {
            e.removeAttribute("data-lang")
          }
        })
      }
    },
  }
}
