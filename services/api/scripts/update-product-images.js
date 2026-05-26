const { query } = require("../src/config/database");

const productImages = {
  "ASUS ROG Strix G16": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop",
  "MSI Titan 18 HX": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop",
  "Dell XPS 15": "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&h=600&fit=crop",
  "MacBook Pro 16 M3 Max": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
  "Lenovo Legion 5 Pro": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop",
  "HP Spectre x360": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop",
  "Acer Predator Helios 16": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop",
  "ASUS ZenBook 14 OLED": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
  "PC Gaming Tầm Trung 20 Triệu": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&h=600&fit=crop",
  "PC Gaming High-End 40 Triệu": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=600&fit=crop",
  "PC Đồ Họa 50 Triệu": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=600&fit=crop",
  "PC Văn Phòng 10 Triệu": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop",
  "PC Lập Trình 25 Triệu": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=600&fit=crop"
};

async function main() {
  console.log("Đang cập nhật hình ảnh cho các sản phẩm...");
  
  let updatedCount = 0;
  
  for (const [productName, imageUrl] of Object.entries(productImages)) {
    console.log(`Đang cập nhật: ${productName}`);
    
    const result = await query(
      `UPDATE product_skus ps 
       JOIN products p ON p.id = ps.product_id 
       SET ps.image_url = ? 
       WHERE p.name = ?`,
      [imageUrl, productName]
    );
    
    if (result.affectedRows > 0) {
      console.log(`  ✓ Đã cập nhật hình ảnh`);
      updatedCount++;
    } else {
      console.log(`  ✗ Không tìm thấy sản phẩm`);
    }
  }
  
  console.log("\nKết quả:");
  console.log(`- Đã cập nhật: ${updatedCount} sản phẩm`);
  console.log(`- Tổng: ${Object.keys(productImages).length} sản phẩm`);
  
  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
