export function languages(site) {
  const baseURL = site.baseURL || '/'

  // TODO: more generic!

  // Fix alternates
  site.routes.entries().forEach(([path, context]) => {
    // log('multilang', path)
    let slug = path.substr(4)
    // for (let lang of languages) {}
    if (path.startsWith('/en/')) {
      context.lang = 'en'
      context.hrefOtherLanguage = '/de/'
      if (site.routes.has('/de/' + slug)) {
        context.hrefOtherLanguage = '/de/' + slug
        context.alt = {
          'de': baseURL + '/de/' + slug,
          '*': baseURL + '/' + slug, // Redirection based on
        }
      }
    } else if (path.startsWith('/de/')) {
      context.lang = 'de'
      context.hrefOtherLanguage = '/en/'
      if (site.routes.has('/en/' + slug)) {
        context.hrefOtherLanguage = '/en/' + slug
        context.alt = {
          'en': baseURL + '/en/' + slug,
          '*': baseURL + '/' + slug, // Redirection based on
        }
      }
    }
  })
}
