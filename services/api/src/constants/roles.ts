export const ROLES = {
  CUSTOMER: "CUSTOMER",
  SALES: "SALES",
  TECHNICIAN: "TECHNICIAN",
  ADMIN: "ADMIN"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
