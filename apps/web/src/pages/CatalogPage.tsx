import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, getAccessToken } from "../lib/api";
import type { ApiEnvelope, Product } from "../types/api";

export function CatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<ApiEnvelope<Product[]>>("/catalog/products?limit=20");
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load products");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId: string) {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    try {
      await apiRequest(
        "/cart/items",
        {
          method: "POST",
          body: JSON.stringify({ productId, quantity: 1 })
        },
        true
      );
      alert("Da them vao giỏ hàng");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Them giỏ hàng that bai");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1>Danh sách sản phẩm</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
        {products.map((p) => (
          <article key={p.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3>{p.name}</h3>
            <p>SKU: {p.sku}</p>
            <p>Danh mục: {p.category?.name}</p>
            <p>Gia: {Number(p.price).toLocaleString("vi-VN")} VND</p>
            <p>Tồn kho: {p.stock}</p>
            <button onClick={() => addToCart(p.id)}>Them vao gio</button>
          </article>
        ))}
      </div>
    </main>
  );
}

