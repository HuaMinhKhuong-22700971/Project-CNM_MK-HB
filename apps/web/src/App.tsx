import { Link, Route, Routes } from "react-router-dom";

function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "24px" }}>
      <h1>CNM MK-HB</h1>
      <p>E-commerce for computer components with AI advisor.</p>
      <nav style={{ display: "flex", gap: "12px" }}>
        <Link to="/catalog">Catalog</Link>
        <Link to="/pc-builder">PC Builder</Link>
        <Link to="/cart">Cart</Link>
      </nav>
    </main>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main style={{ fontFamily: "system-ui", padding: "24px" }}>
      <h2>{title}</h2>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<Placeholder title="Catalog" />} />
      <Route path="/pc-builder" element={<Placeholder title="PC Builder" />} />
      <Route path="/cart" element={<Placeholder title="Cart" />} />
    </Routes>
  );
}
