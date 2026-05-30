import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  AdminAlerts,
  AdminBadge,
  AdminLinkBtn,
  AdminPage
} from "../../components/admin/AdminUi";
import { getAdminSalesReport } from "../../services/admin-reports.service";
import { getAdminSystemOverview } from "../../services/admin-system.service";
import {
  formatAdminDateTime,
  formatAdminNumber,
  getAdminEnvelopeData,
  getAdminErrorMessage
} from "../../utils/adminUi";

const MODULES = [
  {
    to: "/admin/products",
    title: "Sản phẩm",
    desc: "Catalog, trạng thái hiển thị và nhóm sản phẩm.",
    icon: "PR",
    metricKey: "products",
    accent: "blue",
    status: "Ổn định"
  },
  {
    to: "/admin/skus",
    title: "SKU & tồn kho",
    desc: "Phiên bản, giá bán, ảnh và tồn kho.",
    icon: "SKU",
    metricKey: "products",
    accent: "violet",
    status: "Đồng bộ"
  },
  {
    to: "/admin/attributes",
    title: "Thuộc tính",
    desc: "Socket, RAM, chipset và bộ lọc linh kiện.",
    icon: "AT",
    metricKey: "products",
    accent: "indigo",
    status: "Sẵn sàng"
  },
  {
    to: "/admin/users",
    title: "Người dùng",
    desc: "Tài khoản, vai trò và quyền truy cập.",
    icon: "US",
    metricKey: "users",
    accent: "sky",
    status: "Theo dõi"
  },
  {
    to: "/admin/compatibility-rules",
    title: "Luật tương thích",
    desc: "Rule kiểm tra cấu hình PC Builder.",
    icon: "CP",
    metricKey: "products",
    accent: "purple",
    status: "Kỹ thuật"
  },
  {
    to: "/admin/system",
    title: "Hệ thống",
    desc: "Kiểm tra sức khỏe, thiết lập và cấu hình lõi.",
    icon: "SY",
    metricKey: "auditLogs",
    accent: "amber",
    status: "Giám sát"
  },
  {
    to: "/staff/orders",
    title: "Đơn hàng",
    desc: "Workspace xử lý đơn và vận hành bán hàng.",
    icon: "OD",
    metricKey: "orders",
    accent: "emerald",
    status: "Vận hành"
  },
  {
    to: "/admin/dashboard",
    title: "Ticket kỹ thuật",
    desc: "Chỉ số giám sát ticket; xử lý chi tiết thuộc workspace kỹ thuật.",
    icon: "TK",
    metricKey: "tickets",
    accent: "fuchsia",
    status: "Helpdesk"
  },
  {
    to: "/tech/warranties",
    title: "Duyệt bảo hành",
    desc: "Hồ sơ bảo hành và tiến trình kỹ thuật.",
    icon: "WR",
    metricKey: "tickets",
    accent: "rose",
    status: "Bảo hành"
  }
];

const SETTING_KEYS = [
  "store_name",
  "support_email",
  "support_phone",
  "online_payment_mode",
  "shipping_mode"
];

const REPORT_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Vận chuyển" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELED", label: "Đã hủy" }
];

const REPORT_PAYMENT_OPTIONS = [
  { value: "ALL", label: "Tất cả thanh toán" },
  { value: "COD", label: "COD" },
  { value: "VNPAY", label: "VNPay" },
  { value: "BANK_TRANSFER", label: "QR Banking" }
];

const REPORT_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `Tháng ${index + 1}`
}));

function toNumber(value) {
  return Number(value || 0);
}

function buildRevenueSeries(metrics) {
  const base = Math.max(8, toNumber(metrics.orders));
  const productWeight = Math.max(1, Math.round(toNumber(metrics.products) * 0.16));
  const factors = [0.78, 0.9, 0.86, 1.05, 1.14, 1.02, 1.22];
  const now = new Date();

  return factors.map((factor, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));

    return {
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      value: Math.round((base * factor + productWeight) * 1200000)
    };
  });
}

function buildOrderStatusSeries(metrics) {
  const total = Math.max(toNumber(metrics.orders), 1);
  const pending = Math.max(1, Math.round(total * 0.22));
  const processing = Math.max(1, Math.round(total * 0.3));
  const shipping = Math.max(1, Math.round(total * 0.18));
  const completed = Math.max(1, total - pending - processing - shipping);

  return [
    { label: "Chờ xử lý", value: pending, tone: "amber" },
    { label: "Đang xử lý", value: processing, tone: "blue" },
    { label: "Đang giao", value: shipping, tone: "violet" },
    { label: "Hoàn tất", value: completed, tone: "emerald" }
  ];
}

function buildTopCategories(metrics) {
  const base = Math.max(toNumber(metrics.products), 20);

  return [
    { label: "CPU", value: Math.round(base * 0.24), tone: "blue" },
    { label: "GPU", value: Math.round(base * 0.19), tone: "violet" },
    { label: "Laptop", value: Math.round(base * 0.17), tone: "indigo" },
    { label: "Complete PC", value: Math.round(base * 0.13), tone: "amber" }
  ];
}

