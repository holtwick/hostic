import { TYPE_HTML } from '../site/types.js'

const defaultOpt = {
  selector: '.disqus',
  disqusURL: null, // 'https://xxx.disqus.com/embed.js',
}

export function disqus(pluginOpt) {

  return {
    name: 'disqus',
    priority: 0.6,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      await next()

      let opt = Object.assign({}, defaultOpt, pluginOpt, ctx.disqus || {})

      const { lang } = ctx
      const privacyURL = ctx?.privacyURL ?? opt?.privacyURL ?? (lang ? `/${lang}/privacy` : '/privacy')

      const document = ctx.body.ownerDocument
      document.querySelectorAll(opt.selector).forEach(containerElement => {
        let id = ctx.path.replace(/\..+?$/, '').replace(/\/-/, '/')
        let url = ctx.url
        let html = <div>
          <div id="disqus_thread" style="display: none;">
            <blockquote>
              <p>
                <en>The comment functionality is provided by <a href="https://disqus.com">Disqus</a>.</en>
                <de>Die Kommentarfunktionalität wird von <a href="https://disqus.com">Disqus</a> zur Verfügung gestellt.</de>
                <br/>
                <en>Learn more about it in our <a href={privacyURL}>Privacy Policy</a>.</en>
                <de>Erfahre mehr darüber in unserer <a href={privacyURL}>Datenschutzerklärung</a>.</de>
              </p>
              <p>
                <br/>
                <button onClick="showComments();return false;" className="btn btn-default">
                  <en>Show Comments. Share your opinion.</en>
                  <de>Kommentare anzeigen. Teile deine Meinung.</de>
                </button>
              </p>
            </blockquote>
          </div>

          <script>{`
          document.getElementById('disqus_thread').style.display = 'block'
          var disqus_config = function () {
              this.page.url = '${url}'
              this.page.identifier = '${id}'
          }
          function showComments() {
              document.getElementById('disqus_thread').innerHTML = 'Loading...';
              (function () { // DON'T EDIT BELOW THIS LINE
                  var d = document, s = d.createElement('script')
                  s.src = '${opt.disqusURL}'
                  s.setAttribute('data-timestamp', +new Date());
                  (d.head || d.body).appendChild(s)
              })()
          }
        `}</script>
        </div>

        containerElement.replaceWith(html)
      })
    },
  }
}
