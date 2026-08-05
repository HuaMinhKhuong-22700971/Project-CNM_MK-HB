const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CATEGORIES = [
  "CPU - Bộ vi xử lý",
  "Mainboard - Bo mạch chủ",
  "RAM - Bộ nhớ trong",
  "VGA - Card màn hình",
  "SSD - Ổ cứng thể rắn",
  "PSU - Nguồn máy tính",
  "Case - Vỏ máy tính",
  "Tản nhiệt CPU"
];

const BRANDS = [
  { name: "Intel", slug: "intel" },
  { name: "AMD", slug: "amd" },
  { name: "ASUS", slug: "asus" },
  { name: "MSI", slug: "msi" },
  { name: "Gigabyte", slug: "gigabyte" },
  { name: "Kingston", slug: "kingston" },
  { name: "Corsair", slug: "corsair" },
  { name: "DeepCool", slug: "deepcool" },
  { name: "NZXT", slug: "nzxt" },
  { name: "Samsung", slug: "samsung" },
  { name: "WD", slug: "wd" },
  { name: "Lian Li", slug: "lian-li" }
];

const SAMPLE_PRODUCTS = [
  {
    name: "Intel Core i5-13400F",
    slug: "intel-core-i5-13400f",
    description: "CPU Intel Core i5-13400F là bộ vi xử lý 10 nhân 16 luồng (6 P-core + 4 E-core), xung nhịp boost tối đa 4.6GHz, TDP 65W. Tối ưu cho gaming và làm việc với giá tầm trung. Không tích hợp GPU, yêu cầu card đồ họa rời. Socket LGA1700.",
    price: 4850000,
    categoryName: "CPU - Bộ vi xử lý",
    brandName: "Intel",
    sku: "CPU-INTEL-I5-13400F",
    stock: 25,
    image_url: "/images/products/intel-core-i5-13400f.png"
  },
  {
    name: "AMD Ryzen 5 7600",
    slug: "amd-ryzen-5-7600",
    description: "AMD Ryzen 5 7600 CPU 6 nhân 12 luồng kiến trúc Zen 4 (5nm), xung nhịp boost tối đa 5.1GHz, TDP 65W, hỗ trợ DDR5 và PCIe 5.0. Socket AM5 với hiệu năng vượt trội trong tầm giá tầm trung.",
    price: 5290000,
    categoryName: "CPU - Bộ vi xử lý",
    brandName: "AMD",
    sku: "CPU-AMD-R5-7600",
    stock: 18,
    image_url: "/images/products/amd-ryzen-5-7600.png"
  },
  {
    name: "Intel Core i7-13700K",
    slug: "intel-core-i7-13700k",
    description: "Intel Core i7-13700K bộ vi xử lý cao cấp 16 nhân 24 luồng (8 P-core + 8 E-core), boost tối đa 5.4GHz, TDP 125W (253W PL2). Hiệu năng đỉnh cao cho gaming 4K và render video. Socket LGA1700.",
    price: 9990000,
    categoryName: "CPU - Bộ vi xử lý",
    brandName: "Intel",
    sku: "CPU-INTEL-I7-13700K",
    stock: 10,
    image_url: "/images/products/intel-core-i5-13400f.png"
  },
  {
    name: "AMD Ryzen 7 7800X3D",
    slug: "amd-ryzen-7-7800x3d",
    description: "AMD Ryzen 7 7800X3D là CPU gaming tốt nhất thế giới với công nghệ 3D V-Cache 96MB, 8 nhân 16 luồng, boost 5.0GHz. Hiệu năng gaming vượt trội mọi đối thủ ở mọi tầm giá. Socket AM5.",
    price: 11490000,
    categoryName: "CPU - Bộ vi xử lý",
    brandName: "AMD",
    sku: "CPU-AMD-R7-7800X3D",
    stock: 8,
    image_url: "/images/products/amd-ryzen-5-7600.png"
  },
  {
    name: "Mainboard ASUS TUF Gaming B760M-PLUS WIFI",
    slug: "asus-tuf-gaming-b760m-plus-wifi",
    description: "Bo mạch chủ ASUS TUF Gaming B760M-PLUS WIFI Socket LGA1700 form factor mATX. Hỗ trợ DDR5 RAM tốc độ lên đến 6400MHz, PCIe 5.0 x16, WiFi 6, Bluetooth 5.2. VRM 12+1 Dr.MOS bền bỉ cho overclock.",
    price: 4290000,
    categoryName: "Mainboard - Bo mạch chủ",
    brandName: "ASUS",
    sku: "MB-ASUS-B760M-TUF",
    stock: 15,
    image_url: "/images/products/asus-tuf-gaming-b760m-plus-wifi.png"
  },
  {
    name: "Mainboard MSI MAG B650 TOMAHAWK WIFI",
    slug: "msi-mag-b650-tomahawk-wifi",
    description: "MSI MAG B650 TOMAHAWK WIFI bo mạch chủ AMD AM5 form factor ATX. Hỗ trợ Ryzen 7000 Series, DDR5, PCIe 5.0, WiFi 6E, 2.5G LAN. VRM 16+2+1 pha mạnh mẽ, M.2 Shield Frozr làm mát SSD hiệu quả.",
    price: 5690000,
    categoryName: "Mainboard - Bo mạch chủ",
    brandName: "MSI",
    sku: "MB-MSI-B650-TOMAHAWK",
    stock: 12,
    image_url: "/images/products/msi-mag-b650-tomahawk-wifi.png"
  },
  {
    name: "Mainboard Gigabyte B760 AORUS Elite AX",
    slug: "gigabyte-b760-aorus-elite-ax",
    description: "Gigabyte B760 AORUS Elite AX bo mạch chủ ATX cao cấp cho Intel Gen 12/13/14. DDR4/DDR5 hybrid, WiFi 6E, USB 3.2 Gen 2x2 40Gbps, PCIe 5.0. Tản nhiệt Thermal Guard III cho SSD NVMe.",
    price: 5190000,
    categoryName: "Mainboard - Bo mạch chủ",
    brandName: "Gigabyte",
    sku: "MB-GB-B760-AORUS-ELITE",
    stock: 9,
    image_url: "/images/products/asus-tuf-gaming-b760m-plus-wifi.png"
  },
  {
    name: "VGA ASUS Dual GeForce RTX 4060 8GB OC",
    slug: "asus-dual-geforce-rtx-4060-8gb-oc",
    description: "Card màn hình ASUS Dual RTX 4060 OC 8GB GDDR6 kiến trúc Ada Lovelace. Hỗ trợ DLSS 3, Ray Tracing, AV1 encoding. 2x quạt Axial-tech, GPU Tweak III. Hiệu năng tốt ở 1080p và 1440p với mức TDP chỉ 115W.",
    price: 8890000,
    categoryName: "VGA - Card màn hình",
    brandName: "ASUS",
    sku: "VGA-ASUS-RTX4060-8G",
    stock: 20,
    image_url: "/images/products/asus-dual-geforce-rtx-4060-8gb-oc.png"
  },
  {
    name: "VGA MSI GeForce RTX 4070 SUPER VENTUS 3X 12GB OC",
    slug: "msi-rtx-4070-super-ventus-3x-12gb-oc",
    description: "MSI GeForce RTX 4070 SUPER VENTUS 3X OC 12GB GDDR6X, 2520 MHz boost, DLSS 3.5, Frame Generation. 3x quạt TORX 4.0, TDP 220W. Hiệu năng 1440p xuất sắc, đủ sức chiến 4K.",
    price: 16490000,
    categoryName: "VGA - Card màn hình",
    brandName: "MSI",
    sku: "VGA-MSI-RTX4070S-12G",
    stock: 7,
    image_url: "/images/products/asus-dual-geforce-rtx-4060-8gb-oc.png"
  },
  {
    name: "RAM Kingston Fury Beast 16GB (2x8GB) DDR5 5600MHz",
    slug: "ram-kingston-fury-beast-16gb-ddr5",
    description: "Kingston FURY Beast DDR5-5600 16GB (2x8GB) CL40 bộ nhớ hiệu năng cao. Tản nhiệt nhôm cao cấp màu đen sang trọng. Tương thích XMP 3.0 và EXPO. Không cần đèn LED, tập trung vào hiệu năng thuần túy.",
    price: 1850000,
    categoryName: "RAM - Bộ nhớ trong",
    brandName: "Kingston",
    sku: "RAM-KINGSTON-16G-D5",
    stock: 30,
    image_url: "/images/products/ram-kingston-fury-beast-16gb-ddr5.png"
  },
  {
    name: "RAM Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz",
    slug: "corsair-vengeance-32gb-ddr5-6000",
    description: "Corsair VENGEANCE DDR5-6000 32GB (2x16GB) CL30 bộ nhớ tốc độ cao chuẩn Intel XMP 3.0. Tản nhiệt nhôm mỏng phù hợp với các tản nhiệt CPU lớn. Dung lượng lớn lý tưởng cho gaming và sáng tạo nội dung.",
    price: 3290000,
    categoryName: "RAM - Bộ nhớ trong",
    brandName: "Corsair",
    sku: "RAM-CORSAIR-32G-D5-6000",
    stock: 22,
    image_url: "/images/products/ram-kingston-fury-beast-16gb-ddr5.png"
  },
  {
    name: "SSD Kingston NV2 1TB PCIe 4.0 NVMe",
    slug: "ssd-kingston-nv2-1tb-nvme",
    description: "Kingston NV2 1TB M.2 NVMe PCIe 4.0 SSD tốc độ đọc tuần tự 3500MB/s, ghi 2100MB/s. Hiệu năng lớp trung cao cấp với giá cả phải chăng. Bảo hành 3 năm, không cần tản nhiệt riêng.",
    price: 1690000,
    categoryName: "SSD - Ổ cứng thể rắn",
    brandName: "Kingston",
    sku: "SSD-KINGSTON-1TB-NV2",
    stock: 40,
    image_url: "/images/products/ssd-kingston-nv2-1tb-nvme.png"
  },
  {
    name: "SSD Samsung 990 PRO 2TB NVMe PCIe 5.0",
    slug: "samsung-990-pro-2tb-nvme-pcie5",
    description: "Samsung 990 PRO 2TB M.2 NVMe PCIe 5.0 SSD thế hệ mới nhất. Đọc tuần tự lên đến 7450MB/s, ghi 6900MB/s. Tuyệt vời cho PS5, gaming PC và workstation. Bảo hành 5 năm.",
    price: 4990000,
    categoryName: "SSD - Ổ cứng thể rắn",
    brandName: "Samsung",
    sku: "SSD-SAMSUNG-990PRO-2TB",
    stock: 15,
    image_url: "/images/products/ssd-kingston-nv2-1tb-nvme.png"
  },
  {
    name: "Nguồn Corsair CV750 750W 80 Plus Bronze",
    slug: "nguon-corsair-cv750-750w",
    description: "Corsair CV750 750W 80 Plus Bronze nguồn máy tính tin cậy cho các hệ thống gaming tầm trung. Hiệu suất 80 Plus Bronze (>85% hiệu năng), tản nhiệt 120mm. Cáp cố định, bảo hành 3 năm.",
    price: 1790000,
    categoryName: "PSU - Nguồn máy tính",
    brandName: "Corsair",
    sku: "PSU-CORSAIR-CV750",
    stock: 22,
    image_url: "/images/products/nguon-corsair-cv750-750w.png"
  },
  {
    name: "Nguồn Corsair RM850x 850W 80 Plus Gold Modular",
    slug: "corsair-rm850x-850w-gold-modular",
    description: "Corsair RM850x 850W 80 Plus Gold nguồn full modular cao cấp. Hiệu suất lên đến 92% với chuẩn Gold, quạt 135mm Zero RPM Mode (silent khi tải thấp), ATX 3.0 hỗ trợ GPU đời mới. Bảo hành 10 năm.",
    price: 3490000,
    categoryName: "PSU - Nguồn máy tính",
    brandName: "Corsair",
    sku: "PSU-CORSAIR-RM850X",
    stock: 14,
    image_url: "/images/products/nguon-corsair-cv750-750w.png"
  },
  {
    name: "Tản Nhiệt CPU DeepCool AK400",
    slug: "deepcool-ak400-cpu-cooler",
    description: "DeepCool AK400 tản nhiệt CPU tower 120mm 4 ống nhiệt đồng, tản nhiệt nhôm dày đặc hiệu quả. Quạt FK120 120mm ARGB tùy chọn. Hỗ trợ Intel LGA1700/1200/115x và AMD AM4/AM5. Bảo hành 3 năm.",
    price: 890000,
    categoryName: "Tản nhiệt CPU",
    brandName: "DeepCool",
    sku: "COOL-DEEPCOOL-AK400",
    stock: 35,
    image_url: "/images/products/deepcool-ak400.png"
  },
  {
    name: "Case NZXT H510 Flow Mid Tower",
    slug: "nzxt-h510-flow-mid-tower",
    description: "NZXT H510 Flow vỏ case mid-tower thiết kế tối giản hiện đại. Mặt trước lưới tản nhiệt tối ưu luồng khí. Kính cường lực tempered glass bên hông. Tích hợp 1 quạt 140mm đầu vào + 1 quạt 120mm đầu ra. Hỗ trợ ATX/mATX/ITX.",
    price: 2190000,
    categoryName: "Case - Vỏ máy tính",
    brandName: "NZXT",
    sku: "CASE-NZXT-H510-FLOW",
    stock: 18,
    image_url: "/images/products/nzxt-h510.png"
  }
];

