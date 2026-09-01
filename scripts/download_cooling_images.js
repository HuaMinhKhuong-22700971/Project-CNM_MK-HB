const fs = require('fs');
const https = require('https');
const path = require('path');

const targets = [
  {
    name: 'corsair-h150i-elite-capellix-xt.png',
    url: 'https://product.hstatic.net/200000722513/product/cw-9060070-ww_1_b4bfaed067424fbdaef04c05561a0bc3_master.png'
  },
  {
    name: 'nzxt-kraken-elite-360-rgb.png',
    url: 'https://product.hstatic.net/200000722513/product/kraken-elite-360-rgb-black-1_e388c3df5b4b455b88bd3fb0ca4d9fa2_master.png'
  },
  {
    name: 'deepcool-lt720-360.jpg',
    url: 'https://product.hstatic.net/200000722513/product/lt720_01_a9f8b4bc0cf34c44b9ff3e99cf4a4c6a_master.jpg'
  },
  {
    name: 'deepcool-ak620-digital.jpg',
    url: 'https://product.hstatic.net/200000722513/product/ak620_digital_01_561bc6d88c8942b0a1d47cf5c9a416a9_master.jpg'
  }
];

async function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://gearvn.com/'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, targetPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    });
    req.on('error', reject);
  });
}

(async () => {
  const destDir = path.join(__dirname, '../apps/web/public/assets/products/cooling-real');
  for (const item of targets) {
    const filePath = path.join(destDir, item.name);
    try {
      await downloadFile(item.url, filePath);
      const stat = fs.statSync(filePath);
      console.log(`SUCCESS: ${item.name} (${stat.size} bytes)`);
    } catch (err) {
      console.error(`FAILED: ${item.name} - ${err.message}`);
    }
  }
})();
