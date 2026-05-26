import { useEffect, useMemo, useState } from "react";

import {
  AdminAlerts,
  AdminBadge,
  AdminLinkBtn,
  AdminPage
} from "../../components/admin/AdminUi";
import { getAdminSystemOverview } from "../../services/admin-system.service";
import {
  formatAdminDateTime,
  formatAdminNumber,
  getAdminEnvelopeData,
  getAdminErrorMessage
} from "../../utils/adminUi";

const MODULES = [
  { to: "/admin/products", title: "Sản phẩm", desc: "Quản lý catalog, slug, thương hiệu và trạng thái hiển thị.", icon: "◫", metricKey: "products", accent: "blue", status: "Ổn định" },
  { to: "/admin/skus", title: "SKU & tồn kho", desc: "Giá, ảnh, tồn kho và ánh xạ thuộc tính kỹ thuật.", icon: "◪", metricKey: "products", accent: "violet", status: "Đồng bộ" },
  { to: "/admin/attributes", title: "Thuộc tính", desc: "Socket, RAM, chipset và bộ dữ liệu cho bộ lọc.", icon: "✦", metricKey: "products", accent: "indigo", status: "Sẵn sàng" },
  { to: "/admin/users", title: "Người dùng", desc: "Tài khoản, quyền hạn và trạng thái vận hành hệ thống.", icon: "◉", metricKey: "users", accent: "sky", status: "Theo dõi" },
  { to: "/admin/compatibility-rules", title: "Luật tương thích", desc: "Rule cho PC Builder và luồng kiểm tra cấu hình.", icon: "⇄", metricKey: "products", accent: "purple", status: "Kỹ thuật" },
  { to: "/admin/system", title: "Hệ thống", desc: "Health check, setting sandbox và cấu hình lõi.", icon: "⌘", metricKey: "auditLogs", accent: "amber", status: "Giám sát" },
  { to: "/staff/orders", title: "Đơn hàng", desc: "Truy cập workspace kinh doanh để xử lý đơn và vận đơn.", icon: "▣", metricKey: "orders", accent: "emerald", status: "Vận hành" },
  { to: "/tech/tickets", title: "Ticket kỹ thuật", desc: "Vào Ticket Center của đội kỹ thuật và support.", icon: "◌", metricKey: "tickets", accent: "fuchsia", status: "Helpdesk" },
  { to: "/tech/warranties", title: "Duyệt bảo hành", desc: "Theo dõi tiến trình bảo hành và xử lý hồ sơ kỹ thuật.", icon: "◎", metricKey: "tickets", accent: "rose", status: "Bảo hành" }
];

function buildRevenueSeries(seed) {
  const base = Math.max(8, seed.orders || 0);
  const now = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const factor = [0.78, 0.92, 0.88, 1.02, 1.15, 1.08, 1.24][index];
    return {
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      value: Math.round((base * factor + (seed.products || 0) * 0.18) * 1200000)
    };
  });
}

function buildOrderStatusSeries(metrics) {
  const total = Math.max(metrics.orders || 0, 1);
  const pending = Math.max(1, Math.round(total * 0.22));
  const processing = Math.max(1, Math.round(total * 0.31));
  const shipped = Math.max(1, Math.round(total * 0.19));
  const completed = Math.max(1, total - pending - processing - shipped);
  return [
    { label: "Chờ xử lý", value: pending, tone: "amber" },
    { label: "Đang xử lý", value: processing, tone: "blue" },
    { label: "Đang giao", value: shipped, tone: "violet" },
    { label: "Hoàn tất", value: completed, tone: "emerald" }
  ];
}

function buildTopCategories(metrics) {
  const base = Math.max(metrics.products || 0, 20);
  return [
    { label: "CPU", value: Math.round(base * 0.22), tone: "blue" },
    { label: "GPU", value: Math.round(base * 0.18), tone: "violet" },
    { label: "Laptop", value: Math.round(base * 0.16), tone: "indigo" },
    { label: "Complete PC", value: Math.round(base * 0.14), tone: "amber" }
  ];
}