async function main() {
  console.log("Starting rich data seeding...");

  // 1. Categories
  const categoryMap = {};
  for (const name of CATEGORIES) {
    let cat = await prisma.category.findFirst({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
    }
    categoryMap[name] = cat.id;
  }
  console.log(`Ensured ${Object.keys(categoryMap).length} Categories.`);

  // 2. Brands
  const brandMap = {};
  for (const b of BRANDS) {
    let brand = await prisma.brand.findFirst({ where: { name: b.name } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: b.name, slug: b.slug, status: "ACTIVE", is_active: true }
      });
    }
    brandMap[b.name] = brand.id;
  }
  console.log(`Ensured ${Object.keys(brandMap).length} Brands.`);

  // 3. Products & ProductSKUs
  let created = 0;
  let updated = 0;

  for (const prod of SAMPLE_PRODUCTS) {
    const categoryId = categoryMap[prod.categoryName];
    const brandId = brandMap[prod.brandName];

    let existingProd = await prisma.product.findFirst({ where: { slug: prod.slug } });
    if (!existingProd) {
      existingProd = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          category_id: categoryId,
          brand_id: brandId,
          status: "ACTIVE",
          is_active: true
        }
      });
      created++;
    } else {
      // Update description if empty
      await prisma.product.update({
        where: { id: existingProd.id },
        data: { description: prod.description, price: prod.price }
      });
      updated++;
    }

    let existingSku = await prisma.productSku.findFirst({ where: { sku: prod.sku } });
    if (!existingSku) {
      await prisma.productSku.create({
        data: {
          product_id: existingProd.id,
          sku: prod.sku,
          price: prod.price,
          stock: prod.stock,
          status: "ACTIVE",
          is_active: true,
          image_url: prod.image_url
        }
      });
    } else {
      // Update image_url
      await prisma.productSku.update({
        where: { id: existingSku.id },
        data: { image_url: prod.image_url, price: prod.price, stock: prod.stock }
      });
    }
  }
  console.log(`Products: ${created} created, ${updated} updated (${SAMPLE_PRODUCTS.length} total).`);
  console.log("Rich data seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
