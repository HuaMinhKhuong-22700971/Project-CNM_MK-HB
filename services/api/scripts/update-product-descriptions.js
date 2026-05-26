const { query } = require("../src/config/database");
const { env } = require("../src/config/env");

async function getProducts() {
  const rows = await query(`
    SELECT 
      p.id,
      p.name,
      p.description,
      c.name as category_name,
      b.name as brand_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1
    ORDER BY p.id
  `);
  return rows;
}

async function generateProductDescription(product) {
  const prompt = `
Bạn là chuyên gia viết mô tả sản phẩm cho website thương mại điện tử bán linh kiện máy tính.

Hãy viết một mô tả chi tiết và chuyên nghiệp cho sản phẩm sau:

Tên sản phẩm: ${product.name}
Thương hiệu: ${product.brand_name || 'N/A'}
Danh mục: ${product.category_name || 'N/A'}

Yêu cầu:
1. Mô tả chi tiết về tính năng và ưu điểm của sản phẩm
2. Nêu rõ thông số kỹ thuật quan trọng (nếu có thể ước lượng dựa trên tên sản phẩm)
3. Nhắc đến các ứng dụng phù hợp (gaming, làm việc, đồ họa, v.v.)
4. Viết bằng tiếng Việt, chuyên nghiệp nhưng dễ hiểu
5. Độ dài khoảng 200-300 từ
6. KHÔNG được đưa ra thông số giả định nếu không chắc chắn

Chỉ trả về nội dung mô tả, không có thêm văn bản khác.
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY || process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Bạn là chuyên gia viết nội dung sản phẩm cho website thương mại điện tử." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (response.ok && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    return null;
  } catch (error) {
    console.error(`Error generating description for product ${product.id}:`, error.message);
    return null;
  }
}

async function updateProductDescription(productId, description) {
  await query(
    "UPDATE products SET description = ? WHERE id = ?",
    [description, productId]
  );
}

async function main() {
  console.log("Đang lấy danh sách sản phẩm...");
  const products = await getProducts();
  console.log(`Tìm thấy ${products.length} sản phẩm`);

  let updatedCount = 0;
  let failedCount = 0;

  for (const product of products) {
    console.log(`Đang xử lý sản phẩm ${product.id}: ${product.name}`);
    console.log(`Mô tả hiện tại: ${product.description || '(không có)'}`);

    const newDescription = await generateProductDescription(product);
    
    if (newDescription) {
      await updateProductDescription(product.id, newDescription);
      console.log(`✓ Đã cập nhật sản phẩm ${product.id}`);
      console.log(`Mô tả mới: ${newDescription.substring(0, 100)}...`);
      updatedCount++;
    } else {
      console.log(`✗ Không thể tạo mô tả cho sản phẩm ${product.id}`);
      failedCount++;
    }

    // Delay để tránh rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("---");
  }

  console.log("\nKết quả:");
  console.log(`- Đã cập nhật: ${updatedCount} sản phẩm`);
  console.log(`- Thất bại: ${failedCount} sản phẩm`);
  console.log("- Tổng:", products.length, "sản phẩm");

  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
