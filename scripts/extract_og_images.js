const https = require('https');

function getOgImage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      data.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        resolve(match ? match[1] : null);
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  console.log('Corsair:', await getOgImage('https://www.corsair.com/us/en/p/cpu-coolers/cw-9060070-ww/icue-h150i-elite-capellix-xt-liquid-cpu-cooler-cw-9060070-ww'));
  console.log('NZXT:', await getOgImage('https://nzxt.com/product/kraken-elite-360-rgb'));
  console.log('Deepcool LT720:', await getOgImage('https://www.deepcool.com/products/Cooling/cpuliquidcoolers/LT720-360mm-Liquid-CPU-Cooler/2022/16279.shtml'));
  console.log('Deepcool AK620:', await getOgImage('https://www.deepcool.com/products/Cooling/cpuaircoolers/AK620-Digital-Performance-CPU-Cooler-With-Status-Display-1700-AM5/2023/17202.shtml'));
})();
