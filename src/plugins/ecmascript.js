const log = require('debug')('hostic:mw:postcss')

const esbuild = require('esbuild')

export function js(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    // const css = readFileSync(source, 'utf8')
    // const cssctx = { parser: true, map: 'inline' }
    // const { plugins, options } = postcssrc.sync(cssctx)
    // let result = await postcss(plugins).process(css, { from: source, to: source })
    // ctx.body = result.css

    global.__dirname = '/Users/dirk/work/hostic/node_modules/esbuild'
    let result = esbuild.buildSync({
      bundle: true,
      sitemap: true,
      // minify: true,
      // target: 'es2017',
      platform: 'browser',
      loader: {
        '.js': 'jsx',
      },
      jsxFactory: 'h',
      // external: [
      //   ...Object.keys(pkg.dependencies ?? {}),
      //   ...Object.keys(pkg.devDependencies ?? {}),
      //   ...Object.keys(pkg.peerDependencies ?? {}),
      // ],
      write: false,
      entryPoints: [source],
    })

    ctx.body = new TextDecoder('utf-8').decode(result.outputFiles[0].contents)

    await next()

    log('end')
  }

}
