const pkg = require('../package.json')

module.exports.buildOptions = {
  sourcemap: 'inline',
  target: 'node12',
  jsxFactory: 'h',
  jsxFragment: 'hh',
  bundle: true,
  platform: 'node',
  loader: {
    '.js': 'jsx',
    '.css': 'text',
    '.txt': 'text',
    '.md': 'text',
  },
  external: [
    // ...Object.keys(pkg.dependencies ?? {}),
    // ...Object.keys(pkg.devDependencies ?? {}),
    // ...Object.keys(pkg.peerDependencies ?? {}),
    'esbuild',
  ]
}
