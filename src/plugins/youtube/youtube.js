import css from './youtube.css'
import { TYPE_HTML } from '../../site/types.js'

const log = require('debug')('hostic:plugin:youtube')

export function youtube(pluginOpt = {}) {
  return {
    name: 'youtube',
    priority: 0.6,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {

      await next()

      let { videoTitle = 'Play video' } = Object.assign({}, pluginOpt, ctx.youtube || {})
      // log('apply plugin youtube', element)

      let document = ctx.body.ownerDocument

      document.handle('iframe[src]', (iframe, i) => {
        let src = iframe.getAttribute('src')
        log('Found video', src)
        let m = /^https:\/\/www.youtube(?:-nocookie)?.com\/embed\/(.*?)$/.exec(src)
        if (m && m.length) {
          let key = m[1]
          if (key && key.length) {
            let root = iframe

            let div = iframe.parent('div.embed-video-container,div.embed-responsive')
            if (div) {
              root = div
            }

            let staticLink = `https://youtu.be/${key}`
            let onClick = `this.parentNode.innerHTML = '<iframe src="https://www.youtube.com/embed/${key}?autoplay=1" frameborder="0" allowFullScreen class="video-embed-item"></iframe>'; return false;`
            let thumbnailURL = `https://i.ytimg.com/vi/${key}/0.jpg`

            document.head.appendChild(<meta property="og:video" content={staticLink}/>)

            if (!document.querySelector('#youtube-plugin-css')) {
              log('Add CSS')
              let styles = <style id="youtube-plugin-css">{css}</style>
              document.head.appendChild(styles)
            }

            root.replaceWith(
              <div className="video-wrapper">
                <a href={staticLink} onClick={onClick} style={`background-image:url("${thumbnailURL}");`} title={videoTitle}></a>
                <div className="video-overlay-content">
                  <div className="video-overlay-inner">
                    <svg className="video-overlay-play-button" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#fff"/>
                      <polygon points="70, 55 70, 145 145, 100" fill="#fff"/>
                    </svg>
                    <div>{videoTitle}</div>
                  </div>
                </div>
              </div>)
          }
        }
      })
    },
  }
}
