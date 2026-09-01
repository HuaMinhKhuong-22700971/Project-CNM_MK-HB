const fs = require("fs");
const path = require("path");

const brainDir = "C:/Users/ASUS/.gemini/antigravity-ide/brain/43d99554-9326-445f-a306-692407df7a73";
const publicTargetDir = "d:/Project CNM_MK-HB/apps/web/public/assets/products/cooling-real";

if (!fs.existsSync(publicTargetDir)) {
  fs.mkdirSync(publicTargetDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);
const pngFiles = files.filter(f => f.endsWith(".png"));

console.log("PNG Files in brain dir:", pngFiles);

const mapping = {
  air_cooler_peerless: "peerless-120.png",
  aio_360_liquid_cooler: "aio-360.png",
  noctua_black_cooler: "noctua-d15.png",
  aio_240_liquid_cooler: "aio-240.png",
  single_tower_cooler: "single-tower.png"
};

for (const [key, destName] of Object.entries(mapping)) {
  const matched = pngFiles.find(f => f.startsWith(key));
  if (matched) {
    const srcPath = path.join(brainDir, matched);
    const destPath = path.join(publicTargetDir, destName);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${matched} -> ${destName}`);
  }
}
