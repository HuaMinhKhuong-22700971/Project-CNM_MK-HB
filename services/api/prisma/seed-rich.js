const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

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
  console.log("Starting a clean, rich seed with Roles and Users...");

  // 1. Roles
  console.log("Seeding Roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Quản trị viên toàn quyền" }
  });
  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER", description: "Khách hàng mua sắm" }
  });

  // 2. Users
  console.log("Seeding Users...");
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const customerPassword = await bcrypt.hash("Auth@123", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@cnm.local" },
    update: { fullName: "Quản trị viên Hệ thống", roleId: adminRole.id },
    create: {
      email: "admin@cnm.local",
      password: adminPassword,
      fullName: "Quản trị viên Hệ thống",
      roleId: adminRole.id
    }
  });

  await prisma.user.upsert({
    where: { email: "customer@cnm.local" },
    update: { fullName: "Khách hàng mẫu", roleId: customerRole.id },
    create: {
      email: "customer@cnm.local",
      password: customerPassword,
      fullName: "Khách hàng mẫu",
      roleId: customerRole.id
    }
  });

  // 3. Categories
  console.log("Seeding Categories...");
  const categories = [
    { name: "CPU", description: "Bộ vi xử lý trung tâm cho máy tính để bàn" },
    { name: "Mainboard", description: "Bo mạch chủ hỗ trợ các chipset mới nhất" },
    { name: "RAM", description: "Bộ nhớ truy cập ngẫu nhiên tốc độ cao" },
    { name: "GPU", description: "Card đồ họa hiệu năng cao cho gaming và đồ họa" },
    { name: "SSD", description: "Ổ cứng thể rắn tốc độ cực cao (NVMe PCIe 4.0/5.0)" },
    { name: "PSU", description: "Nguồn máy tính công suất thực, chuẩn 80 Plus" },
    { name: "Case", description: "Vỏ máy tính thiết kế hiện đại, tản nhiệt tối ưu" },
    { name: "Cooling", description: "Tản nhiệt khí và tản nhiệt nước AIO" }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, slug: slugify(cat.name) },
      create: { name: cat.name, slug: slugify(cat.name), description: cat.description, isActive: true }
    });
  }

  const dbCats = await prisma.category.findMany();
  const catMap = {};
  dbCats.forEach(c => (catMap[c.name.toLowerCase()] = c.id));

  const categoryImages = {
    cpu: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800",
    mainboard: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800",
    gpu: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800",
    ram: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?q=80&w=800",
    ssd: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=800",
    psu: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800",
    case: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800",
    cooling: "https://images.unsplash.com/photo-1563770660941-20978e870813?q=80&w=800"
  };

  // 4. Products
  console.log("Seeding Products...");
  const manualProducts = [
    {
      sku: "CPU-I7-14700K",
      name: "Intel Core i7-14700K (3.4GHz up to 5.6GHz, 20 Nhân 28 Luồng)",
      price: 11500000,
      category: "cpu",
      image: categoryImages.cpu,
      description: "Intel Core i7-14700K là bộ vi xử lý thế hệ 14 mới nhất. Lựa chọn tuyệt vời cho gaming và đồ họa.",
      attributes: { socket: "LGA1700", cores: "20" }
    },
    {
      sku: "CPU-R7-7800X3D",
      name: "AMD Ryzen 7 7800X3D (4.2GHz up to 5.0GHz, 8 Nhân 16 Luồng)",
      price: 10900000,
      category: "cpu",
      image: categoryImages.cpu,
      description: "Ông hoàng gaming với công nghệ 3D V-Cache.",
      attributes: { socket: "AM5", cores: "8" }
    },
    {
      sku: "GPU-RTX4080S-ROG",
      name: "ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X",
      price: 36500000,
      category: "gpu",
      image: categoryImages.gpu,
      description: "Hiệu năng đồ họa đỉnh cao kiến trúc Ada Lovelace.",
      attributes: { vram: "16GB", power: "320W" }
    }
  ];

  // Generate more random products
  const brands = ["ASUS", "MSI", "Gigabyte", "Corsair", "Samsung", "NZXT", "Kingston", "DeepCool"];
  const categoriesList = ["cpu", "mainboard", "gpu", "ram", "ssd", "psu", "case", "cooling"];

  const allProducts = [...manualProducts];
  for (let i = 1; i <= 40; i++) {
    const brand = brands[i % brands.length];
    const category = categoriesList[i % categoriesList.length];
    allProducts.push({
      sku: `${category.toUpperCase()}-${brand.toUpperCase()}-${1000 + i}`,
      name: `${brand} ${category.toUpperCase()} Model ${200 + i} Gaming Pro Max`,
      price: 1500000 + (Math.random() * 25000000),
      category: category,
      image: categoryImages[category],
      description: `Sản phẩm ${category} hiệu năng cao từ ${brand}. Phù hợp cho mọi nhu cầu sử dụng.`,
      attributes: { brand: brand, series: "Gaming" }
    });
  }

  for (const p of allProducts) {
    const catId = catMap[p.category.toLowerCase()];
    if (!catId) continue;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { sku: p.sku },
        update: { name: p.name, description: p.description, price: p.price, categoryId: catId },
        create: {
          sku: p.sku,
          name: p.name,
          slug: slugify(p.name),
          description: p.description,
          price: p.price,
          stock: 50,
          isActive: true,
          categoryId: catId
        }
      });

      await tx.productSku.upsert({
        where: { sku: p.sku + "-MAIN" },
        update: { imageUrl: p.image, price: p.price },
        create: {
          productId: product.id,
          sku: p.sku + "-MAIN",
          price: p.price,
          imageUrl: p.image,
          stock: 50,
          status: "ACTIVE"
        }
      });

      await tx.productVariant.upsert({
        where: { sku: p.sku + "-VAR" },
        update: { imageUrl: p.image, price: p.price },
        create: {
          productId: product.id,
          sku: p.sku + "-VAR",
          price: p.price,
          imageUrl: p.image,
          stock: 50
        }
      });

      await tx.productAttribute.deleteMany({ where: { productId: product.id } });
      await tx.productAttribute.createMany({
        data: Object.entries(p.attributes || {}).map(([key, value]) => ({
          productId: product.id,
          key,
          value
        }))
      });
    });
  }

  console.log("Rich Seed Completed successfully with Roles, Users, and 43+ Products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
