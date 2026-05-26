const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function getSeedStock(index) {
  return 10 + (index % 41);
}

async function main() {
  console.log("Starting seed...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: { name: "CPU" },
      create: { id: 1, name: "CPU" }
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: { name: "Mainboard" },
      create: { id: 2, name: "Mainboard" }
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: { name: "RAM" },
      create: { id: 3, name: "RAM" }
    }),
    prisma.category.upsert({
      where: { id: 4 },
      update: { name: "GPU" },
      create: { id: 4, name: "GPU" }
    }),
    prisma.category.upsert({
      where: { id: 5 },
      update: { name: "SSD" },
      create: { id: 5, name: "SSD" }
    })
  ]);

  console.log("Categories created:", categories.length);

  // Create products
  const products = [
    {
      slug: "cpu-i5-13400f",
      name: "Intel Core i5-13400F",
      description: "10 cores, strong gaming performance",
      price: 4800000,
      Category: { connect: { id: 1 } }
    },
    {
      slug: "cpu-i7-13700k",
      name: "Intel Core i7-13700K",
      description: "16 cores, high-end gaming",
      price: 8500000,
      Category: { connect: { id: 1 } }
    },
    {
      slug: "cpu-ryzen-5600",
      name: "AMD Ryzen 5 5600",
      description: "6 cores, budget gaming",
      price: 4200000,
      Category: { connect: { id: 1 } }
    },
    {
      slug: "mb-b760m",
      name: "B760M Mainboard",
      description: "Mainboard for Intel 12/13th gen",
      price: 2900000,
      Category: { connect: { id: 2 } }
    },
    {
      slug: "mb-z790",
      name: "Z790 Premium Mainboard",
      description: "High-end mainboard for Intel",
      price: 5500000,
      Category: { connect: { id: 2 } }
    },
    {
      slug: "ram-16gb-ddr4",
      name: "16GB DDR4 3200MHz",
      description: "16GB DDR4 RAM",
      price: 1200000,
      Category: { connect: { id: 3 } }
    },
    {
      slug: "ram-32gb-ddr5",
      name: "32GB DDR5 6000MHz",
      description: "32GB DDR5 RAM",
      price: 2800000,
      Category: { connect: { id: 3 } }
    },
    {
      slug: "gpu-rtx-4060",
      name: "NVIDIA RTX 4060",
      description: "Great 1080p/1440p gaming card",
      price: 8900000,
      Category: { connect: { id: 4 } }
    },
    {
      slug: "gpu-rtx-4070",
      name: "NVIDIA RTX 4070",
      description: "High-end 1440p gaming",
      price: 14500000,
      Category: { connect: { id: 4 } }
    },
    {
      slug: "ssd-1tb-nvme",
      name: "1TB NVMe SSD",
      description: "Fast NVMe SSD",
      price: 1500000,
      Category: { connect: { id: 5 } }
    },
    {
      slug: "ssd-2tb-sata",
      name: "2TB SATA SSD",
      description: "Large capacity SSD",
      price: 2200000,
      Category: { connect: { id: 5 } }
    }
  ];

  for (const [index, product] of products.entries()) {
    const existing = await prisma.product.findFirst({
      where: { slug: product.slug }
    });
    const stock = getSeedStock(index);
    
    if (!existing) {
      const created = await prisma.product.create({
        data: product
      });
      
      // Create ProductSku with image
      await prisma.productSku.create({
        data: {
          product_id: created.id,
          sku: product.slug.toUpperCase(),
          price: product.price,
          stock,
          image_url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`,
          status: "ACTIVE",
          is_active: true
        }
      });
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          is_active: true
        }
      });

      const existingSku = await prisma.productSku.findFirst({
        where: { product_id: existing.id }
      });

      if (existingSku) {
        await prisma.productSku.update({
          where: { id: existingSku.id },
          data: {
            stock: Math.max(Number(existingSku.stock || 0), stock),
            status: "ACTIVE",
            is_active: true
          }
        });
      } else {
        await prisma.productSku.create({
          data: {
            product_id: existing.id,
            sku: product.slug.toUpperCase(),
            price: product.price,
            stock,
            image_url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`,
            status: "ACTIVE",
            is_active: true
          }
        });
      }
    }
  }

  console.log("Products created:", products.length);
  console.log("Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