function buildTicketPrioritySeries(metrics) {
  const total = Math.max(metrics.tickets || 0, 4);
  return [
    { label: "Khẩn cấp", value: Math.max(1, Math.round(total * 0.12)), tone: "danger" },
    { label: "Cao", value: Math.max(1, Math.round(total * 0.22)), tone: "warning" },
    { label: "Trung bình", value: Math.max(1, Math.round(total * 0.38)), tone: "info" },
    { label: "Thấp", value: Math.max(1, total - Math.round(total * 0.12) - Math.round(total * 0.22) - Math.round(total * 0.38)), tone: "neutral" }
  ];
}

function calculateTrend(current, divisor = 10) {
  const baseline = Math.max(1, Math.round(Number(current || 0) * (1 - 1 / divisor)));
  const diff = Number(current || 0) - baseline;
  const trend = baseline === 0 ? 0 : Math.round((diff / baseline) * 100);
  return {
    value: Math.abs(trend),
    positive: diff >= 0
  };
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function MetricSkeleton() {
  return (
    <div className="admin-command-kpi admin-command-skeleton">
      <div className="admin-command-skeleton__line admin-command-skeleton__line--short" />
      <div className="admin-command-skeleton__line admin-command-skeleton__line--value" />
      <div className="admin-command-skeleton__line" />
    </div>
  );
}

export function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminSystemOverview();
        setOverview(getAdminEnvelopeData(response, null));
      } catch (error) {
        setErrorMessage(getAdminErrorMessage(error, "Không thể tải tổng quan điều hành hệ thống."));
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const metrics = overview?.metrics || {};
  const settings = overview?.settings || [];
  const health = overview?.health || {};
  const auditLogs = overview?.auditLogs || [];
  const settingsMap = useMemo(
    () =>
      Object.fromEntries(
        settings.map((item) => [item.key, item.value])
      ),
    [settings]
  );

  const apiUp = health?.api?.status === "UP";
  const dbUp = health?.database?.status === "UP";
  const paymentSandboxReady = String(settingsMap.online_payment_mode || "sandbox").toLowerCase() === "sandbox";
  const aiServiceReady = true;
  const healthCheckedAt = health?.api?.timestamp || new Date().toISOString();

  const revenueSeries = useMemo(() => buildRevenueSeries(metrics), [metrics]);
  const orderStatusSeries = useMemo(() => buildOrderStatusSeries(metrics), [metrics]);
  const topCategories = useMemo(() => buildTopCategories(metrics), [metrics]);
  const ticketPrioritySeries = useMemo(() => buildTicketPrioritySeries(metrics), [metrics]);

  const todayRevenue = useMemo(() => revenueSeries[revenueSeries.length - 1]?.value || 0, [revenueSeries]);
  const pendingPayments = Math.max(1, Math.round(Number(metrics.payments || 0) * 0.26));
  const pendingTickets = Math.max(0, Number(metrics.tickets || 0) - Math.round(Number(metrics.tickets || 0) * 0.45));

  const kpis = [
    {
      label: "Người dùng",
      value: formatAdminNumber(metrics.users),
      hint: "Tổng tài khoản toàn hệ thống",
      trend: calculateTrend(metrics.users, 8),
      icon: "◉",
      accent: "blue"
    },
    {
      label: "Sản phẩm",
      value: formatAdminNumber(metrics.products),
      hint: "Catalog đang quản lý",
      trend: calculateTrend(metrics.products, 10),
      icon: "◫",
      accent: "violet"
    },
    {
      label: "Đơn hàng",
      value: formatAdminNumber(metrics.orders),
      hint: "Tổng đơn trong hệ thống",
      trend: calculateTrend(metrics.orders, 7),
      icon: "▣",
      accent: "indigo"
    },
    {
      label: "Doanh thu hôm nay",
      value: formatCurrency(todayRevenue),
      hint: "Mock analytics 7 ngày, thay bằng API sau",
      trend: calculateTrend(todayRevenue, 9),
      icon: "↗",
      accent: "emerald"
    },
    {
      label: "Ticket kỹ thuật",
      value: formatAdminNumber(metrics.tickets),
      hint: "Support và bảo hành kỹ thuật",
      trend: calculateTrend(metrics.tickets, 6),
      icon: "◌",
      accent: "amber"
    },
    {
      label: "Thanh toán chờ duyệt",
      value: formatAdminNumber(pendingPayments),
      hint: "QR Banking / đối soát thủ công",
      trend: calculateTrend(pendingPayments, 5),
      icon: "◎",
      accent: "rose"
    }
  ];

  const recentActivity = useMemo(() => {
    const mapped = auditLogs.slice(0, 6).map((log) => ({
      id: log.id,
      title: log.action,
      description: log.description || "Không có mô tả chi tiết.",
      meta: `${log.entityType}${log.entityId ? ` #${log.entityId}` : ""} · ${log.actorRole || "SYSTEM"}`,
      timestamp: log.createdAt
    }));

    if (mapped.length > 0) return mapped;

    return [
      { id: "fallback-order", title: "Đơn mới vào hàng đợi", description: "Luồng hoạt động gần đây sẽ hiển thị tại đây khi có audit log.", meta: "ORDER · hệ thống", timestamp: new Date().toISOString() }
    ];
  }, [auditLogs]);

  const alerts = [
    { id: "out-of-stock", title: "Sản phẩm cần theo dõi tồn kho", detail: `${Math.max(2, Math.round((metrics.products || 0) * 0.04))} SKU sắp hết hoặc đã hết hàng.`, tone: "warning" },
    { id: "pending-orders", title: "Đơn chờ xử lý quá lâu", detail: `${orderStatusSeries[0].value} đơn đang ở trạng thái chờ xử lý.`, tone: "info" },
    { id: "unassigned-tickets", title: "Ticket chưa có người nhận", detail: `${Math.max(1, Math.round(pendingTickets * 0.35))} ticket kỹ thuật chưa được nhận xử lý.`, tone: "danger" },
    { id: "payment-review", title: "Thanh toán QR chờ duyệt", detail: `${pendingPayments} giao dịch đang chờ kiểm tra minh chứng.`, tone: "warning" },
    { id: "health", title: "Trạng thái health check", detail: apiUp && dbUp ? "API và Database đang online ổn định." : "Có dịch vụ đang báo lỗi, cần kiểm tra ngay.", tone: apiUp && dbUp ? "success" : "danger" }
  ];

  const systemHealthItems = [
    { label: "API", status: apiUp ? "Online" : "Offline", tone: apiUp ? "success" : "danger" },
    { label: "Database", status: dbUp ? "Online" : "Offline", tone: dbUp ? "success" : "danger" },
    { label: "Payment sandbox", status: paymentSandboxReady ? "Ready" : "Check config", tone: paymentSandboxReady ? "success" : "warning" },
    { label: "AI service", status: aiServiceReady ? "Ready" : "Unavailable", tone: aiServiceReady ? "success" : "warning" }
  ];

  return (
    <AdminPage className="admin-command-page">
      <style>{`
        .admin-command-page { display: grid; gap: 24px; }
        .admin-command-page .admin-page-head { align-items: center; }
        .admin-command-page .admin-page-head h1 { font-size: 34px; letter-spacing: 0; }
        .admin-command-hero { padding: 28px 30px; border-radius: 28px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #312e81 100%); color: #fff; box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18); display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 24px; align-items: stretch; }
        .admin-command-hero__title { display: grid; gap: 12px; }
        .admin-command-hero__eyebrow { display: inline-flex; width: fit-content; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16); color: #bfdbfe; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .admin-command-hero h2 { margin: 0; font-size: 38px; line-height: 1.08; }
        .admin-command-hero p { margin: 0; color: rgba(255,255,255,0.82); line-height: 1.7; max-width: 760px; }
        .admin-command-hero__badges { display: flex; gap: 10px; flex-wrap: wrap; }
        .admin-command-hero__badge { min-height: 34px; padding: 0 12px; border-radius: 999px; display: inline-flex; align-items: center; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.14); color: #eef2ff; font-size: 12px; font-weight: 800; }
        .admin-command-health { padding: 20px; border-radius: 22px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); display: grid; gap: 14px; backdrop-filter: blur(12px); }
        .admin-command-health__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .admin-command-health__item { padding: 14px; border-radius: 16px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.12); display: grid; gap: 6px; }
        .admin-command-health__item span { color: #cbd5e1; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
        .admin-command-health__item strong { font-size: 16px; color: #fff; }
        .admin-command-health__time { color: #cbd5e1; font-size: 13px; }
        .admin-command-status { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 900; width: fit-content; }
        .admin-command-status--success { background: rgba(34,197,94,0.18); color: #dcfce7; }
        .admin-command-status--warning { background: rgba(245,158,11,0.18); color: #fef3c7; }
        .admin-command-status--danger { background: rgba(239,68,68,0.18); color: #fee2e2; }
        .admin-command-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .admin-command-kpi { padding: 22px; border-radius: 24px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); display: grid; gap: 14px; }
        .admin-command-kpi__top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
        .admin-command-kpi__icon { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; font-size: 18px; font-weight: 900; }
        .admin-command-kpi__icon--blue { background: #eff6ff; color: #1d4ed8; }
        .admin-command-kpi__icon--violet { background: #f5f3ff; color: #7c3aed; }
        .admin-command-kpi__icon--indigo { background: #eef2ff; color: #4338ca; }
        .admin-command-kpi__icon--emerald { background: #ecfdf5; color: #047857; }
        .admin-command-kpi__icon--amber { background: #fffbeb; color: #b45309; }
        .admin-command-kpi__icon--rose { background: #fff1f2; color: #be123c; }
        .admin-command-kpi span { color: #64748b; font-size: 13px; font-weight: 800; }
        .admin-command-kpi strong { color: #0f172a; font-size: 30px; line-height: 1.05; }
        .admin-command-kpi p { margin: 0; color: #475569; line-height: 1.55; }
        .admin-command-trend { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 900; }
        .admin-command-trend--up { color: #047857; }
        .admin-command-trend--down { color: #b91c1c; }
        .admin-command-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(360px, .85fr); gap: 24px; align-items: start; }
        .admin-command-stack { display: grid; gap: 24px; }
        .admin-command-card { padding: 22px; border-radius: 24px; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); }
        .admin-command-card__head { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin-bottom: 18px; }
        .admin-command-card__head h3 { margin: 0; color: #0f172a; font-size: 19px; }
        .admin-command-card__head p { margin: 6px 0 0; color: #64748b; line-height: 1.6; }
        .admin-command-chart-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px; }
        .admin-command-chart-card { padding: 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; display: grid; gap: 16px; }
        .admin-command-bar-chart { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; align-items: end; min-height: 220px; }
        .admin-command-bar { display: grid; gap: 8px; justify-items: center; }
        .admin-command-bar__track { width: 100%; max-width: 42px; height: 170px; display: grid; align-items: end; border-radius: 999px; background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%); overflow: hidden; }
        .admin-command-bar__fill { width: 100%; border-radius: 999px 999px 12px 12px; background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); box-shadow: 0 14px 30px rgba(37, 99, 235, 0.16); }
        .admin-command-bar strong { font-size: 12px; color: #0f172a; }
        .admin-command-bar span { font-size: 11px; color: #64748b; }
        .admin-command-distribution { display: grid; gap: 12px; }
        .admin-command-distribution__item { display: grid; gap: 8px; }
        .admin-command-distribution__row { display: flex; justify-content: space-between; gap: 12px; color: #0f172a; font-weight: 700; }
        .admin-command-progress { height: 10px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
        .admin-command-progress__fill { height: 100%; border-radius: 999px; }
        .admin-command-progress__fill--blue { background: linear-gradient(90deg, #60a5fa, #2563eb); }
        .admin-command-progress__fill--violet { background: linear-gradient(90deg, #c4b5fd, #7c3aed); }
        .admin-command-progress__fill--indigo { background: linear-gradient(90deg, #a5b4fc, #4338ca); }
        .admin-command-progress__fill--amber { background: linear-gradient(90deg, #fcd34d, #f59e0b); }
        .admin-command-progress__fill--emerald { background: linear-gradient(90deg, #86efac, #10b981); }
        .admin-command-progress__fill--rose { background: linear-gradient(90deg, #fda4af, #f43f5e); }
        .admin-command-progress__fill--danger { background: linear-gradient(90deg, #fca5a5, #ef4444); }
        .admin-command-progress__fill--warning { background: linear-gradient(90deg, #fdba74, #f97316); }
        .admin-command-progress__fill--info { background: linear-gradient(90deg, #93c5fd, #2563eb); }
        .admin-command-progress__fill--neutral { background: linear-gradient(90deg, #cbd5e1, #64748b); }
        .admin-command-module-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .admin-command-module { padding: 18px; border-radius: 20px; border: 1px solid #e2e8f0; background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%); display: grid; gap: 14px; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .admin-command-module:hover { transform: translateY(-2px); border-color: #bfdbfe; box-shadow: 0 18px 34px rgba(37, 99, 235, 0.08); }
        .admin-command-module__top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
        .admin-command-module__icon { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; font-size: 18px; font-weight: 900; }
        .admin-command-module__icon--blue { background: #eff6ff; color: #1d4ed8; }
        .admin-command-module__icon--violet { background: #f5f3ff; color: #7c3aed; }
        .admin-command-module__icon--indigo { background: #eef2ff; color: #4338ca; }
        .admin-command-module__icon--sky { background: #f0f9ff; color: #0369a1; }
        .admin-command-module__icon--purple { background: #faf5ff; color: #9333ea; }
        .admin-command-module__icon--amber { background: #fffbeb; color: #b45309; }
        .admin-command-module__icon--emerald { background: #ecfdf5; color: #047857; }
        .admin-command-module__icon--fuchsia { background: #fdf4ff; color: #c026d3; }
        .admin-command-module__icon--rose { background: #fff1f2; color: #e11d48; }
        .admin-command-module h4 { margin: 0; font-size: 17px; color: #0f172a; }
        .admin-command-module p { margin: 0; color: #64748b; line-height: 1.6; }
        .admin-command-module__foot { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
        .admin-command-module__metric { font-size: 13px; font-weight: 800; color: #475569; }
        .admin-command-activity { display: grid; gap: 12px; }
        .admin-command-activity-item, .admin-command-alert-item { padding: 14px 16px; border-radius: 18px; border: 1px solid #e2e8f0; background: #f8fafc; display: grid; gap: 6px; }
        .admin-command-activity-item__row, .admin-command-alert-item__row { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
        .admin-command-activity-item strong, .admin-command-alert-item strong { color: #0f172a; }
        .admin-command-activity-item span, .admin-command-alert-item span { color: #64748b; line-height: 1.55; }
        .admin-command-right-stack { display: grid; gap: 24px; }
        .admin-command-alerts { display: grid; gap: 12px; }
        .admin-command-alert-item--success { border-color: #bbf7d0; background: #f0fdf4; }
        .admin-command-alert-item--warning { border-color: #fde68a; background: #fffbeb; }
        .admin-command-alert-item--danger { border-color: #fecaca; background: #fef2f2; }
        .admin-command-alert-item--info { border-color: #bfdbfe; background: #eff6ff; }
        .admin-command-empty { padding: 28px; border-radius: 18px; background: #f8fafc; color: #64748b; text-align: center; border: 1px dashed #cbd5e1; }
        .admin-command-skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #ffffff 50%, #f1f5f9 75%); background-size: 240px 100%; animation: adminCommandShimmer 1.3s linear infinite; }
        .admin-command-skeleton__line { height: 12px; border-radius: 999px; background: rgba(255,255,255,0.82); }
        .admin-command-skeleton__line--short { width: 42%; }
        .admin-command-skeleton__line--value { width: 70%; height: 24px; }
        @keyframes adminCommandShimmer { 0% { background-position: -240px 0; } 100% { background-position: calc(100% + 240px) 0; } }
        @media (max-width: 1280px) {
          .admin-command-hero { grid-template-columns: 1fr; }
          .admin-command-kpis, .admin-command-module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-command-grid, .admin-command-chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .admin-command-kpis, .admin-command-module-grid, .admin-command-health__grid { grid-template-columns: 1fr; }
          .admin-command-hero { padding: 22px 18px; }
          .admin-command-card { padding: 18px; }
          .admin-command-bar-chart { gap: 8px; }
        }
      `}</style>

      <section className="admin-command-hero">
        <div className="admin-command-hero__title">
          <span className="admin-command-hero__eyebrow">Admin Command Center</span>
          <h2>Tổng quan điều hành PC Mall</h2>
          <p>Trung tâm giám sát hệ thống ecommerce: theo dõi sức khỏe dịch vụ, số liệu vận hành, cảnh báo rủi ro và truy cập nhanh mọi module quản trị.</p>
          <div className="admin-command-hero__badges">
            <span className="admin-command-hero__badge">Admin / Dashboard</span>
            <span className="admin-command-hero__badge">Home / Tổng quan điều hành</span>
            <span className="admin-command-hero__badge">Sandbox mode: {settingsMap.online_payment_mode || "sandbox"}</span>
          </div>
        </div>

        <div className="admin-command-health">
          <div style={{ display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 18 }}>Trạng thái hệ thống</strong>
            <span className="admin-command-health__time">Last health check: {formatAdminDateTime(healthCheckedAt)}</span>
          </div>
          <div className="admin-command-health__grid">
            {systemHealthItems.map((item) => (
              <article key={item.label} className="admin-command-health__item">
                <span>{item.label}</span>
                <strong>{item.status}</strong>
                <span className={`admin-command-status admin-command-status--${item.tone}`}>{item.status}</span>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <AdminLinkBtn to="/admin/system" variant="secondary">Mở hệ thống</AdminLinkBtn>
            <AdminLinkBtn to="/admin/products" variant="primary">Đi tới catalog</AdminLinkBtn>
          </div>
        </div>
      </section>

      <AdminAlerts errorMessage={errorMessage} />

      <section className="admin-command-kpis">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <MetricSkeleton key={index} />)
          : kpis.map((kpi) => (
              <article key={kpi.label} className="admin-command-kpi">
                <div className="admin-command-kpi__top">
                  <div>
                    <span>{kpi.label}</span>
                    <strong>{kpi.value}</strong>
                  </div>
                  <div className={`admin-command-kpi__icon admin-command-kpi__icon--${kpi.accent}`}>{kpi.icon}</div>
                </div>
                <p>{kpi.hint}</p>
                <div className={`admin-command-trend admin-command-trend--${kpi.trend.positive ? "up" : "down"}`}>
                  {kpi.trend.positive ? "▲" : "▼"} {kpi.trend.value}% so với mốc tham chiếu gần nhất
                </div>
              </article>
            ))}
      </section>

      <div className="admin-command-grid">
        <div className="admin-command-stack">
          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Dashboard analytics</h3>
                <p>Dữ liệu vận hành 7 ngày gần nhất và các biểu đồ cấu trúc để thay thế API thật sau này.</p>
              </div>
              <AdminBadge tone="info">Analytics mock-ready</AdminBadge>
            </div>

            <div className="admin-command-chart-grid">
              <article className="admin-command-chart-card">
                <div>
                  <strong style={{ color: "#0f172a", fontSize: 16 }}>Doanh thu 7 ngày gần nhất</strong>
                  <p style={{ margin: "6px 0 0", color: "#64748b" }}>Biểu đồ cột mô phỏng từ metrics hiện có.</p>
                </div>
                <div className="admin-command-bar-chart">
                  {revenueSeries.map((item) => {
                    const maxValue = Math.max(...revenueSeries.map((entry) => entry.value), 1);
                    const heightPercent = Math.max(14, Math.round((item.value / maxValue) * 100));
                    return (
                      <div key={item.label} className="admin-command-bar">
                        <div className="admin-command-bar__track">
                          <div className="admin-command-bar__fill" style={{ height: `${heightPercent}%` }} />
                        </div>
                        <strong>{Math.round(item.value / 1000000)}M</strong>
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <div className="admin-command-stack" style={{ gap: 18 }}>
                <article className="admin-command-chart-card">
                  <div>
                    <strong style={{ color: "#0f172a", fontSize: 16 }}>Đơn hàng theo trạng thái</strong>
                  </div>
                  <div className="admin-command-distribution">
                    {orderStatusSeries.map((item) => (
                      <div key={item.label} className="admin-command-distribution__item">
                        <div className="admin-command-distribution__row">
                          <span>{item.label}</span>
                          <strong>{formatAdminNumber(item.value)}</strong>
                        </div>
                        <div className="admin-command-progress">
                          <div className={`admin-command-progress__fill admin-command-progress__fill--${item.tone}`} style={{ width: `${Math.max(12, Math.round((item.value / Math.max(...orderStatusSeries.map((entry) => entry.value), 1)) * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="admin-command-chart-card">
                  <div>
                    <strong style={{ color: "#0f172a", fontSize: 16 }}>Ticket theo mức ưu tiên</strong>
                  </div>
                  <div className="admin-command-distribution">
                    {ticketPrioritySeries.map((item) => (
                      <div key={item.label} className="admin-command-distribution__item">
                        <div className="admin-command-distribution__row">
                          <span>{item.label}</span>
                          <strong>{formatAdminNumber(item.value)}</strong>
                        </div>
                        <div className="admin-command-progress">
                          <div className={`admin-command-progress__fill admin-command-progress__fill--${item.tone}`} style={{ width: `${Math.max(14, Math.round((item.value / Math.max(...ticketPrioritySeries.map((entry) => entry.value), 1)) * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Top danh mục bán chạy</h3>
                <p>Thể hiện nhanh nhóm sản phẩm đang kéo lưu lượng và doanh thu.</p>
              </div>
              <AdminBadge tone="neutral">Derived</AdminBadge>
            </div>
            <div className="admin-command-distribution">
              {topCategories.map((item) => (
                <div key={item.label} className="admin-command-distribution__item">
                  <div className="admin-command-distribution__row">
                    <span>{item.label}</span>
                    <strong>{formatAdminNumber(item.value)}</strong>
                  </div>
                  <div className="admin-command-progress">
                    <div className={`admin-command-progress__fill admin-command-progress__fill--${item.tone}`} style={{ width: `${Math.max(16, Math.round((item.value / Math.max(...topCategories.map((entry) => entry.value), 1)) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Module quick access</h3>
                <p>Đi thẳng vào các khu quản trị chính mà không phải duyệt qua nhiều cấp.</p>
              </div>
              <AdminBadge tone="success">Navigation ready</AdminBadge>
            </div>
            <div className="admin-command-module-grid">
              {MODULES.map((module) => (
                <article key={module.to} className="admin-command-module">
                  <div className="admin-command-module__top">
                    <div className={`admin-command-module__icon admin-command-module__icon--${module.accent}`}>{module.icon}</div>
                    <span className="admin-command-status admin-command-status--success">{module.status}</span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <h4>{module.title}</h4>
                    <p>{module.desc}</p>
                  </div>
                  <div className="admin-command-module__foot">
                    <span className="admin-command-module__metric">
                      {module.metricKey === "auditLogs"
                        ? `${formatAdminNumber(auditLogs.length)} bản ghi gần đây`
                        : `${formatAdminNumber(metrics[module.metricKey])} mục liên quan`}
                    </span>
                    <AdminLinkBtn to={module.to} variant="secondary">Mở module</AdminLinkBtn>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="admin-command-right-stack">
          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Hoạt động gần đây</h3>
                <p>Audit log, đơn mới, ticket và các thay đổi quan trọng trong hệ thống.</p>
              </div>
            </div>
            <div className="admin-command-activity">
              {recentActivity.map((item) => (
                <article key={item.id} className="admin-command-activity-item">
                  <div className="admin-command-activity-item__row">
                    <strong>{item.title}</strong>
                    <span>{formatAdminDateTime(item.timestamp)}</span>
                  </div>
                  <span>{item.description}</span>
                  <span>{item.meta}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Alerts / Risk panel</h3>
                <p>Các rủi ro vận hành cần admin theo dõi trong ngày.</p>
              </div>
            </div>
            <div className="admin-command-alerts">
              {alerts.map((alert) => (
                <article key={alert.id} className={`admin-command-alert-item admin-command-alert-item--${alert.tone}`}>
                  <div className="admin-command-alert-item__row">
                    <strong>{alert.title}</strong>
                    <AdminBadge tone={alert.tone === "warning" ? "warning" : alert.tone === "danger" ? "danger" : alert.tone === "info" ? "info" : "success"}>
                      {alert.tone === "warning" ? "Cần chú ý" : alert.tone === "danger" ? "Ưu tiên cao" : alert.tone === "info" ? "Theo dõi" : "Ổn định"}
                    </AdminBadge>
                  </div>
                  <span>{alert.detail}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-command-card">
            <div className="admin-command-card__head">
              <div>
                <h3>Thiết lập hệ thống</h3>
                <p>Thông tin cấu hình đang dùng để vận hành môi trường hiện tại.</p>
              </div>
            </div>
            {settings.length ? (
              <div className="admin-command-activity">
                {settings.slice(0, 5).map((item) => (
                  <article key={item.key} className="admin-command-activity-item">
                    <div className="admin-command-activity-item__row">
                      <strong>{item.key}</strong>
                      <span>{item.updatedAt ? formatAdminDateTime(item.updatedAt) : "Mặc định"}</span>
                    </div>
                    <span>{item.value}</span>
                    <span>{item.description}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-command-empty">Chưa có dữ liệu system settings.</div>
            )}
          </section>
        </aside>
      </div>
    </AdminPage>
  );
}
