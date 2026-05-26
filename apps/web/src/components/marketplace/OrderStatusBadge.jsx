import { getOrderStatusMeta } from "../../utils/orderStatus";

export function OrderStatusBadge({ status }) {
  const meta = getOrderStatusMeta(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        color: meta.tone,
        background: meta.bg,
        border: `1px solid ${meta.border}`
      }}
    >
      {meta.label}
    </span>
  );
}
