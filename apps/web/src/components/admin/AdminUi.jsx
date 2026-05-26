import { useEffect } from "react";
import { Link } from "react-router-dom";

export function AdminPage({ children, className = "" }) {
  return <div className={`admin-page${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function AdminPageHead({ eyebrow, title, description, actions }) {
  return (
    <section className="admin-page-head">
      <div>
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="admin-head-actions">{actions}</div> : null}
    </section>
  );
}

export function AdminAlerts({ errorMessage, successMessage }) {
  return (
    <>
      {errorMessage ? <div className="admin-alert admin-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="admin-alert admin-alert--success">{successMessage}</div> : null}
    </>
  );
}

export function useAdminToast(successMessage, onClear) {
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => onClear?.(), 3500);
    return () => clearTimeout(timer);
  }, [successMessage, onClear]);
}

export function AdminMetrics({ children }) {
  return <section className="admin-metrics">{children}</section>;
}

export function AdminMetric({ label, value, hint, tone = "default" }) {
  return (
    <div className={`admin-metric admin-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function AdminCard({ title, description, children, className = "" }) {
  return (
    <section className={`admin-card${className ? ` ${className}` : ""}`}>
      {title ? (
        <div className="admin-section-title">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminWorkspace({ children, columns = "form-list" }) {
  return <div className={`admin-workspace admin-workspace--${columns}`}>{children}</div>;
}

export function AdminBtn({ children, variant = "secondary", className = "", ...props }) {
  return (
    <button type="button" className={`admin-btn admin-btn--${variant}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </button>
  );
}

export function AdminLinkBtn({ to, children, variant = "secondary", className = "", ...props }) {
  return (
    <Link to={to} className={`admin-btn admin-btn--${variant}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </Link>
  );
}

export function AdminBadge({ children, tone = "neutral" }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function AdminEmpty({ children, compact = false }) {
  return <div className={`admin-empty${compact ? " admin-empty--compact" : ""}`}>{children}</div>;
}

export function AdminTableWrap({ children }) {
  return <div className="admin-table-wrap">{children}</div>;
}

export function AdminForm({ children, onSubmit, className = "" }) {
  return (
    <form onSubmit={onSubmit} className={`admin-form${className ? ` ${className}` : ""}`}>
      {children}
    </form>
  );
}

export function AdminField({ label, htmlFor, error, children, span }) {
  return (
    <label htmlFor={htmlFor} className={`admin-field${span ? " admin-field--span" : ""}`}>
      <span>{label}</span>
      {children}
      {error ? <em className="admin-field-error">{error}</em> : null}
    </label>
  );
}

export function AdminQuickLinks({ items = [] }) {
  return (
    <section className="admin-quick-links">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className="admin-quick-card">
          <span className="admin-quick-card__icon">{item.icon}</span>
          <strong>{item.title}</strong>
          <p>{item.desc}</p>
          <span className="admin-quick-card__cta">Mở module →</span>
        </Link>
      ))}
    </section>
  );
}

export function AdminTable({ headers, children }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableRow({ children }) {
  return <tr>{children}</tr>;
}

export function AdminTableCell({ children }) {
  return <td>{children}</td>;
}
