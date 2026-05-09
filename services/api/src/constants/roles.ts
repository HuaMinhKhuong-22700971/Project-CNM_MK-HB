export const ROLES = {
  CUSTOMER: "CUSTOMER",
  SALES: "SALES_STAFF",
  SALES_STAFF: "SALES_STAFF",
  TECHNICIAN: "TECH_STAFF",
  TECH_STAFF: "TECH_STAFF",
  ADMIN: "ADMIN"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
