const { normalizePath } = require('./utils/pathutil.js')
const chokidar = require('chokidar')
const mime = require('mime-types')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { BUILD_TIMEOUT_MS } = require('./config.js')
const { duration } = require('./utils/perfutil.js')
const { red, magenta, bold, green, blue, gray, underline } = require('chalk')

const log = require('debug')('hostic:server')

function print(...parts) {
  process.stdout.write(parts.join(''))
}

module.exports.startServer = function (
  {
    sitePath = 'site',
    port = 8080,
    build,
    performUserSetup,
  } = {}) {

  process.env.BASE_URL = `http://localhost:${port}`

  // SOCKET.IO

  const app = express()
  const server = new http.Server(app)
  const io = socketio(server)

  let serverInstanceID = Math.random()

  function browserReload(socket) {
    if (!socket) {
      socket = io
      serverInstanceID = Math.random()
    }
    log('Emit reload browser')
    socket.emit('reload', {
      counter: 0,
      serverInstanceID,
    })
  }

  io.on('connection', function (socket) {
    const sid = socket.id
    log('connection socket id:', sid)
    browserReload(socket)
  })

  // ROUTES & BUILD

  let site

  const forceBuild = ['js', 'jsx', 'css']

  let reloadTimeout

  function reload(path) {
    if (reloadTimeout) clearTimeout(reloadTimeout)
    reloadTimeout = setTimeout(_ => {
      reloadTimeout = null

      print(blue.bold(`\nContent changes. Performing reload. `))
      let time = duration()

      let force = true
      if (path) {
        let [filename, name, extension] = path.match(/([^\/]*?)\.([^.]+)$/)
        force = forceBuild.includes(extension)
      }
      if (force) {
        build().then(r => {
          site = r
          browserReload()
          print(gray(`(${time()})\n`))
        })
      } else {
        performUserSetup().then(r => {
          site = r
          browserReload()
          print(gray(`(${time()})\n`))
        })
      }
    }, BUILD_TIMEOUT_MS)
  }

  reload()

  // console.info('Started...')

  // SERVER - EXPRESS

  function injectReload(html) {
    return html.replace('</body>', `<script src="/socket.io/socket.io.js"></script>
    <script>
    const socket = io('ws://localhost:8080')
    let serverInstanceID = ${serverInstanceID}
    console.info('Installing reload listener for server instance', serverInstanceID)
    socket.on('reload', e => {
      console.info('Handle reload request from server', e)
      if (e.serverInstanceID !== serverInstanceID) {
        serverInstanceID = e.serverInstanceID
        location.reload()
      } else {
        console.log(' ... already up to date')
      }  
    })
    </script></body>`)
  }

  function errorPage(err) {
    let html = `<!DOCTYPE html>
<html>
<head>
<title>Error - ${err.toString()}</title>
</head>
<body>
<h1>Error</h1>
<p><b>${err.toString()}</b></p>
</body>
</html>`
    return injectReload(html)
  }

  app.use('/', (req, res) => {
    let path = decodeURIComponent(req.path)
    // console.info(`${new Date().toISOString()} - ${req.method} ${req.path}`)

    print(`${req.method} `)
    print(underline(`${path}`))

    let time = duration()

    if (!site) {
      log('Site not available')
      return
    }

    // Mimic .htaccess
    path = normalizePath(path)
    let routeExists = site.routes.has(path)
    if (!routeExists) {
      if (site.config.redirectLang) {
        if (!(path.startsWith('/en/') || path.startsWith('/de/'))) {
          let newPath = '/en' + path
          if (site.routes.has(normalizePath(newPath))) {
            print(magenta(`\nRedirect ${path} to ${newPath}\n`))
            res.redirect(newPath)
            return
          }
        }
      }
      if (path === '/service-worker.js') {
        print(magenta(` (ignored)`))
      } else if (site.config.errorPage) {
        path = site.config.errorPage
        print(magenta(`\nShow error page at ${path}\n`))
      }
    }

    site.routes.render(path, { site }).then(content => {
      if (content != null) {
        if (content.error) {
          res.send(errorPage(content.error))
        } else {
          let html = content.content
          let type = content.type
          if (type) {
            if (type === 'text/html') {
              html = injectReload(html)
            }
          } else {
            type = mime.lookup(path)
          }
          res.type(type)
          res.send(html)
          // print(`(${type}; ${html.length} bytes; ${time()})`)
          print(gray(` (${time()})`))
        }
      } else {
        res.send(errorPage('File not found'))
      }
    }).catch(e => {
      console.error(`Error for ${path}: ${e.toString()}`)
      res.send(errorPage(`Error for ${path}: ${e.toString()}`))
    }).finally(_ => print('\n'))
  })

  // WATCHER - CHOKIDAR

  log('Observe', sitePath, __dirname)

  const watcher = chokidar.watch(
    [
      sitePath,
      __dirname, // This is the folder of main.js
      // 'src',
    ], {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    })

  watcher
    .on('add', reload)
    .on('change', reload)
    .on('unlink', reload)

  // SERVER

  server.listen({
    port,
  }, _ => {
    let { address: host, port } = server.address()
    if (host === '::') host = 'localhost'
    console.info(magenta.bold(`Hostic preview on`, underline(`http://${host}:${port}/`)))
  })
}
