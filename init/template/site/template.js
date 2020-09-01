// Everything is "middleware", you can use it to create templates as well

export function template(options = {}) {
  const { imageHeight = 128 } = options

  return async (ctx, next) => {
    await next()

    // Header elements like <link> will be moved into <head> by outer middlewares
    ctx.body = <div className="hostic">
      <link rel="stylesheet" href="/index.css"/>
      <div>
        <img src="/icon.png" alt="Hostic Icon" height={imageHeight}/>
      </div>
      <h1>
        {ctx.title}
      </h1>
      {ctx.body}
      <p><br/></p>
      <p>
        Hostic is Open Source, <a href="https://github.com/sponsors/holtwick">please support</a>
      </p>
      {
        ctx.buildTime && <div className="buildTime">
          <p><br/></p>
          <p><i>{ctx.buildTime}</i></p>
        </div>
      }
    </div>

    // The ctx.title is also used for <title> by convention
    ctx.title = ctx.title + ' (Hostic!)'
  }
}
