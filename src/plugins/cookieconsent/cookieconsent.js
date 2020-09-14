import css from './cookieconsent.css'
import { TYPE_HTML } from '../../site/types.js'

const log = require('debug')('hostic:plugin:cookieconsent')

export function cookieConsent(pluginOpt = {}) {

  return {
    name: 'cookieconsent',
    priority: 0.6,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      let opt = Object.assign({}, pluginOpt)

      await next()

      const { lang } = ctx
      const privacyURL = ctx.privacyURL ?? opt.privacyURL ?? (lang ? `/${lang}/privacy` : '/privacy')

      let body = ctx.body.ownerDocument.body
      body.appendChild(
        <fragment>
          <div id="cookie-consent" className="cookie-consent d-none">
            <div className="cookie-consent-body">
              <en>This website uses cookies to ensure you get the best experience on our website.</en>
              <de>Diese Website nutzt Cookies, um bestmögliche Funktionalität bieten zu können.</de>
              {' '}
              <a href={privacyURL}>
                <en>Learn&nbsp;more</en>
                <de>Mehr&nbsp;Informationen</de>
              </a>
            </div>
            <div className="cookie-consent-buttons">
              <button onClick="giveCookieConsent()" className="btn btn-outline-info">
                <en>Got&nbsp;it</en>
                <de>Verstanden</de>
              </button>
            </div>
          </div>
          <style>{css}</style>
          <script>{`
          var cookieConsentString = 'cookie-consent-ok'
          
          window.giveCookieConsent = function () {
            console.log('Cookie consent given')
            document.cookie = cookieConsentString + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/; Secure'
            document.getElementById('cookie-consent').classList.add('d-none')
            return false
          } 
          
          window.addEventListener('load', function () {
            if (!(document.cookie && document.cookie.indexOf(cookieConsentString + '=true') !== -1)) {
              console.log('Cookie consent pending')
              document.getElementById('cookie-consent').classList.remove('d-none')
            } else {
              console.log('Cookie consent ok')
            }
          })
        `}</script>
        </fragment>,
      )
    },
  }
}
