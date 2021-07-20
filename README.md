<div><img src="./icon.png" style="border-radius: 8px" height="64"></div>

# Hostic

**Yet another static web site builder**

There are plenty static web site generators around, but many of them _think for you_ or try to make use of a specific framework on all costs. Hostic in contrary was built from the ground to use the optimal tools for the task while keeping the process pleasant.

Some features:

- **Supports JSX** but is not related to any framework like React, Vue or Svelte
- Implements a light way DOM abstraction ([zeed-dom](https://github.com/holtwick/zeed-dom)) to easily allow **post process** tasks like calculating image sizes, optimize for SEO, etc.
- **Real time preview** with self reloading pages. Experiment with different designs or contents.
- **Any file type** can be created like XML sitemaps of RSS feeds, robots.txt or whatever you need
- Great **Markdown support**: Write your articles using Markdown and refer to assets used in it. Hostic puts it all together. Works great with [OnePile.app](https://onepile.app?ref=hostic&kw=github).
- **Plugins and Middleware** help doing common repetitive tasks with ease
- **SEO**: Static pages load fast. All assets are tagged with a SHA checksum, therefore the caching on the server can be set to infinite. Perfect sitemap generation done by a plugin. Post processing can reduce file sizes or optimize per page like stripping unused CSS.
- **Fast page load** due to the static nature of the output. Nothing is in between and you can optimize for best loading performance on your server.

# Getting Started

Start a project like this:

```sh
npm init hostic <site-name>
cd <site-name>
npm i
npm start
```

To **build** the static version into the `dist` folder:

```sh
npm run build
```

To **preview and develop** your site:

```sh
npm start
```

Open your browser at <http://localhost:8080>. The browser will reload after any change you saved to your project.

## Site

Creating a new site starts with an entry file usually `site/index.js`. This one only export one default function that takes a `path` argument:

```js
export default function (path) {
  let site = new Site(path)
  // Define your site's pages here
  return site
}
```

The `path` in out example is `site` from `site/index.js`. This is required because we cannot use `__dirname` due to implementation details.

```jsx
site.html("/sample", (ctx) => {
  ctx.body = <div>Hello World</div>
})
```

This will create an HTML file with content `<div>Hello World</div>`. It uses JSX to describe the content. HTML files will automatically reload when the content or a referenced asset changes. `<html>`, `<head>`, `<body>` and everything es needed will be added automatically.

As you noted the Context `ctx` contains data and can receive new data as well for other [Middleware](#middleware) (see below). It is important to put the result into `ctx.body`.

## Middleware

Hostic makes use of the _middleware programming pattern_ as known from Koa.js or Express.js. Complexity and extensibility can quite elegantly be managed this way.

A middleware is written as easy such a simple function:

```js
;async (ctx, next) => {
  // Do something before nested middlewares are executed
  await next()
  // Do something after bested middlewares were executed
}
```

You can register the middleware like this:

```js
site.use(myMiddlewareFunction)
```

It can also be added per page, like this:

```js
site.html("/", template, async (ctx) => {
  ctx.body = <div>My content for the template</div>
})
```

## Context

The context that is passed to Middleware is important. The most important property of it is `body`. It holds the content of the page. For HTML and XML usually in form of a [virtual DOM](https://github.com/holtwick/zeed-dom). But it can also be used to pass properties to other Middlewares, like `lang` for language or `title` for the page title.

## Plugins

A special kind of Middleware is the Plugin. It is basically the same, but it can have some attributes to better define its place in the process chain. You add them like this:

```js
import { plugin } from "hostic"

// ...

app.use(plugin.tidy())
```

This is the most simple variant of a plugin:

```js
export function example(opt = {}) {
  return {
    name: 'example',
    priority: 0.80,
    middleware: async (ctx, next) => {
      // ...
      await next()
      // ..
    })
  })
```

The `priority` tells when the plugin should be executed. The higher the value the earlier it executes. Imagine it like they are nested like this:

```js
jsx {
  links {
    html {
   		// your middleware
    }
  }
}
```

These are the priorities of plugins bundled with Hostic. The ones with stars are activated by default.

| Priority | Plugin                                 | Description                                                   |
| -------- | -------------------------------------- | ------------------------------------------------------------- |
| 0.99     | **\*jsx**                              | Provides JSX Functionality                                    |
| 0.98     | tidy                                   | Makes HTML pretty                                             |
| 0.90     | ...                                    | User slot for top level plugins                               |
| 0.80     | locale, **\*links**                    | Apply translations and adjust links and media to be absolute  |
| 0.70     | ...                                    | User slot for plugins that require translations               |
| 0.60     | disqus, matomo, cookieConsent, youtube | Services                                                      |
| 0.55     | meta                                   | SEO funcitionality                                            |
| 0.50     | **\*html**                             | Makes sure `body` and `head` are correct, otherwise adds them |
|          | ...                                    | User slot for templates etc. Default priority is `0`          |

More details:

### matomo

Adds tracking code for Matomo to pages to allow better insights about your visitors. The code is respecting "don't track me" settings and also has an entry point for users to opt out.

### youtube

Use the original code from YouTube to embed a video and this plugin will replace it by a lazy loading alternative. This helps speeding up page load while at the same time improving privacy for the visitor.

### cookieConsent

Displays an information about the use of cookies, required by European law.

### disqus

Privacy conforming integration of Disqus service.

### locale

Translate:

- Text content that starts with underscore like `<div>_Translate this</div>`
- Remove elements with not matching languages in `data-lang` attributes, like `<div data-lang="en">Translate this</div>`
- Remove non matching elements like `<en>Translate this</en>`

Translations can be provided as simple objects like:

```json
{
  "Translate this": "Übersetze das"
}
```

## Virtual DOM ([zeed-dom](https://github.com/holtwick/zeed-dom))

This [DOM abstraction](https://github.com/holtwick/zeed-dom) for HTML and XML content is not designed for speed like in UI frameworks. Its goal is to help doing post process tasks on the content with familiar API. You can e.g. use CSS selectors to retrieve elements like `root.querySelectorAll('img[src]')` and then manipulate like `element.setAttribute('src', src + '?ref=example')`. Some special additions help to work on nodes like `document.handle('h1,h2,h3', e => e.classList.add('header'))`.

Learn more at [github.com/holtwick/zeed-dom](https://github.com/holtwick/zeed-dom).

## Static Files

Serving static files:

- `site.static('favicon.ico')`: Serve file at `/favicon.ico`
- `site.static('assets`): Serve folder `/assets`
- `site.static('css/style.css', 'assets/style.css')`: Serve file `assets/style.css` under `/css/style.css`

## Markdown

As for most static site generators Markdown is a welcome format for content. The first part describes properties in YAML and the second part the textual content:

```markdown
---
title: Example
lang: en
---

# Example of a Page

Lorem ipsum
```

(more details to be added)

## Lazy Loading and Multiple Passes

Site creation and serving contents are two separate steps. In the first step paths and their contents descriptions are registered to a site manager. In the second step the content is dynamically generated on demand.

A benefit from this separation is, that the content registration can have multipe passes, for example you can first register all pages and then in a second pass modify them. As an example in a multi language website it is possible to first register all pages and then connect the alternate pages. An example:

```js
site.routes.values().forEach((page) => {
  if (page.path.startsWith("/en/")) {
    page.meta.alt = {
      de: "/de/" + page.path.substr(4),
      "*": "/" + page.path.substr(4), // Redirection based on
    }
  }
})
```

Another step is done for assets. If a HTML page has references to images, CSS, JS etc. it can add these references on the fly. That increases speed and offers more flexibility. The build process for the static pages is therefore run twice, because in the first step new references to assets might have been added.

## Apache

By convention the `.html` suffix is dropped i.e. the url `/a/b.html` will become `/a/b`. To support this on Apache add a `.htaccess` file with the following lines:

```apache
RewriteEngine on
RewriteRule ^([^.]+[^/])$ $1.html [PT]
```

## Configuration

The top level of configuration are environment variables. You can set them in your build environment or note them down into `.env` or `.env.local` files. The later one is intended to be excluded from Git repositories in case you need to set sensitive information.

Available settings are:

- `BASE_URL=https://holtwick.de` - The base URL that is required to calculate absolute URLs e.g. for canonical URL or alternative languages meta data, but also for sitemaps and the like. For the preview server this will be automatically set to the appropriate `localhost` address. This is especially useful if you are building for different targets like `stage` and `production`.
- `PORT=8080` - The preview servers port number

## Performance

Fast previews and build processes are a great thing to have if you are working with a tool like this. Hostic tries to achieve this by doing the following:

- For transpilation [esbuild](https://github.com/evanw/esbuild) is used, the fastest tool around right now
- Pages are only loaded on demand. When code changes first the routes are build and only if a preview is requested this one page is generated in that moment.
- It does not use frameworks like Webpack or React that again bring their own complexity. File changes are tracked directly and all other implementations are quite basic without relying on to much other frameworks.

## Be aware of ...

- All resulting URL paths are absolute. HTML files have no `.html` extension.
- All paths in JS and JSX have to be absolute from the site's origin, those from Markdown files can also be releative.
- You cannot use `__dirname` because code is transpiled to a monolithic JS file that lives in `.hostic` folder.
- LESS or SCSS transform is not supported nor other optimizations that an IDE like IntelliJ can provide out of the box as well. If you want to have it please contribute or support.

## Why another web site builder?

Read about it in [my blog](https://holtwick.de/blog/birth-of-hostic?ref=github&kw=hostic).

I don't know... there are plenty of good tools around. But I stumbled into creating this one and then got fascinated by [esbuild](https://github.com/evanw/esbuild), [vite](https://github.com/vitejs/vite), the own virtual DOM and other details that where interesting to implement. For non geeky people it might be easier to start with something from the shelf like [11ty](https://www.11ty.dev/).

## License

Hostic is free and can be modified and forked. But the conditions of the EUPL (European Union Public License 1.2) need to be respected, which are similar to ones of the GPL. In particular modifications need to be free as well and made available to the public.

For different licensing options please contact [license@holtwick.de](mailto:license@holtwick.de).

Get a quick overview of the license at [Choose an open source license](https://choosealicense.com/licenses/eupl-1.2/). This license is available in the [languages of the European Community](https://eupl.eu/).

## Author

My name is Dirk Holtwick. I'm an independent software developer located in Germany. Learn more at [hotlwick.de](https://holtwick.de/de/about).
