function reloadMiddleware(req, res, next) {
  next()
  if (res.type === 'text/html') {
    console.log('FOUND')
  }
}

module.exports = {
  reloadMiddleware
}
