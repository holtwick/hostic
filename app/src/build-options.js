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
}
