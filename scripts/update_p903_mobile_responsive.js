const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.css');
let css = fs.readFileSync(cssFile, 'utf8');

// Replace the old @media query at the bottom with comprehensive mobile responsive rules
const oldMedia = `@media (max-width: 767px) {
  .builder-layout { grid-template-columns: 1fr; }
  .builder-summary { display: none; }
  .product-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
}`;

const newMedia = `/* ── MOBILE & TABLET RESPONSIVE SYSTEM (P9-03) ───────────────── */
@media (max-width: 1024px) {
  .builder-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .builder-summary {
    position: relative;
    top: 0;
    height: auto;
    border-left: none;
    border-top: 1px solid var(--c-neutral-border);
    grid-column: span 2;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .builder-topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px;
  }

  .topbar-brand {
    justify-content: center;
  }

  .topbar-actions {
    justify-content: space-between;
    width: 100%;
  }

  .btn-ai-build, .btn-topbar-secondary {
    flex: 1;
    justify-content: center;
  }

  .builder-layout {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }

  .builder-sidebar {
    position: relative;
    top: 0;
    height: auto;
    max-height: 280px;
    border-right: none;
    border-bottom: 1px solid var(--c-neutral-border);
    padding: 12px;
    overflow-x: auto;
  }

  .component-section-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .workspace-header {
    position: relative;
    top: 0;
    padding: 14px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .workspace-search-wrap {
    width: 100%;
  }

  .workspace-body {
    padding: 14px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .product-card__image-container {
    height: 140px;
  }

  .builder-summary {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 900;
    height: auto;
    max-height: 85vh;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -10px 25px rgba(15, 23, 42, 0.25);
    background: #0f172a;
    color: #ffffff;
    padding: 14px 16px;
    border-top: 2px solid #2563eb;
  }

  .summary-hero {
    background: transparent;
    padding: 0;
  }

  .summary-hero__price {
    font-size: 22px;
  }

  .summary-secondary-actions {
    display: flex;
    gap: 8px;
  }

  .builder-page {
    padding-bottom: 120px;
  }
}`;

css = css.replace(oldMedia, newMedia);

fs.writeFileSync(cssFile, css, 'utf8');
console.log('✅ Successfully updated PcBuilderPage.css with Mobile Responsive layout rules!');
