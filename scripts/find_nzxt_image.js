const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const html = await fetchPage('https://nzxt.com/product/kraken-elite-360-rgb');
    const matches = html.match(/https?:\/\/[^"'\s\)]+\.(?:png|jpg|webp)/gi) || [];
    console.log('NZXT media matches:', matches.filter(m => m.includes('kraken') || m.includes('cdn') || m.includes('media') || m.includes('assets')));
  } catch(e) {
    console.error(e);
  }
})();
