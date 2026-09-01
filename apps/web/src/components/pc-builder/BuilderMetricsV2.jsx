import { useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   CompatibilityGauge — Animated SVG arc gauge
   Props:
     score: 0–100 (compatibility %)
     issues: string[]  (list of issues)
     isChecking: bool
   ──────────────────────────────────────────────────────────────*/
export function CompatibilityGauge({ score = 100, issues = [], isChecking = false }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef(null);

  /* Animate count-up */
  useEffect(() => {
    let start = 0;
    const target = Math.round(score);
    const step   = target / 30;
    clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayScore(target); clearInterval(animRef.current); }
      else setDisplayScore(Math.round(start));
    }, 20);
    return () => clearInterval(animRef.current);
  }, [score]);

  /* Arc math — semi-circle 180° */
  const R           = 48;          // radius
  const cx          = 60;          // center x
  const cy          = 60;          // center y
  const totalLength = Math.PI * R; // half circumference
  const fillLength  = (score / 100) * totalLength;
  const dashOffset  = totalLength - fillLength;

  /* Color thresholds */
  const color =
    score >= 80 ? "#10b981" :
    score >= 50 ? "#f59e0b" : "#ef4444";

  const statusText =
    score >= 80 ? "✅ Tương thích tốt" :
    score >= 50 ? "⚠️ Cần kiểm tra" : "❌ Có xung đột";

  const statusClass =
    score >= 80 ? "v2-compat-gauge__status--ok" :
    score >= 50 ? "v2-compat-gauge__status--warn" : "v2-compat-gauge__status--error";

  return (
    <div className="v2-compat-gauge">
      {isChecking ? (
        <div style={{
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid rgba(59,130,246,0.2)",
            borderTop: "3px solid #3b82f6",
            animation: "v2-spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
            Đang kiểm tra tương thích…
          </span>
        </div>
      ) : (
        <>
          {/* SVG Arc Gauge */}
          <svg viewBox="0 0 120 68" style={{ width: 140, height: 80 }}>
            {/* Background arc */}
            <path
              d={`M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`}
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            <path
              d={`M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={totalLength}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease",
                filter: `drop-shadow(0 0 5px ${color})`,
              }}
            />
            {/* Score text */}
            <text
              x={cx} y={cy - 6}
              textAnchor="middle"
              fontSize="18"
              fontWeight="900"
              fill={color}
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              {displayScore}
            </text>
            <text
              x={cx} y={cy + 6}
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill="#64748b"
              letterSpacing="0.08em"
            >
              TƯƠNG THÍCH
            </text>
          </svg>

          {/* Status pill */}
          <div className={`v2-compat-gauge__status ${statusClass}`}>
            {statusText}
          </div>

          {/* Issue list */}
          {issues.length > 0 && (
            <div style={{
              width: "100%",
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              maxHeight: 90,
              overflowY: "auto",
            }}>
              {issues.slice(0, 4).map((issue, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  color: "#92400e",
                  background: "rgba(217,119,6,0.08)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}>
                  <span style={{ flexShrink: 0 }}>⚡</span>
                  <span style={{ lineHeight: 1.4 }}>{issue}</span>
                </div>
              ))}
              {issues.length > 4 && (
                <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", fontWeight: 600 }}>
                  +{issues.length - 4} vấn đề khác
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   PowerMeter — Animated gradient fill bar for PSU %
   Props:
     usedWatts: number
     psuWatts: number
   ──────────────────────────────────────────────────────────────*/
export function PowerMeter({ usedWatts = 0, psuWatts = 0 }) {
  const pct  = psuWatts > 0 ? Math.min(Math.round((usedWatts / psuWatts) * 100), 110) : 0;
  const tone = pct >= 90 ? "over" : pct >= 70 ? "warn" : "ok";

  const toneColor =
    tone === "over" ? "#ef4444" :
    tone === "warn" ? "#f59e0b" : "#10b981";

  return (
    <div className="v2-power-meter">
      <div className="v2-power-meter__header">
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          PSU Công suất
        </span>
        <span className="v2-power-meter__pct" style={{ color: toneColor }}>
          {pct}%
        </span>
      </div>
      <div className="v2-power-meter__track">
        <div
          className={`v2-power-meter__fill v2-power-meter__fill--${tone}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="v2-power-meter__sub">
        <span>🔌 Dùng: <strong>{usedWatts}W</strong></span>
        <span>Nguồn: <strong>{psuWatts > 0 ? `${psuWatts}W` : "—"}</strong></span>
      </div>
      {pct >= 90 && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: "#b91c1c",
          fontWeight: 700,
          textAlign: "center",
          background: "rgba(220,38,38,0.08)",
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid rgba(239,68,68,0.25)",
        }}>
          ⚠️ {pct >= 100 ? "Vượt công suất nguồn!" : "Khuyến nghị nâng PSU"}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CostTicker — Animated total price display
   Props:
     totalPrice: number
     budget: number
     componentCount: number
   ──────────────────────────────────────────────────────────────*/
export function CostTicker({ totalPrice = 0, budget = 0, componentCount = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);
  const animRef = useRef(null);
  const budgetPct  = budget > 0 ? Math.min((totalPrice / budget) * 100, 100) : 0;
  const isOver     = budget > 0 && totalPrice > budget;

  /* Smooth count animation on price change */
  useEffect(() => {
    const prev   = prevRef.current;
    const target = totalPrice;
    const diff   = target - prev;
    if (diff === 0) return;

    const steps    = 24;
    const stepAmt  = diff / steps;
    let   current  = prev;
    let   i        = 0;

    clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      i++;
      current += stepAmt;
      if (i >= steps) {
        setDisplayed(target);
        prevRef.current = target;
        clearInterval(animRef.current);
      } else {
        setDisplayed(Math.round(current));
      }
    }, 18);

    return () => clearInterval(animRef.current);
  }, [totalPrice]);

  const formatted = displayed.toLocaleString("vi-VN");

  return (
    <div className="v2-cost-ticker">
      <div className="v2-cost-ticker__label">
        🛒 Tổng chi phí — {componentCount}/8 linh kiện
      </div>
      <div
        className="v2-cost-ticker__amount"
        key={totalPrice}
        style={{
          animation: "v2-countUp 0.3s ease both",
          color: isOver ? undefined : undefined,
          background: isOver
            ? "linear-gradient(135deg, #dc2626, #ef4444)"
            : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {formatted}
      </div>
      <div className="v2-cost-ticker__currency">đồng VND</div>

      {/* Budget bar */}
      {budget > 0 && (
        <div className="v2-cost-ticker__budget-bar">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "var(--c-neutral-muted)",
            marginBottom: 4,
            fontWeight: 600,
          }}>
            <span>Ngân sách: {budget.toLocaleString("vi-VN")}đ</span>
            <span style={{ color: isOver ? "#ef4444" : "#10b981", fontWeight: 700 }}>
              {isOver ? `Vượt ${(totalPrice - budget).toLocaleString("vi-VN")}đ` : `Còn ${(budget - totalPrice).toLocaleString("vi-VN")}đ`}
            </span>
          </div>
          <div className="v2-cost-ticker__budget-track">
            <div
              className={`v2-cost-ticker__budget-fill ${isOver ? "v2-cost-ticker__budget-fill--over" : ""}`}
              style={{ width: `${budgetPct}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
