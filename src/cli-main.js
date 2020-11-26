const {error} = require("./utils/error.js")
const {setupEnv} = require("./lib/env.js")
const {startServer} = require("./cli-serve.js")
const {writeStatic} = require("./cli-build.js")
const {resolve} = require("path")
const {writeFileSync, unlinkSync} = require("fs")
const {buildOptions} = require("./build-options.js")
const {duration} = require("./utils/perfutil.js")
const esbuild = require("esbuild")
const {evalCode} = require("./code-utils.js")

const log = require("debug")("hostic:main")

const sitePath = resolve("site")

let service
let code
let sourcemap
let mod

async function performUserSetup() {
  try {
    return mod.default(sitePath)
  } catch (err) {
    error("Error executing", err)
  }
}

async function build() {
  log("Build...")

  if (!service) {
    service = await esbuild.startService()
    log("ESBuild service", service)
  }

  const sourceMapExternal = false

  // https://github.com/evanw/esbuild#command-line-usage
  const options = {
    ...buildOptions,
    entryPoints: [sitePath + "/index.js"],
    write: false,
  }

  if (sourceMapExternal) {
    options.sourcemap = "external"
    options.outdir = __dirname + "/out"
  }

  log("Build options", options)

  let result = await service.build(options)
  for (let out of result.outputFiles) {
    console.info("output", out.path)
    if (out.path.endsWith(".js.map")) {
      sourcemap = new TextDecoder("utf-8").decode(out.contents)
    } else {
      code = new TextDecoder("utf-8").decode(out.contents)
    }
  }

  try {
    module = null
    global.basePath = sitePath
    if (code) {
      const mode = 2

      const BUNDLE = resolve(process.cwd(), "index.min.js")

      // Variant A
      if (mode === 1) {
        code = `(function(exports) {
          ${code}
          return exports;
        })({})`
        mod = eval(code)
      }

      // Variant B
      else if (mode === 2) {
        mod = evalCode(code, sourcemap, BUNDLE)
      }

      // Variant C
      else if (mode === 3) {
        let exports = {}
        eval(code)
        mod = exports
      }

      // Variant D
      else if (mode === 4) {
        // code = code.replace('//# sourceMappingURL=index.js.map', '//# sourceMappingURL=hostic-bundle.js.map')
        writeFileSync(BUNDLE, code, "utf8")
        if (sourceMapExternal) writeFileSync(BUNDLE + ".map", sourcemap, "utf8")
        delete require.cache[require.resolve(BUNDLE)]
        mod = require(BUNDLE)
        unlinkSync(BUNDLE)
        if (sourceMapExternal) unlinkSync(BUNDLE + ".map")
      } else {
        error("Invalid code loading mode", mode)
      }
    }
  } catch (err) {
    error(`Problem transpiling`, err)
    // console.error("Exception:", err)
  }

  return performUserSetup()
}

async function cliMain() {
  let time = duration()

  setupEnv()

  log("env =", process.env.BASE_URL)

  // BUILD STATIC SITE
  const STATIC = process.argv.includes("--build") || process.argv.includes("build")
  if (STATIC) {
    log("build a static site")
    if (!process.env.NODE_ENV) process.env.NODE_ENV = "production"
    let site = await build()
    await writeStatic({site, time})
    process.exit()
  }

  // DYNAMIC PREVIEW SERVER
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development"
  }

  log("start server")
  startServer({
    performUserSetup,
    sitePath,
    build,
    time,
  })
}

module.exports.main = cliMain
