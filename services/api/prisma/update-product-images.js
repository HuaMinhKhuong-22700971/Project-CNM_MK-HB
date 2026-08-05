const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PRODUCT_IMAGES = [
  { slug: "intel-core-i5-13400f", image_url: "/images/products/intel-core-i5-13400f.png" },
  { slug: "amd-ryzen-5-7600", image_url: "/images/products/amd-ryzen-5-7600.png" },
  { slug: "intel-core-i7-13700k", image_url: "/images/products/intel-core-i5-13400f.png" },
  { slug: "amd-ryzen-7-7800x3d", image_url: "/images/products/amd-ryzen-5-7600.png" },
  { slug: "asus-tuf-gaming-b760m-plus-wifi", image_url: "/images/products/asus-tuf-gaming-b760m-plus-wifi.png" },
  { slug: "msi-mag-b650-tomahawk-wifi", image_url: "/images/products/msi-mag-b650-tomahawk-wifi.png" },
  { slug: "gigabyte-b760-aorus-elite-ax", image_url: "/images/products/asus-tuf-gaming-b760m-plus-wifi.png" },
  { slug: "asus-dual-geforce-rtx-4060-8gb-oc", image_url: "/images/products/asus-dual-geforce-rtx-4060-8gb-oc.png" },
  { slug: "msi-rtx-4070-super-ventus-3x-12gb-oc", image_url: "/images/products/asus-dual-geforce-rtx-4060-8gb-oc.png" },
  { slug: "ram-kingston-fury-beast-16gb-ddr5", image_url: "/images/products/ram-kingston-fury-beast-16gb-ddr5.png" },
  { slug: "corsair-vengeance-32gb-ddr5-6000", image_url: "/images/products/ram-kingston-fury-beast-16gb-ddr5.png" },
  { slug: "ssd-kingston-nv2-1tb-nvme", image_url: "/images/products/ssd-kingston-nv2-1tb-nvme.png" },
  { slug: "samsung-990-pro-2tb-nvme-pcie5", image_url: "/images/products/ssd-kingston-nv2-1tb-nvme.png" },
  { slug: "nguon-corsair-cv750-750w", image_url: "/images/products/nguon-corsair-cv750-750w.png" },
  { slug: "corsair-rm850x-850w-gold-modular", image_url: "/images/products/nguon-corsair-cv750-750w.png" },
  { slug: "deepcool-ak400-cpu-cooler", image_url: "/images/products/deepcool-ak400.png" },
  { slug: "nzxt-h510-flow-mid-tower", image_url: "/images/products/nzxt-h510.png" }
];

async function main() {
  console.log("Updating all product images...");

  for (const item of PRODUCT_IMAGES) {
    const product = await prisma.product.findFirst({ where: { slug: item.slug } });

    if (!product) {
      console.log(`  [SKIP] Product not found: ${item.slug}`);
      continue;
    }

    const updated = await prisma.productSku.updateMany({
      where: { product_id: product.id },
      data: { image_url: item.image_url }
    });

    console.log(`  [OK] ${item.slug} => ${item.image_url} (${updated.count} SKU)`);
  }

  console.log("\nAll images updated!");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