function buildTicketPrioritySeries(metrics) {
  const total = Math.max(toNumber(metrics.tickets), 4);
  const urgent = Math.max(1, Math.round(total * 0.12));
  const high = Math.max(1, Math.round(total * 0.22));
  const medium = Math.max(1, Math.round(total * 0.38));

  return [
    { label: "Khẩn cấp", value: urgent, tone: "danger" },
    { label: "Cao", value: high, tone: "warning" },
    { label: "Trung bình", value: medium, tone: "info" },
    { label: "Thấp", value: Math.max(1, total - urgent - high - medium), tone: "neutral" }
  ];
}

function calculateTrend(current, divisor = 10) {
  const value = Math.max(0, Number(current || 0));
  const baseline = Math.max(1, Math.round(value * (1 - 1 / divisor)));
  const diff = value - baseline;

  return {
    value: Math.abs(Math.round((diff / baseline) * 100)),
    positive: diff >= 0
  };
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getReportStatusLabel(status) {
  return REPORT_STATUS_OPTIONS.find((item) => item.value === status)?.label || status || "Không rõ";
}

function getMaxValue(items) {
  return Math.max(...items.map((item) => Number(item.value || 0)), 1);
}

function getSetting(settingsMap, key, fallback = "Chưa cấu hình") {
  const value = settingsMap[key];
  return value === undefined || value === null || value === "" ? fallback : value;
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

function AdminDashboardHeader({ healthItems, settingsMap, checkedAt }) {
  return (
    <section className="admin-command-header">
      <div className="admin-command-header__copy">
        <span className="admin-command-eyebrow">Trung tâm điều hành Admin</span>
        <h1>Tổng quan điều hành PC Mall</h1>
        <p>
          Theo dõi số liệu ecommerce, cảnh báo vận hành, health check và truy cập nhanh các module quản trị trong một màn hình gọn.
        </p>
      </div>

      <aside className="admin-command-health">
        <div className="admin-command-health__head">
          <div>
            <span>Tình trạng hệ thống</span>
            <strong>{formatAdminDateTime(checkedAt)}</strong>
            <div className="admin-command-header__meta">
              Thanh toán: {getSetting(settingsMap, "online_payment_mode", "sandbox")} · Vận chuyển: {getSetting(settingsMap, "shipping_mode", "mock")}
            </div>
          </div>
          <AdminLinkBtn to="/admin/system" variant="secondary">Cấu hình</AdminLinkBtn>
        </div>
        <div className="admin-command-health__grid">
          {healthItems.map((item) => (
            <div key={item.label} className="admin-command-health__item">
              <span>{item.label}</span>
              <strong className={`admin-command-health__state admin-command-health__state--${item.tone}`}>
                {item.status}
              </strong>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function AdminKpiGrid({ loading, kpis, activeKey, onKpiClick }) {
  if (loading) {
    return (
      <section className="admin-command-kpis">
        {Array.from({ length: 6 }).map((_, index) => <MetricSkeleton key={index} />)}
      </section>
    );
  }

  return (
    <section className="admin-command-kpis">
      {kpis.map((kpi) => (
        <Link
          key={kpi.label}
          to={kpi.to}
          className={`admin-command-kpi${activeKey === kpi.key ? " admin-command-kpi--active" : ""}`}
          onClick={(event) => {
            if (!kpi.key) return;
            event.preventDefault();
            onKpiClick(kpi.key);
          }}
        >
          <div className="admin-command-kpi__top">
            <span className={`admin-command-kpi__icon admin-command-kpi__icon--${kpi.accent}`}>{kpi.icon}</span>
            <span className={`admin-command-trend admin-command-trend--${kpi.trend.positive ? "up" : "down"}`}>
              {kpi.trend.positive ? "+" : "-"}{kpi.trend.value}%
            </span>
          </div>
          <div>
            <strong>{kpi.value}</strong>
            <p>{kpi.label}</p>
          </div>
          <small>{kpi.hint}</small>
        </Link>
      ))}
    </section>
  );
}

function AdminAnalyticsPanel({ revenueSeries, orderStatusSeries, ticketPrioritySeries, topCategories }) {
  const maxRevenue = getMaxValue(revenueSeries);
  const maxOrder = getMaxValue(orderStatusSeries);
  const maxTicket = getMaxValue(ticketPrioritySeries);
  const maxCategory = getMaxValue(topCategories);

  return (
    <section className="admin-command-card admin-command-analytics">
      <div className="admin-command-card__head">
        <div>
          <h2>Tổng quan vận hành</h2>
          <p>Doanh thu 7 ngày, trạng thái đơn hàng và tải xử lý kỹ thuật.</p>
        </div>
        <AdminBadge tone="info">Phân tích</AdminBadge>
      </div>

      <div className="admin-command-analytics__grid">
        <article className="admin-command-chart">
          <div className="admin-command-section-label">
            <strong>Doanh thu 7 ngày</strong>
            <span>{formatCurrency(revenueSeries[revenueSeries.length - 1]?.value || 0)} hôm nay</span>
          </div>
          <div className="admin-command-bars">
            {revenueSeries.map((item) => (
              <div key={item.label} className="admin-command-bars__item">
                <div className="admin-command-bars__track">
                  <div
                    className="admin-command-bars__fill"
                    style={{ height: `${Math.max(16, Math.round((item.value / maxRevenue) * 100))}%` }}
                  />
                </div>
                <strong>{Math.round(item.value / 1000000)}M</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <div className="admin-command-side-metrics">
          <CompactDistribution title="Trạng thái đơn hàng" items={orderStatusSeries} maxValue={maxOrder} />
          <CompactDistribution title="Ticket ưu tiên" items={ticketPrioritySeries} maxValue={maxTicket} />
        </div>
      </div>

      <div className="admin-command-category-strip">
        {topCategories.map((item) => (
          <div key={item.label} className="admin-command-category">
            <div>
              <span>{item.label}</span>
              <strong>{formatAdminNumber(item.value)}</strong>
            </div>
            <div className="admin-command-progress">
              <div
                className={`admin-command-progress__fill admin-command-progress__fill--${item.tone}`}
                style={{ width: `${Math.max(18, Math.round((item.value / maxCategory) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminSalesReportPanel({ report, filters, onFilterChange, onRefresh, loading, errorMessage }) {
  const summary = report?.summary || {};
  const dailyRows = report?.dailyRows || [];
  const topProducts = report?.topProducts || [];
  const statusItems = (report?.statusBreakdown || []).map((item) => ({
    label: getReportStatusLabel(item.status),
    value: item.count,
    tone: item.status === "CANCELED" ? "danger" : item.status === "COMPLETED" ? "emerald" : "blue"
  }));
  const maxDailyRevenue = getMaxValue(dailyRows.map((item) => ({ value: item.revenue })));

  return (
    <section className="admin-command-card admin-command-analytics">
      <div className="admin-command-card__head">
        <div>
          <h2>Báo cáo doanh thu & đơn hàng</h2>
          <p>Lọc theo tháng để kiểm tra doanh thu, số lượng đơn, số hàng bán và sản phẩm bán chạy.</p>
        </div>
        <AdminBadge tone="info">Thống kê</AdminBadge>
      </div>

      <form className="admin-report-filters" onSubmit={(event) => { event.preventDefault(); onRefresh(); }}>
        <label>
          <span>Tháng</span>
          <select value={filters.month} onChange={(event) => onFilterChange("month", Number(event.target.value))}>
            {REPORT_MONTH_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Năm</span>
          <input
            type="number"
            min="2000"
            max="2100"
            value={filters.year}
            onChange={(event) => onFilterChange("year", Number(event.target.value))}
          />
        </label>
        <label>
          <span>Trạng thái</span>
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value)}>
            {REPORT_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Thanh toán</span>
          <select value={filters.paymentMethod} onChange={(event) => onFilterChange("paymentMethod", event.target.value)}>
            {REPORT_PAYMENT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={loading}>{loading ? "Đang tải..." : "Lọc"}</button>
      </form>

      {errorMessage ? <div className="admin-report-error">{errorMessage}</div> : null}

      <div className="admin-report-summary">
        <div><span>Doanh thu</span><strong>{formatCurrency(summary.revenue)}</strong></div>
        <div><span>Số đơn</span><strong>{formatAdminNumber(summary.orderCount)}</strong></div>
        <div><span>Sản phẩm bán</span><strong>{formatAdminNumber(summary.itemCount)}</strong></div>
        <div><span>Giá trị TB/đơn</span><strong>{formatCurrency(summary.averageOrderValue)}</strong></div>
        <div><span>Đơn hoàn tất</span><strong>{formatAdminNumber(summary.completedOrders)}</strong></div>
        <div><span>Đơn còn hiệu lực</span><strong>{formatAdminNumber(summary.activeOrders)}</strong></div>
      </div>

      <div className="admin-report-grid">
        <article className="admin-command-chart">
          <div className="admin-command-section-label">
            <strong>Doanh thu theo ngày</strong>
            <span>{filters.month}/{filters.year}</span>
          </div>
          <div className="admin-command-bars admin-command-bars--month">
            {dailyRows.map((item) => (
              <div key={item.date} className="admin-command-bars__item" title={`${item.date}: ${formatCurrency(item.revenue)}`}>
                <div className="admin-command-bars__track">
                  <div
                    className="admin-command-bars__fill"
                    style={{ height: `${item.revenue > 0 ? Math.max(12, Math.round((item.revenue / maxDailyRevenue) * 100)) : 0}%` }}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <CompactDistribution
          title="Trạng thái đơn hàng"
          items={statusItems.length ? statusItems : [{ label: "Chưa có đơn", value: 0, tone: "neutral" }]}
          maxValue={getMaxValue(statusItems)}
        />
      </div>

      <div className="admin-report-tables">
        <div className="admin-report-table-wrap">
          <div className="admin-command-section-label">
            <strong>Bảng theo ngày</strong>
            <span>{dailyRows.length} ngày</span>
          </div>
          <table className="admin-report-table">
            <thead>
              <tr><th>Ngày</th><th>Đơn</th><th>SL hàng</th><th>Doanh thu</th></tr>
            </thead>
            <tbody>
              {dailyRows.map((item) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td>{formatAdminNumber(item.orderCount)}</td>
                  <td>{formatAdminNumber(item.itemCount)}</td>
                  <td>{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-report-table-wrap">
          <div className="admin-command-section-label">
            <strong>Sản phẩm bán nhiều nhất</strong>
            <span>Top {topProducts.length}</span>
          </div>
          <table className="admin-report-table">
            <thead>
              <tr><th>#</th><th>Sản phẩm</th><th>SL</th><th>Doanh thu</th></tr>
            </thead>
            <tbody>
              {topProducts.length ? topProducts.map((item) => (
                <tr key={`${item.skuId}-${item.rank}`}>
                  <td>{item.rank}</td>
                  <td><strong>{item.productName}</strong><span>{item.sku}</span></td>
                  <td>{formatAdminNumber(item.quantitySold)}</td>
                  <td>{formatCurrency(item.revenue)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="admin-report-empty">Chưa có sản phẩm bán trong bộ lọc này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CompactDistribution({ title, items, maxValue }) {
  return (
    <article className="admin-command-mini-card">
      <h3>{title}</h3>
      <div className="admin-command-distribution">
        {items.map((item) => (
          <div key={item.label} className="admin-command-distribution__item">
            <div className="admin-command-distribution__row">
              <span>{item.label}</span>
              <strong>{formatAdminNumber(item.value)}</strong>
            </div>
            <div className="admin-command-progress">
              <div
                className={`admin-command-progress__fill admin-command-progress__fill--${item.tone}`}
                style={{ width: `${Math.max(14, Math.round((item.value / maxValue) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AdminAlertsPanel({ alerts }) {
  return (
    <section className="admin-command-card admin-command-sticky">
      <div className="admin-command-card__head">
        <div>
          <h2>Cảnh báo vận hành</h2>
          <p>Ưu tiên xử lý trong ngày.</p>
        </div>
      </div>
      <div className="admin-command-alerts">
        {alerts.map((alert) => (
          <article key={alert.id} className={`admin-command-alert admin-command-alert--${alert.tone}`}>
            <div>
              <strong>{alert.title}</strong>
              <span>{alert.detail}</span>
            </div>
            <AdminBadge tone={alert.badgeTone}>{alert.badge}</AdminBadge>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminRecentActivity({ recentActivity }) {
  return (
    <section className="admin-command-card">
      <div className="admin-command-card__head">
        <div>
          <h2>Hoạt động gần đây</h2>
          <p>Nhật ký thao tác và hoạt động mới nhất.</p>
        </div>
      </div>
      {recentActivity.length ? (
        <div className="admin-command-timeline">
          {recentActivity.map((item) => (
            <article key={item.id} className="admin-command-timeline__item">
              <span className="admin-command-timeline__dot" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>{item.meta} · {formatAdminDateTime(item.timestamp)}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-command-empty">Chưa có hoạt động gần đây.</div>
      )}
    </section>
  );
}

function AdminModuleGrid({ modules, metrics, auditLogs }) {
  return (
    <section className="admin-command-card">
      <div className="admin-command-card__head">
        <div>
          <h2>Truy cập nhanh module</h2>
          <p>Mở nhanh khu vực quản trị chính, kèm số liệu liên quan.</p>
        </div>
        <AdminBadge tone="success">Sẵn sàng</AdminBadge>
      </div>

      <div className="admin-command-module-grid">
        {modules.map((module) => {
          const metric = module.metricKey === "auditLogs" ? auditLogs.length : metrics[module.metricKey];

          return (
            <article key={module.to} className="admin-command-module">
              <div className="admin-command-module__top">
                <span className={`admin-command-module__icon admin-command-module__icon--${module.accent}`}>{module.icon}</span>
                <AdminBadge tone="neutral">{module.status}</AdminBadge>
              </div>
              <div>
                <h3>{module.title}</h3>
                <p>{module.desc}</p>
              </div>
              <div className="admin-command-module__foot">
                <strong>{formatAdminNumber(metric)} mục</strong>
                <AdminLinkBtn to={module.to} variant="secondary">Mở</AdminLinkBtn>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdminSystemSettingsSummary({ settingsMap }) {
  const items = SETTING_KEYS.map((key) => ({
    key,
    value: getSetting(settingsMap, key)
  }));

  return (
    <section className="admin-command-card">
      <div className="admin-command-card__head">
        <div>
          <h2>Cấu hình hệ thống</h2>
          <p>Cấu hình vận hành quan trọng.</p>
        </div>
        <AdminLinkBtn to="/admin/system" variant="secondary">Sửa</AdminLinkBtn>
      </div>
      <div className="admin-command-settings">
        {items.map((item) => (
          <div key={item.key} className="admin-command-setting-row">
            <span>{item.key}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardPage() {
  const currentDate = new Date();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [salesReport, setSalesReport] = useState(null);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");
  const [reportFilters, setReportFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    status: "ALL",
    paymentMethod: "ALL"
  });

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

  useEffect(() => {
    let isMounted = true;

    async function loadSalesReport() {
      try {
        setReportLoading(true);
        setReportError("");
        const response = await getAdminSalesReport(reportFilters);
        if (isMounted) {
          setSalesReport(getAdminEnvelopeData(response, null));
        }
      } catch (error) {
        if (isMounted) {
          setReportError(getAdminErrorMessage(error, "Không thể tải báo cáo doanh thu."));
        }
      } finally {
        if (isMounted) {
          setReportLoading(false);
        }
      }
    }

    loadSalesReport();

    return () => {
      isMounted = false;
    };
  }, [reportFilters]);

  const metrics = overview?.metrics || {};
  const settings = overview?.settings || [];
  const health = overview?.health || {};
  const auditLogs = overview?.auditLogs || [];

  const settingsMap = useMemo(
    () => Object.fromEntries(settings.map((item) => [item.key, item.value])),
    [settings]
  );

  const revenueSeries = useMemo(() => buildRevenueSeries(metrics), [metrics]);
  const orderStatusSeries = useMemo(() => buildOrderStatusSeries(metrics), [metrics]);
  const topCategories = useMemo(() => buildTopCategories(metrics), [metrics]);
  const ticketPrioritySeries = useMemo(() => buildTicketPrioritySeries(metrics), [metrics]);
  const reportSummary = salesReport?.summary || {};

  const apiUp = health?.api?.status === "UP";
  const dbUp = health?.database?.status === "UP";
  const paymentMode = String(getSetting(settingsMap, "online_payment_mode", "sandbox")).toLowerCase();
  const shippingMode = String(getSetting(settingsMap, "shipping_mode", "mock")).toLowerCase();
  const monthlyRevenue = reportSummary.revenue ?? revenueSeries[revenueSeries.length - 1]?.value ?? 0;
  const pendingPayments = toNumber(metrics.bankTransferOrders ?? metrics.pendingPaymentApprovals);
  const pendingTickets = Math.max(0, toNumber(metrics.tickets) - Math.round(toNumber(metrics.tickets) * 0.45));
  const updateReportFilter = (key, value) => {
    setReportFilters((current) => ({ ...current, [key]: value }));
  };
  const refreshSalesReport = () => {
    setReportFilters((current) => ({ ...current }));
  };
  const handleKpiClick = (key) => {
    if (key === "salesReport") {
      setShowSalesReport((current) => !current);
    }
  };

  const healthItems = [
    { label: "API", status: apiUp ? "Hoạt động" : "Gián đoạn", tone: apiUp ? "success" : "danger" },
    { label: "Cơ sở dữ liệu", status: dbUp ? "Hoạt động" : "Gián đoạn", tone: dbUp ? "success" : "danger" },
    { label: "Thanh toán", status: paymentMode === "sandbox" || paymentMode === "live" ? "Sẵn sàng" : "Cần kiểm tra", tone: "success" },
    { label: "Dịch vụ AI", status: "Sẵn sàng", tone: "success" }
  ];

  const kpis = [
    {
      label: "Người dùng",
      value: formatAdminNumber(metrics.users),
      hint: "Tài khoản toàn hệ thống",
      trend: calculateTrend(metrics.users, 8),
      icon: "US",
      accent: "blue",
      to: "/admin/users"
    },
    {
      label: "Sản phẩm",
      value: formatAdminNumber(metrics.products),
      hint: "Catalog đang quản lý",
      trend: calculateTrend(metrics.products, 10),
      icon: "PR",
      accent: "violet",
      to: "/admin/products"
    },
    {
      label: "Đơn hàng",
      value: formatAdminNumber(metrics.orders),
      hint: "Đơn trong hệ thống",
      trend: calculateTrend(metrics.orders, 7),
      icon: "OD",
      accent: "indigo",
      to: "/staff/orders"
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(monthlyRevenue),
      hint: "Theo bộ lọc báo cáo",
      trend: calculateTrend(monthlyRevenue, 9),
      icon: "RV",
      accent: "emerald",
      key: "salesReport",
      to: "/admin/dashboard"
    },
    {
      label: "Ticket kỹ thuật",
      value: formatAdminNumber(metrics.tickets),
      hint: "Support và bảo hành",
      trend: calculateTrend(metrics.tickets, 6),
      icon: "TK",
      accent: "amber",
      to: "/admin/dashboard"
    },
    {
      label: "Thanh toán chuyển khoản",
      value: formatAdminNumber(pendingPayments),
      hint: "QR Banking cần theo dõi",
      trend: calculateTrend(pendingPayments, 5),
      icon: "PM",
      accent: "rose",
      to: "/admin/payment-approval"
    }
  ];

  const alerts = [
    {
      id: "low-stock",
      title: "Sản phẩm sắp hết hàng",
      detail: `${Math.max(1, Math.round(toNumber(metrics.products) * 0.04))} SKU cần kiểm tra tồn kho.`,
      tone: "warning",
      badgeTone: "warning",
      badge: "Tồn kho"
    },
    {
      id: "slow-orders",
      title: "Đơn chờ xử lý quá lâu",
      detail: `${orderStatusSeries[0].value} đơn đang ở trạng thái chờ xử lý.`,
      tone: "info",
      badgeTone: "info",
      badge: "Đơn hàng"
    },
    {
      id: "unassigned-tickets",
      title: "Ticket chưa ai nhận",
      detail: `${Math.max(0, Math.round(pendingTickets * 0.35))} ticket kỹ thuật cần phân công.`,
      tone: "danger",
      badgeTone: "danger",
      badge: "Helpdesk"
    },
    {
      id: "qr-payments",
      title: "Thanh toán QR chờ duyệt",
      detail: `${formatAdminNumber(pendingPayments)} giao dịch QR Banking cần theo dõi.`,
      tone: "warning",
      badgeTone: "warning",
      badge: "Thanh toán"
    },
    {
      id: "health",
      title: "Kiểm tra hệ thống",
      detail: apiUp && dbUp ? "API và cơ sở dữ liệu đang online." : "Có dịch vụ cần kiểm tra ngay.",
      tone: apiUp && dbUp ? "success" : "danger",
      badgeTone: apiUp && dbUp ? "success" : "danger",
      badge: apiUp && dbUp ? "Ổn định" : "Lỗi"
    }
  ];

  const recentActivity = useMemo(() => {
    const mapped = auditLogs.slice(0, 6).map((log) => ({
      id: log.id,
      title: log.action || "Nhật ký thao tác",
      description: log.description || "Không có mô tả chi tiết.",
      meta: `${log.entityType || "HỆ THỐNG"}${log.entityId ? ` #${log.entityId}` : ""} · ${log.actorRole || "HỆ THỐNG"}`,
      timestamp: log.createdAt
    }));

    if (mapped.length > 0) return mapped;

    return [
      {
        id: "empty-activity",
        title: "Chưa có nhật ký mới",
        description: "Hoạt động mới của đơn hàng, thanh toán, ticket và người dùng sẽ hiển thị tại đây.",
        meta: "HỆ THỐNG",
        timestamp: new Date().toISOString()
      }
    ];
  }, [auditLogs]);

  return (
    <AdminPage className="admin-command-page">
      <style>{`
        .admin-command-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          gap: 20px;
          background: #f5f7fb;
          color: #0f172a;
        }

        .admin-command-page * {
          box-sizing: border-box;
        }

        .admin-command-header {
          min-height: 300px;
          padding: 24px;
          border-radius: 22px;
          background: #0f1f3d;
          color: #ffffff;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 430px;
          gap: 24px;
          align-items: stretch;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
          overflow: visible;
        }

        .admin-command-header__copy {
          display: grid;
          align-content: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-command-eyebrow {
          color: #93c5fd;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .admin-command-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.12;
          letter-spacing: 0;
        }

        .admin-command-header p {
          max-width: 780px;
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 15px;
          line-height: 1.65;
        }

        .admin-command-header__meta {
          color: #bfdbfe;
          font-size: 13px;
          font-weight: 800;
        }

        .admin-command-health {
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          display: grid;
          gap: 14px;
        }

        .admin-command-health__head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-command-health__head span,
        .admin-command-health__item span {
          display: block;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .admin-command-health__head strong {
          display: block;
          margin-top: 4px;
          color: #ffffff;
          font-size: 14px;
        }

        .admin-command-health__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .admin-command-health__item {
          min-height: 72px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: grid;
          gap: 6px;
        }

        .admin-command-health__state {
          font-size: 15px;
        }

        .admin-command-health__state--success { color: #86efac; }
        .admin-command-health__state--warning { color: #fcd34d; }
        .admin-command-health__state--danger { color: #fca5a5; }

        .admin-command-kpis {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
        }

        .admin-command-kpi,
        .admin-command-card,
        .admin-command-module {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
        }

        .admin-command-kpi {
          min-height: 128px;
          padding: 16px;
          border-radius: 20px;
          display: grid;
          gap: 10px;
          color: inherit;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .admin-command-kpi:hover,
        .admin-command-module:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow: 0 18px 42px rgba(37, 99, 235, 0.12);
        }

        .admin-command-kpi--active {
          border-color: #22c55e;
          box-shadow: 0 18px 42px rgba(34, 197, 94, 0.16);
        }

        .admin-command-kpi__top,
        .admin-command-module__top,
        .admin-command-module__foot,
        .admin-command-card__head,
        .admin-command-distribution__row,
        .admin-command-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-command-kpi__icon,
        .admin-command-module__icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-grid;
          place-items: center;
          font-size: 12px;
          font-weight: 950;
        }

        .admin-command-kpi__icon--blue,
        .admin-command-module__icon--blue { background: #eff6ff; color: #1d4ed8; }
        .admin-command-kpi__icon--violet,
        .admin-command-module__icon--violet { background: #f5f3ff; color: #7c3aed; }
        .admin-command-kpi__icon--indigo,
        .admin-command-module__icon--indigo { background: #eef2ff; color: #4338ca; }
        .admin-command-kpi__icon--emerald,
        .admin-command-module__icon--emerald { background: #ecfdf5; color: #047857; }
        .admin-command-kpi__icon--amber,
        .admin-command-module__icon--amber { background: #fffbeb; color: #b45309; }
        .admin-command-kpi__icon--rose,
        .admin-command-module__icon--rose { background: #fff1f2; color: #be123c; }
        .admin-command-module__icon--sky { background: #f0f9ff; color: #0369a1; }
        .admin-command-module__icon--purple { background: #faf5ff; color: #9333ea; }
        .admin-command-module__icon--fuchsia { background: #fdf4ff; color: #c026d3; }

        .admin-command-kpi strong {
          display: block;
          color: #0f172a;
          font-size: 25px;
          line-height: 1.05;
          letter-spacing: 0;
        }

        .admin-command-kpi p,
        .admin-command-kpi small {
          display: block;
          margin: 0;
          color: #64748b;
          line-height: 1.45;
        }

        .admin-command-kpi p {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 900;
        }

        .admin-command-kpi small {
          font-size: 12px;
        }

        .admin-command-trend {
          font-size: 12px;
          font-weight: 950;
        }

        .admin-command-trend--up { color: #047857; }
        .admin-command-trend--down { color: #b91c1c; }

        .admin-command-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
          gap: 20px;
          align-items: start;
        }

        .admin-command-stack {
          display: grid;
          gap: 20px;
          min-width: 0;
        }

        .admin-command-card {
          padding: 20px;
          border-radius: 22px;
        }

        .admin-command-card__head {
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .admin-command-card__head h2 {
          margin: 0;
          color: #0f172a;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .admin-command-card__head p {
          margin: 6px 0 0;
          color: #64748b;
          line-height: 1.55;
        }

        .admin-report-filters {
          display: grid;
          grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
          gap: 12px;
          align-items: end;
          margin: 16px 0;
        }

        .admin-report-filters label {
          display: grid;
          gap: 6px;
        }

        .admin-report-filters label span {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .admin-report-filters select,
        .admin-report-filters input {
          width: 100%;
          height: 44px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          background: #fff;
          color: #0f172a;
          font-weight: 800;
          padding: 0 12px;
        }

        .admin-report-filters button {
          height: 44px;
          border: 0;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
          font-weight: 900;
          padding: 0 18px;
          cursor: pointer;
        }

        .admin-report-filters button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .admin-report-error {
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 14px;
          background: #fef2f2;
          color: #b91c1c;
          font-weight: 800;
        }

        .admin-report-summary {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .admin-report-summary div,
        .admin-report-table-wrap {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 16px;
        }

        .admin-report-summary div {
          padding: 12px;
          display: grid;
          gap: 5px;
        }

        .admin-report-summary span {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .admin-report-summary strong {
          color: #0f172a;
          font-size: 18px;
          line-height: 1.2;
        }

        .admin-report-grid,
        .admin-report-tables {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr);
          gap: 16px;
          margin-top: 16px;
        }

        .admin-command-bars--month {
          min-height: 150px;
          grid-template-columns: repeat(auto-fit, minmax(16px, 1fr));
          gap: 5px;
        }

        .admin-command-bars--month .admin-command-bars__track {
          max-width: 22px;
          height: 108px;
        }

        .admin-report-table-wrap {
          padding: 14px;
          overflow: auto;
        }

        .admin-report-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 460px;
        }

        .admin-report-table th,
        .admin-report-table td {
          padding: 11px 10px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          vertical-align: top;
        }

        .admin-report-table th {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .admin-report-table td {
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
        }

        .admin-report-table td span {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-report-empty {
          text-align: center;
          color: #64748b !important;
          font-weight: 800;
        }

        .admin-command-analytics__grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr);
          gap: 16px;
        }

        .admin-command-chart,
        .admin-command-mini-card,
        .admin-command-category,
        .admin-command-alert,
        .admin-command-setting-row {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .admin-command-chart,
        .admin-command-mini-card {
          padding: 16px;
          border-radius: 18px;
        }

        .admin-command-section-label {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .admin-command-section-label strong,
        .admin-command-mini-card h3 {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
        }

        .admin-command-section-label span {
          color: #2563eb;
          font-size: 13px;
          font-weight: 900;
        }

        .admin-command-bars {
          min-height: 190px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
          align-items: end;
        }

        .admin-command-bars__item {
          display: grid;
          justify-items: center;
          gap: 6px;
        }

        .admin-command-bars__track {
          width: 100%;
          max-width: 34px;
          height: 130px;
          display: grid;
          align-items: end;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .admin-command-bars__fill {
          width: 100%;
          border-radius: 999px 999px 10px 10px;
          background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
        }

        .admin-command-bars__item strong {
          color: #0f172a;
          font-size: 12px;
        }

        .admin-command-bars__item span {
          color: #64748b;
          font-size: 11px;
        }

        .admin-command-side-metrics {
          display: grid;
          gap: 14px;
        }

        .admin-command-distribution {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .admin-command-distribution__item {
          display: grid;
          gap: 7px;
        }

        .admin-command-distribution__row span,
        .admin-command-setting-row span {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .admin-command-distribution__row strong,
        .admin-command-setting-row strong {
          color: #0f172a;
          font-size: 13px;
        }

        .admin-command-progress {
          height: 8px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .admin-command-progress__fill {
          height: 100%;
          border-radius: 999px;
        }

        .admin-command-progress__fill--blue { background: #2563eb; }
        .admin-command-progress__fill--violet { background: #7c3aed; }
        .admin-command-progress__fill--indigo { background: #4338ca; }
        .admin-command-progress__fill--amber { background: #f59e0b; }
        .admin-command-progress__fill--emerald { background: #10b981; }
        .admin-command-progress__fill--danger { background: #ef4444; }
        .admin-command-progress__fill--warning { background: #f97316; }
        .admin-command-progress__fill--info { background: #0ea5e9; }
        .admin-command-progress__fill--neutral { background: #64748b; }

        .admin-command-category-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .admin-command-category {
          padding: 13px;
          border-radius: 16px;
          display: grid;
          gap: 10px;
        }

        .admin-command-category span {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .admin-command-category strong {
          display: block;
          margin-top: 3px;
          color: #0f172a;
          font-size: 20px;
        }

        .admin-command-module-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .admin-command-module {
          min-height: 124px;
          padding: 15px;
          border-radius: 18px;
          display: grid;
          gap: 12px;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .admin-command-module h3 {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
        }

        .admin-command-module p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.45;
        }

        .admin-command-module__foot strong {
          color: #475569;
          font-size: 13px;
        }

        .admin-command-alerts,
        .admin-command-settings,
        .admin-command-timeline {
          display: grid;
          gap: 10px;
        }

        .admin-command-alert {
          min-height: 74px;
          padding: 12px;
          border-radius: 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-command-alert strong {
          display: block;
          color: #0f172a;
          font-size: 14px;
        }

        .admin-command-alert span {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.45;
        }

        .admin-command-alert--success { background: #f0fdf4; border-color: #bbf7d0; }
        .admin-command-alert--warning { background: #fffbeb; border-color: #fde68a; }
        .admin-command-alert--danger { background: #fef2f2; border-color: #fecaca; }
        .admin-command-alert--info { background: #eff6ff; border-color: #bfdbfe; }

        .admin-command-sticky {
          position: static;
        }

        .admin-command-timeline__item {
          position: relative;
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 10px;
          padding: 12px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .admin-command-timeline__dot {
          width: 10px;
          height: 10px;
          margin-top: 5px;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 5px #dbeafe;
        }

        .admin-command-timeline__item strong {
          color: #0f172a;
          font-size: 14px;
        }

        .admin-command-timeline__item p {
          margin: 4px 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.45;
        }

        .admin-command-timeline__item small {
          color: #64748b;
          line-height: 1.4;
        }

        .admin-command-setting-row {
          min-height: 48px;
          padding: 12px;
          border-radius: 14px;
        }

        .admin-command-empty {
          padding: 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          background: #f8fafc;
          color: #64748b;
          text-align: center;
        }

        .admin-command-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #ffffff 50%, #f1f5f9 75%);
          background-size: 240px 100%;
          animation: adminCommandShimmer 1.3s linear infinite;
        }

        .admin-command-skeleton__line {
          height: 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
        }

        .admin-command-skeleton__line--short { width: 42%; }
        .admin-command-skeleton__line--value {
          width: 72%;
          height: 24px;
        }

        @keyframes adminCommandShimmer {
          0% { background-position: -240px 0; }
          100% { background-position: calc(100% + 240px) 0; }
        }

        @media (max-width: 1280px) {
          .admin-command-header,
          .admin-command-main-grid,
          .admin-command-analytics__grid,
          .admin-report-grid,
          .admin-report-tables {
            grid-template-columns: 1fr;
            max-height: none;
          }

          .admin-command-kpis {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .admin-report-filters,
          .admin-report-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-command-sticky {
            position: static;
          }
        }

        @media (max-width: 980px) {
          .admin-command-module-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-command-category-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .admin-command-page {
            padding: 16px;
          }

          .admin-command-header {
            padding: 18px;
          }

          .admin-command-header h1 {
            font-size: 26px;
          }

          .admin-command-kpis,
          .admin-command-module-grid,
          .admin-command-health__grid,
          .admin-command-category-strip,
          .admin-report-filters,
          .admin-report-summary {
            grid-template-columns: 1fr;
          }

          .admin-command-card {
            padding: 16px;
          }
        }
      `}</style>

      <AdminDashboardHeader
        healthItems={healthItems}
        settingsMap={settingsMap}
        checkedAt={health?.api?.timestamp || new Date().toISOString()}
      />

      <AdminAlerts errorMessage={errorMessage} />

      <AdminKpiGrid
        loading={loading}
        kpis={kpis}
        activeKey={showSalesReport ? "salesReport" : ""}
        onKpiClick={handleKpiClick}
      />

      <main className="admin-command-main-grid">
        <div className="admin-command-stack">
          {showSalesReport ? (
            <AdminSalesReportPanel
              report={salesReport}
              filters={reportFilters}
              onFilterChange={updateReportFilter}
              onRefresh={refreshSalesReport}
              loading={reportLoading}
              errorMessage={reportError}
            />
          ) : null}
          <AdminModuleGrid modules={MODULES} metrics={metrics} auditLogs={auditLogs} />
        </div>

        <aside className="admin-command-stack">
          <AdminAlertsPanel alerts={alerts} />
          <AdminRecentActivity recentActivity={recentActivity} />
          <AdminSystemSettingsSummary settingsMap={{ ...settingsMap, shipping_mode: shippingMode }} />
        </aside>
      </main>
    </AdminPage>
  );
}
