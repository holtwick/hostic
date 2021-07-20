const { EXPORT_INDEX_HTML } = require("./config.js")
const { getErrorStats } = require("./utils/error.js")
const { duration } = require("./utils/perfutil.js")
const { red, magenta, green, bold, blue, gray, underline } = require("chalk")

const { STATUS_PAGE_PATH } = require("./config.js")
const { mkdir, rmdir } = require("./utils/fileutil.js")
const { join, dirname } = require("path")
const { writeFileSync } = require("fs")

let basepath = "dist" // TODO:2020-08-29 Configurable

// This is required to bypass systems umask settings
process.umask(0o022)

function write(urlPath, content) {
  if (urlPath[0] === "/") {
    urlPath = urlPath.substring(1)
  }
  let outPath = join(basepath, urlPath)
  mkdir(dirname(outPath))
  writeFileSync(outPath, content, {
    mode: 0o644,
    encoding: "utf8",
  })
}

function print(...parts) {
  process.stdout.write(parts.join(""))
}

async function writeStatic({ site, time } = {}) {
  let { routes } = site

  print(magenta(`\nBase URL: `))
  print(underline(`${site.baseURL}`))
  print(magenta(`\nOutput:   `))
  print(underline(`${process.cwd()}/dist\n`))

  rmdir("dist")
  mkdir("dist")

  async function writeRoutes(excludes = []) {
    let paths = [...routes.keys()]
    for (let path of paths) {
      if (!excludes.includes(path)) {
        let pageTime = duration()
        let { content, type } = await routes.render(path, { site })
        if (path && content) {
          if (path.endsWith("/")) {
            path += "index.html"
          } else if (
            type === "text/html" &&
            !path.toLowerCase().endsWith(".html")
          ) {
            if (EXPORT_INDEX_HTML) {
              path += "/index.html"
            } else {
              path += ".html"
            }
          }
          print(`Write `)
          print(underline(`${path}`))
          print(gray(` (${pageTime()})\n`))
          write(path, content)
        } else {
          console.warn("Issue with", path, type)
        }
      }
    }
    return paths
  }

  let excludes = [STATUS_PAGE_PATH]

  // Pass 1: Content files
  print(blue.bold("\nPASS 1 - Pages\n"))
  excludes = await writeRoutes(excludes)

  // Pass 2: Assets
  print(blue.bold("\nPASS 2 - Assets\n"))
  await writeRoutes(excludes)

  // Pass 2: Checks
  print(blue.bold("\nPASS 3 - Checks\n"))
  for (let check of site.checks) {
    let result = await check(site)
    if (result?.success) {
      print(`✅ ${result.name}`)
    } else {
      print(red(`${result.name} ... failed with ${result.issues} issues\n`))
    }
  }

  let status = getErrorStats()
  if (status.errors > 0) {
    console.info(red(`\n\n${status.errors} errors occurred!`))
    process.exit(1)
  }

  console.info(green(`\n\nDone in ${time()}`))
}

module.exports.writeStatic = writeStatic
