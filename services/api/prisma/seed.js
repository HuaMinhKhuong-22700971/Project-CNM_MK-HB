const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const adminEmail = "admin@cnm.local";
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "System Admin",
      role: "ADMIN"
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      fullName: "System Admin",
      role: "ADMIN"
    }
  });

  const techEmail = "tech1@cnm.local";
  const techPassword = await bcrypt.hash("Tech@123", 10);

  await prisma.user.upsert({
    where: { email: techEmail },
    update: {
      fullName: "Technician One",
      role: "TECHNICIAN"
    },
    create: {
      email: techEmail,
      password: techPassword,
      fullName: "Technician One",
      role: "TECHNICIAN"
    }
  });

  const categoryNames = ["CPU", "Mainboard", "RAM", "GPU", "SSD"];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, isActive: true },
      create: {
        name,
        slug: slugify(name),
        description: `${name} components`,
        isActive: true
      }
    });
  }

  const cpuCategory = await prisma.category.findUnique({ where: { slug: "cpu" } });
  const gpuCategory = await prisma.category.findUnique({ where: { slug: "gpu" } });
  const mainCategory = await prisma.category.findUnique({ where: { slug: "mainboard" } });

  if (cpuCategory) {
    const cpu = await prisma.product.upsert({
      where: { sku: "CPU-I5-13400F" },
      update: {
        name: "Intel Core i5-13400F",
        slug: "intel-core-i5-13400f",
        price: 4800000,
        stock: 20,
        isActive: true,
        categoryId: cpuCategory.id
      },
      create: {
        sku: "CPU-I5-13400F",
        name: "Intel Core i5-13400F",
        slug: "intel-core-i5-13400f",
        description: "10 cores, strong gaming performance",
        price: 4800000,
        stock: 20,
        isActive: true,
        categoryId: cpuCategory.id
      }
    });

    await prisma.productAttribute.upsert({
      where: {
        productId_key: {
          productId: cpu.id,
          key: "socket"
        }
      },
      update: { value: "LGA1700" },
      create: {
        productId: cpu.id,
        key: "socket",
        value: "LGA1700"
      }
    });
  }

  if (mainCategory) {
    const board = await prisma.product.upsert({
      where: { sku: "MB-B760M" },
      update: {
        name: "B760M Mainboard",
        slug: "b760m-mainboard",
        price: 2900000,
        stock: 15,
        isActive: true,
        categoryId: mainCategory.id
      },
      create: {
        sku: "MB-B760M",
        name: "B760M Mainboard",
        slug: "b760m-mainboard",
        description: "Mainboard for Intel 12/13th gen",
        price: 2900000,
        stock: 15,
        isActive: true,
        categoryId: mainCategory.id
      }
    });

    await prisma.productAttribute.upsert({
      where: {
        productId_key: {
          productId: board.id,
          key: "socket"
        }
      },
      update: { value: "LGA1700" },
      create: {
        productId: board.id,
        key: "socket",
        value: "LGA1700"
      }
    });
  }

  if (gpuCategory) {
    await prisma.product.upsert({
      where: { sku: "GPU-RTX-4060" },
      update: {
        name: "NVIDIA RTX 4060",
        slug: "nvidia-rtx-4060",
        price: 8900000,
        stock: 12,
        isActive: true,
        categoryId: gpuCategory.id
      },
      create: {
        sku: "GPU-RTX-4060",
        name: "NVIDIA RTX 4060",
        slug: "nvidia-rtx-4060",
        description: "Great 1080p/1440p gaming card",
        price: 8900000,
        stock: 12,
        isActive: true,
        categoryId: gpuCategory.id
      }
    });
  }

  if (cpuCategory && mainCategory) {
    const existingRule = await prisma.compatibilityRule.findFirst({
      where: {
        sourceCategoryId: cpuCategory.id,
        targetCategoryId: mainCategory.id,
        sourceAttributeKey: "socket",
        targetAttributeKey: "socket",
        operator: "EQ"
      }
    });

    if (!existingRule) {
      await prisma.compatibilityRule.create({
        data: {
          sourceCategoryId: cpuCategory.id,
          targetCategoryId: mainCategory.id,
          sourceAttributeKey: "socket",
          targetAttributeKey: "socket",
          operator: "EQ",
          description: "CPU socket must match mainboard socket",
          isActive: true
        }
      });
    }
  }

  console.log("Seed completed:");
  console.log("- Admin: admin@cnm.local / Admin@123");
  console.log("- Technician: tech1@cnm.local / Tech@123");
  console.log("- Sample categories, products, attributes, compatibility rule created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
