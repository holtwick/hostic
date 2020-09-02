import { matomoAnalytics, matomoCampaignURL } from './matomo.js'

describe('pugin.matomo', () => {

  const matomo = {
    url: 'https://stats.holtwick.de/matomo/',
    id: 2,
  }

  it('should update a campaign url', () => {
    let url = matomoCampaignURL('https://www.receipts-app.com/de/help?me#now', {
      name: 'campaign1',
      kw: 'keyword1',
    })
    expect(url).toEqual('https://www.receipts-app.com/de/help?me=&pk_campaign=campaign1&pk_kwd=keyword1#now')
  })

  // it('should create a count pixel', () => {
  //   let html = matomoPixelImage({
  //     matomo,
  //     url: '/rss-opened',
  //   })
  //   expect(html).toEqual('<img src="https://stats.holtwick.de/matomo/matomo.php?idsite=2&amp;rec=1&amp;bots=1&amp;url=%2Frss-opened&amp;_rcn=blog" alt="" style="border:0;">')
  // })

  it('should add to page', () => {
    const sample = matomoAnalytics(matomo)
    expect(sample).toBe(`<script>
var disableStr = 'ga-disable-2';

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
    var u="https://stats.holtwick.de/matomo/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '2']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
} 
</script><noscript><img src="https://stats.holtwick.de/matomo/matomo.php?idsite=2&amp;rec=1" style="border:0;" alt=""></noscript>`)
  })

  it('should change url', () => {
    const matomoCampaign = 'a'
    const matomoKeyword = 'b'

    const handleURL = (url) => {
      url = new URL(url)
      matomoCampaign && url.searchParams.append('pk_campaign', matomoCampaign)
      matomoKeyword && url.searchParams.append('pk_kwd', matomoKeyword)
      return url.toString()
    }

    expect(handleURL('https://holtwick.de/imprint')).toBe('https://holtwick.de/imprint?pk_campaign=a&pk_kwd=b')
  })

})
