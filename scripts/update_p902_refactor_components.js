const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add imports
const targetImports = `import { CompareDrawer } from "../../components/pc-builder/CompareDrawer";`;
const newImports = `import { CompareDrawer } from "../../components/pc-builder/CompareDrawer";
import { BuilderSummaryPanel } from "../../components/pc-builder/BuilderSummaryPanel";
import { ComponentSectionList } from "../../components/pc-builder/ComponentSectionList";
import { InsightsPanel } from "../../components/pc-builder/InsightsPanel";
import { AIControlPanel } from "../../components/pc-builder/AIControlPanel";`;

code = code.replace(targetImports, newImports);

// 2. Replace Topbar with BuilderSummaryPanel
const oldTopbar = `      {/* ── TOPBAR ────────────────────────────────────────── */}
      <header className="builder-topbar">
        {/* Brand */}
        <div className="topbar-brand">
          <span className="topbar-brand-logo">PC Mall</span>
          <span className="topbar-brand-sep">|</span>
          <span className="topbar-brand-name">Smart PC Builder</span>
        </div>

        {/* Presets — "Starting Point" chips */}
        <nav className="topbar-presets" aria-label="Build presets">
          <span className="topbar-presets-label">Preset:</span>
          {PRESET_BUILDS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={\`preset-chip\${selectedPresetId === preset.id ? " is-active" : ""}\`}
              title={preset.desc}
              onClick={() => handlePreset(preset)}
            >
              {preset.label}
              <span className="preset-chip__budget">{formatCurrency(preset.budget)}đ</span>
            </button>
          ))}
        </nav>

        {/* Actions — PRIMARY: AI Build, SECONDARY: XAI, Requirement Wizard, PDF */}
        <div className="topbar-actions">
          <button type="button" className="btn-topbar-secondary" onClick={() => setIsReqWizardOpen(true)} title="Mở Form Thu Nhập Nhu Cầu Lắp Ráp PC">
            🎯 Nhu Cầu AI
          </button>
          <button type="button" className="btn-topbar-secondary" onClick={handleOpenXaiDrawer} title="Xem giải thích AI chi tiết từ Backend XAI Engine">
            🧠 XAI
          </button>
          <button type="button" className="btn-topbar-secondary" onClick={() => window.print()} title="Xuất PDF cấu hình">
            📄 PDF
          </button>
          {/* PRIMARY ACTION — AI Build */}
          <button
            id="btn-ai-build-primary"
            type="button"
            className="btn-ai-build"
            onClick={() => handleAutoRecommend()}
            disabled={processingComponent === "auto"}
            title={\`Tự động gợi ý cấu hình \${selectedPresetId} tối ưu trong ngân sách \${formatCurrency(suggestionForm.budget)}đ\`}
          >
            ⚡ {processingComponent === "auto" ? "Đang phân tích..." : "AI Build"}
          </button>
        </div>
      </header>`;

const newTopbar = `      {/* ── TOPBAR SUMMARY PANEL ──────────────────────────── */}
      <BuilderSummaryPanel
        selectedPresetId={selectedPresetId}
        onSelectPreset={handlePreset}
        presets={PRESET_BUILDS}
        onOpenReqWizard={() => setIsReqWizardOpen(true)}
        onOpenXaiDrawer={handleOpenXaiDrawer}
        onAutoBuild={handleAutoRecommend}
        isAutoBuilding={isAutoBuilding}
        budget={suggestionForm.budget}
      />`;

code = code.replace(oldTopbar, newTopbar);

// 3. Replace Sidebar Component Section List and Stats with ComponentSectionList and InsightsPanel
const oldSidebarContent = `            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Tiến trình lắp ráp</span>
              <span className="sidebar-section-title" style={{ color: "var(--c-primary)" }}>{completionPercent}%</span>
            </div>

            <div className="sidebar-progress-wrap">
              <div className="sidebar-progress-track" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
                <span className="sidebar-progress-fill" style={{ width: \`\${completionPercent}%\` }} />
              </div>
            </div>

            {COMPONENT_SECTIONS.map((section, idx) => {
              const selected = selectedItems[section.componentType];
              const product  = selected ? getSelectedProduct(selected) : null;
              const isDone   = Boolean(selected);
              const isActive = activeComponent === section.componentType;

              return (
                <div
                  key={section.componentType}
                  role="button"
                  tabIndex={0}
                  className={\`step-item\${isActive ? " is-active" : ""}\${isDone ? " is-done" : ""}\`}
                  onClick={() => {
                    setActiveComponent(section.componentType);
                    setSearchTerm("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setActiveComponent(section.componentType);
                      setSearchTerm("");
                    }
                  }}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div className="step-indicator" aria-hidden>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div className="step-content">
                    <strong className="step-title">{section.label}</strong>
                    <span className="step-desc">
                      {isDone
                        ? getProductName(product)
                        : section.componentType === "cooling" && !insights?.coolingState?.required
                          ? "Tùy chọn"
                          : "Chưa chọn"}
                    </span>
                  </div>
                  {isDone && <span className="step-price">{formatCurrency(getItemPrice(selected))}đ</span>}
                  {isDone && (
                    <button
                      type="button"
                      className="step-remove-btn"
                      title="Xóa linh kiện này"
                      aria-label={\`Xóa \${section.label}\`}
                      onClick={(e) => { e.stopPropagation(); actions.removeComponent(section.componentType); }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            <div className="sidebar-divider" />

            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Thông số hiện tại</span>
            </div>
            <div className="sidebar-stats">
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-label">Công suất</span>
                <span className="sidebar-stat-value">{insights.power}W</span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-label">FPS Gaming</span>
                <span className="sidebar-stat-value">{insights.fps}</span>
              </div>
            </div>`;

const newSidebarContent = `            {/* Component Progress List */}
            <ComponentSectionList
              sections={COMPONENT_SECTIONS}
              selectedItems={selectedItems}
              activeComponent={activeComponent}
              setActiveComponent={setActiveComponent}
              setSearchTerm={setSearchTerm}
              insights={insights}
              onRemoveComponent={actions.removeComponent}
              completionPercent={completionPercent}
            />

            <div className="sidebar-divider" />

            {/* AI Control Panel */}
            <AIControlPanel
              suggestionForm={suggestionForm}
              setSuggestionForm={setSuggestionForm}
              onAutoRecommend={handleAutoRecommend}
              isAutoBuilding={isAutoBuilding}
            />

            <div className="sidebar-divider" />

            {/* System Insights Panel */}
            <InsightsPanel insights={insights} />`;

code = code.replace(oldSidebarContent, newSidebarContent);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully refactored PcBuilderPage.jsx into modular components!');
