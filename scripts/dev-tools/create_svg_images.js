const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'apps/web/public/assets/products');

const makeSvg = (bg1, bg2, accent, brand, model, specs, icon) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="600" height="400" fill="url(#bg)" rx="16"/>
  <!-- Laptop body base -->
  <rect x="80" y="270" width="440" height="20" rx="4" fill="rgba(0,0,0,0.4)"/>
  <!-- Laptop screen/lid -->
  <rect x="100" y="70" width="400" height="240" rx="10" fill="#1a1a1a" stroke="${accent}" stroke-width="2"/>
  <!-- Screen content -->
  <rect x="116" y="84" width="368" height="212" rx="4" fill="url(#screen)"/>
  <!-- Brand text on screen -->
  <text x="300" y="165" font-family="Arial Black,sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle" opacity="0.9">${brand}</text>
  <text x="300" y="198" font-family="Arial,sans-serif" font-size="16" fill="${accent}" text-anchor="middle">${model}</text>
  <!-- Specs -->
  ${specs.map((s,i) => `<text x="300" y="${225 + i*22}" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" text-anchor="middle">${s}</text>`).join('\n  ')}
  <!-- Laptop keyboard base -->
  <rect x="86" y="282" width="428" height="14" rx="4" fill="#2a2a2a" stroke="${accent}" stroke-width="1"/>
  <!-- Keyboard keys suggestion -->
  <rect x="130" y="285" width="340" height="8" rx="2" fill="${accent}" opacity="0.15"/>
  <!-- Touchpad -->
  <rect x="240" y="287" width="120" height="6" rx="3" fill="${accent}" opacity="0.2"/>
</svg>`;

const images = [
  {
    file: 'dell-xps.svg',
    bg1: '#0f2027', bg2: '#203a43',
    accent: '#00b4d8',
    brand: 'Dell', model: 'XPS 15 9530',
    specs: ['Intel Core i7-13700H · 32GB DDR5', 'OLED 4K Touch 15.6" · RTX 4070', '1TB NVMe PCIe 5.0 SSD']
  },
  {
    file: 'razer-blade.svg',
    bg1: '#0a0f0a', bg2: '#0d200d',
    accent: '#00ff41',
    brand: 'Razer', model: 'Blade 15',
    specs: ['Intel Core i7-10875H · 16GB DDR4', 'FHD 300Hz OLED · RTX 2080 SUPER', '1TB NVMe SSD · CNC Aluminum']
  },
  {
    file: 'hp-spectre.svg',
    bg1: '#1a0533', bg2: '#2d1b69',
    accent: '#0096d6',
    brand: 'HP', model: 'Spectre x360',
    specs: ['Intel Core i7-1065G7 · 16GB LPDDR4x', '4K AMOLED 13.3" Touch · Iris Plus', '512GB + 32GB Optane · 2-in-1']
  },
  {
    file: 'alienware.svg',
    bg1: '#050a14', bg2: '#0a1628',
    accent: '#00ccff',
    brand: 'Alienware', model: 'Area-15',
    specs: ['Intel Core i7-8750H · 32GB DDR4', 'FHD 144Hz · NVIDIA GTX 1070 8GB', '1TB NVMe SSD · AlienFX RGB']
  },
  {
    file: 'asus-rog-new.svg',
    bg1: '#1a0a0a', bg2: '#2d0d0d',
    accent: '#ff1744',
    brand: 'ASUS ROG', model: 'G751JT',
    specs: ['Intel Core i7-4710HQ · 16GB DDR3', '17.3" FHD · GTX 970M 3GB', '256GB SSD + 1TB HDD · AuraSync']
  },
  {
    file: 'lenovo-x1.svg',
    bg1: '#0a0a0a', bg2: '#1a1a1a',
    accent: '#e8202c',
    brand: 'Lenovo', model: 'ThinkPad X1',
    specs: ['Intel Core i7-8550U · 16GB LPDDR3', 'WQHD 14" IPS · Intel UHD 620', '512GB NVMe SSD · MIL-SPEC 810G']
  }
];

images.forEach(img => {
  const svg = makeSvg(img.bg1, img.bg2, img.accent, img.brand, img.model, img.specs, '');
  fs.writeFileSync(path.join(dir, img.file), svg, 'utf8');
  console.log('Created:', img.file);
});

console.log('All SVG images created!');
