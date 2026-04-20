export function PageCard({ title, description, children }) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,244,0.88))",
        border: "1px solid var(--border)",
        borderRadius: 28,
        padding: 28,
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(16px)"
      }}
    >
      <div style={{ display: "grid", gap: 8, marginBottom: description ? 18 : 12 }}>
        <h2 style={{ margin: 0, fontSize: 38, lineHeight: 1, letterSpacing: "-0.05em" }}>{title}</h2>
        {description ? <p style={{ margin: 0, color: "var(--muted)", fontSize: 18, lineHeight: 1.6 }}>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
