const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
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
    const html1 = await fetchPage('https://www.deepcool.com/products/Cooling/cpuliquidcoolers/LT720-WH-360mm-Liquid-CPU-Cooler/2023/16781.shtml');
    const imgs1 = html1.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|webp)/gi) || [];
    console.log('LT720 images found:', imgs1.filter(u => u.includes('LT720') || u.includes('upload') || u.includes('products')));

    const html2 = await fetchPage('https://www.deepcool.com/products/Cooling/cpuaircoolers/AK620-Digital-Performance-CPU-Cooler-With-Status-Display-1700-AM5/2023/17202.shtml');
    const imgs2 = html2.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|webp)/gi) || [];
    console.log('AK620 images found:', imgs2.filter(u => u.includes('AK620') || u.includes('upload') || u.includes('products')));
  } catch(e) {
    console.error(e);
  }
})();
