<div><img src="./icon.png" style="border-radius: 8px" height="64"></div>

# Hostic

**Yet another static web site builder**

There are plenty static web site generators around, but many of them *think* for you or try to make use of a specific framework on all costs. Hostic in contrary was built from the ground to use the optimal tools for the task while keeping the process pleasant. 

Some features:

- **Supports JSX** but is not related to any framework like React, Vue or Svelte
- Implements a light way DOM abstraction to easily allow **post process** tasks like calculating image sizes, optimize for SEO, etc.
- **Real time preview** with self reloading pages. Experiment with different designs or contents.
- **Any file type** can be created like XML sitemaps of RSS feeds, robots.txt or whatever you need
- Great **Markdown support**: Write your articles using Markdown and refer to assets used in it. Hostic puts it all together. Works great with [OnePile.app](https://onepile.app?ref=hostic&kw=github).
- **Plugins** help doing common repetitive tasks with ease
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
site.html('/sample', ctx => {
  ctx.body = <div>Hello World</div>
})
```

This will create an HTML file with content `<div>Hello World</div>`. It uses JSX to describe the content. HTML files will automatically reload when the content or a referenced asset changes. `<html>`, `<head>`, `<body>` and everything es needed will be added automatically.

As you noted the Context `ctx` contains data and can receive new data as well for other [Middleware](#middleware) (see below). It is important to put the result into `ctx.body`. 

## Middleware

Hostic makes use of the *middleware programming pattern* as known from Koa.js or Express.js. Complexity and extensibility can quite elgantly be managed this way.

A middleware is written as easy such a simple function:

```js
async (ctx, next) => {
  // Do something before nested middlewares are executed
  await next()
  // Do something after bested middlewares were executed
}
```

You can register the middleware like this:

```js
site.use(tidy(options))
```

In this case `tidy` would be a middleware that pretty prints HTML content. It is called to pass options and will return a function as described before.

For advanced use cases it is also possible to register an object, that explain more about itself for better integration like:

```js
site.use({
  top: true,
  middleware: tidy()
})
``` 

This example will put the middleware on the very top of the execution line. In this case it makes sense, because then we can be sure that all the HTML document setup has already been performed.

Middleware can of course be added per page, like this:

```js
site.html('/', template, async ctx => {
  ctx.body = <div>My content for the template</div>
})
```

Here are some example plugins that already come with Hostic:

### hyperlinks

Iterates through all hyperlinks and allows to apply specific changes to them.

### matomo

Adds tracking code for Matomo to pages to allow better insights about your visitors. The code is respecting "don't track me" settings and also has an entry point for users to opt out.

### youtube

Use the original code from YouTube to embed a video and this plugin will replace it by a lazy loading alternative. This helps speeding up page load while at the same time improving privacy for the visitor.

### localization

xxx

## Virtual DOM

This DOM abstraction for HTML and XML content is not designed for speed like in UI frameworks. Its goal is to help doing post process tasks on the content with familiar API. You can e.g. use CSS selectors to retrieve elements like `root.querySelectorAll('img[src]')` and then manipulate like `element.setAttribute('src', src + '?ref=example')`.

xxx

## Page Structure

- `body`: The content of the page, can be any object of function, even a `Promise`
- `type`: MIME type of page. `text/html` and `text/xml` receive special handling including VDOM support. `text/plain` can also receive an array representing lines in the text document. `text/json` transforms objects as expected.

## Lazy Loading and Multiple Passes 

Site creation and serving contents are two separate steps. In the first step paths and their contents descriptions are registered to a site manager. In the second step the content is dynamically generated on demand. 

A benefit from this separation is, that the content registration can have multipe passes, for example you can first register all pages and then in a second pass modify them. As an example in a multi language website it is possible to first register all pages and then connect the alternate pages. An example:

```js
site.routes.values().forEach(page => {  
  if (page.path.startsWith('/en/')) {
    page.meta.alt = {
      'de': '/de/' + page.path.substr(4),
      '*': '/' + page.path.substr(4), // Redirection based on 
    }
  }
})
```

Another step is done for assets. If a HTML page has references to images, CSS, JS etc. it can add these references on the fly. That increases speed and offers more flexibility. The build process for the static pages is therefore run twice, because in the first step new references to assets might have been added. 

## Configuration {#env}

The top level of configuration are environment variables. You can set them in your build environment or note them down into `.env` or `.env.local` files. The later one is intended to be excluded from Git repositories in case you need to set sensitive information.

Available settings are:

- `BASE_URL=https://holtwick.de` - The base URL that is required to calculate absolute URLs e.g. for canonical URL or alternative languages meta data, but also for sitemaps and the like. For the preview server this will be automatically set to the appropriate `localhost` address. This is especially useful if you are building for different targets like `stage` and `production`. 

- `PORT=8080` - The preview servers port number 

## Performance {#performance}

Fast previews and build processes are a great thing to have if you are working with a tool like this. Hostic tries to achieve this by doing the following:

- For transpilation [esbuild](https://github.com/evanw/esbuild) is used, the fastest tool around right now
- Pages are only loaded on demand. When code changes first the routes are build and only if a preview is requested this one page is generated in that moment.
- It does not use frameworks like Webpack or React that again bring their own complexity. File changes are tracked directly and all other implementations are quite basic without relying on to much other frameworks.

## Be aware of ...

- All resulting URL paths are absolute
- All paths in JS and JSX have to be absolute from the site's origin, those from Markdown files can also be releative.
- You cannot use `__dirname` because code is transpiled to a monolithic JS file that lives in `.hostic` folder.
- LESS or SCSS transform is not supported nor other optimizations that an IDE like IntelliJ can provide out of the box as well. If you want to have it please contribute or support.

## Why another web site builder?

Read about it in [my blog](https://holtwick.de/blog/).

I don't know... there are plenty of good tools around. But I stumbled into creating this one and then got fascinated by [esbuild](https://github.com/evanw/esbuild), [vite](https://github.com/vitejs/vite), the own virtual DOM and other details that where interesting to implement. For non geeky people it might be easier to start with something from the shelf like [11ty](https://www.11ty.dev/).

---

### site.static

- `site.static('favicon.ico')`: Serve file at `/favicon.ico`
- `site.static('assets`): Serve folder `/assets`
- `site.static('css/style.css', 'assets/style.css')`: Serve file `assets/style.css` under `/css/style.css`

### site.html

```
site.html('/', ctx => {
    ctx.body = 'Hello World'
})
```


```
site.html('/', { title: 'Welcome' }, template, ctx => {
    ctx.body = 'Hello World'
})
```

### Plugins

0.99 jsx
0.98 tidy
0.90 ...
0.80 locale, links (assets)
0.70 ...
0.60 disqus, matomo, cookieConsent 
0.55 youtube
0.50 html

0.00 ... all others
