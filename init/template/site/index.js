import { Site, plugin, task } from 'hostic'
import { template } from './template.js'

export default function (path) {

  // Create a site object; we set it to the path
  // of the folder containing this file
  let site = new Site({ path })

  // Provides /index.css as a static asset
  site.static('index.css')
  site.static('favicon.ico')

  // Register the template
  site.use(template({
    imageHeight: 64,
  }))

  site.use(plugin.tidy())
  site.use(plugin.meta())
  site.use(plugin.locale())
  site.use(plugin.cookieConsent())

  // The start page
  site.html('/', {
    buildTime: `Build time ${new Date().toLocaleString()}`,
  }, async ctx => {
    ctx.title = 'Welcome to Hostic'
    ctx.body = <div>
      <p>
        Learn more about how to build great static websites
        <br/>
        with Hostic at <a href="https://github.com/holtwick/hostic">github.com/holtwick/hostic</a>
      </p>
      <p>
        Internals at <a href="/$">{ctx.site.baseURL}/$</a>
      </p>
    </div>
  })

  task.sitemap(site)

  // Don't forget to return the site object so the magic can happen :)
  return site
}
