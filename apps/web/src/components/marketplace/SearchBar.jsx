import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <form
      className="market-search"
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          navigate(`/products?search=${encodeURIComponent(query.trim())}`);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        background: "#16171d",
        border: "1px solid #363846",
        borderRadius: 4,
        overflow: "hidden",
        height: 40,
        margin: 0
      }}
    >
      <input
        placeholder="Tìm kiếm linh kiện..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          color: "#fff",
          border: "none",
          outline: "none",
          padding: "0 16px",
          fontSize: 14,
          height: "100%",
          boxSizing: "border-box"
        }}
      />
      <button
        type="submit"
        style={{
          background: "transparent",
          border: "none",
          color: "#a0a0a0",
          padding: "0 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </form>
  );
}
