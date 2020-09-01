// Support for Matomo integration, respecting do not track

import { assert } from '../../utils/assert.js'
import { parseHTML } from '../../html/vdomparser.js'
import { TYPE_HTML } from '../../site/types.js'

export function matomoCampaignURL(url, opt = {}) {
  const {
    name = 'blog',
    kw = '',
    source = '',
  } = opt
  assert(url, '[plugin.matomo] url required')
  let href = new URL(url)
  name && href.searchParams.set('pk_campaign', name)
  kw && href.searchParams.set('pk_kwd', kw)
  source && href.searchParams.set('pk_source', source)
  return href.toString()
}

export function matomoPixelImage(opt) {
  const {
    matomo,
    url,
    action,
    name = 'blog',
    kw = '',
  } = opt
  assert(matomo.id, '[plugin.matomo] matomo.id required')
  assert(matomo.url, '[plugin.matomo] matomo.url required')
  assert(url, '[plugin.matomo] url required')
  let href = new URL(matomo.url + 'matomo.php')
  href.searchParams.set('idsite', matomo.id.toString())
  href.searchParams.set('rec', '1')
  href.searchParams.set('bots', '1')
  href.searchParams.set('url', url)
  action && href.searchParams.set('action_name', action)
  name && href.searchParams.set('_rcn', name) // Campaign name
  kw && href.searchParams.set('_rck', kw) // Campaign keyword
  return <img src={href.toString()} style="border:0;" alt=""/>
}

export function matomoAnalytics(opt) {
  let { url, id } = opt || {}

  assert(url, '[plugin.matomo] url required')
  assert(id, '[plugin.matomo] id required')

  return `<script>
var disableStr = 'ga-disable-${id}';

function gaOptout() {
  document.cookie = disableStr + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
  window[disableStr] = true;
  alert('Tracking has been disabled.');
}

if (!((window.navigator && window.navigator['doNotTrack'] == 1) || (document.cookie && document.cookie.indexOf(disableStr + '=true') !== -1))) {    
  var _paq = window._paq || []; 
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="${url}";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '${id}']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
} 
</script><noscript><img src="${url}matomo.php?idsite=${id}&amp;rec=1" style="border:0;" alt=""></noscript>`
}

// matomo: {
//   url: 'https://stats.holtwick.de/matomo/',
//   id: 4,
// },

export function matomo(pluginOpt = {}) {
  return {
    name: 'matomo',
    priority: 0.6,
    type: TYPE_HTML,
    middleware: async (ctx, next) => {
      await next()
      let { url, id } = Object.assign({}, pluginOpt, ctx.matomo || {})
      let body = ctx.body.ownerDocument.body
      body.appendChild(parseHTML(matomoAnalytics({ url, id })))
    }
  }
}
