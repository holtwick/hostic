const log = require('debug')('hostic:mw:postcss')

const esbuild = require('esbuild')
import { dirname } from 'path'
import { readFileSync } from 'fs'

export function js(source) {

  return async (ctx, next) => {
    log('start') //, source, ctx, next)

    const contents = readFileSync(source, 'utf8')
    // const cssctx = { parser: true, map: 'inline' }
    // const { plugins, options } = postcssrc.sync(cssctx)
    // let result = await postcss(plugins).process(css, { from: source, to: source })
    // ctx.body = result.css

    global.__dirname = '/Users/dirk/work/hostic/node_modules/esbuild'
    let result = esbuild.buildSync({
      bundle: true,
      sourcemap: 'inline',
      target: 'es2015',
      platform: 'browser',
      loader: {
        '.js': 'jsx',
        '.css': 'text',
        '.txt': 'text',
        '.md': 'text',
      },
      jsxFactory: 'h',
      minify: ctx.minify || ctx.minifyJavascript || false,
      // external: [
      //   ...Object.keys(pkg.dependencies ?? {}),
      //   ...Object.keys(pkg.devDependencies ?? {}),
      //   ...Object.keys(pkg.peerDependencies ?? {}),
      // ],
      write: false,
      entryPoints: [source],
      // stdin: {
      //   resolveDir: dirname(source),
      //   // sourcefile: source,
      //   contents,
      // },
    })

    ctx.body = new TextDecoder('utf-8').decode(result.outputFiles[0].contents)

    await next()

    log('end')
  }

}
