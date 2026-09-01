import React from "react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ className = "", showLabel = true }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
      aria-label="Toggle Theme"
    >
      <span className="theme-toggle-icon">{isDark ? "🌙" : "☀️"}</span>
      {showLabel && (
        <span className="theme-toggle-text">{isDark ? "Tối" : "Sáng"}</span>
      )}
      <style>{themeToggleStyles}</style>
    </button>
  );
}

const themeToggleStyles = `
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 3px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms ease;
  user-select: none;
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.theme-toggle-icon {
  font-size: 14px;
}
`;
