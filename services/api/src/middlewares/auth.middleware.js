const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { getAuthUserById } = require("../modules/auth/auth.service");
const { ROLES, hasAnyRole, normalizeRole } = require("../utils/role-helpers");

const PERMISSIONS = {
  ADMIN_DASHBOARD: "admin:dashboard",
  MANAGE_PRODUCTS: "catalog:manage_products",
  MANAGE_USERS: "users:manage",
  MANAGE_COMPATIBILITY_RULES: "compatibility:manage_rules",
  MANAGE_ORDERS: "orders:manage",
  MANAGE_TICKETS: "tickets:manage",
  MANAGE_SYSTEM_SETTINGS: "system:manage"
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.SALES_STAFF]: [PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.MANAGE_TICKETS],
  [ROLES.TECH_STAFF]: [PERMISSIONS.MANAGE_COMPATIBILITY_RULES, PERMISSIONS.MANAGE_TICKETS],
  [ROLES.CUSTOMER]: []
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function verifyToken(req, _res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return next(createError("Unauthorized: access token is required", 401));
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const userId = decoded.sub;

    if (!userId) {
      return next(createError("Unauthorized: invalid access token", 401));
    }

    const user = await getAuthUserById(userId);
    req.user = {
      ...user,
      role: normalizeRole(user.role)
    };

    return next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Unauthorized: invalid or expired access token";
    }

    return next(error);
  }
}

const requireAuth = verifyToken;

function requireRole(...allowedRoles) {
  return function roleMiddleware(req, _res, next) {
    if (!req.user) {
      return next(createError("Unauthorized: please login first", 401));
    }

    if (!hasAnyRole(req.user.role, allowedRoles)) {
      return next(createError("Forbidden: you do not have permission to access this resource", 403));
    }

    return next();
  };
}

function requirePermission(...requiredPermissions) {
  return function permissionMiddleware(req, _res, next) {
    if (!req.user) {
      return next(createError("Unauthorized: please login first", 401));
    }

    const normalizedRole = normalizeRole(req.user.role);
    const grantedPermissions = ROLE_PERMISSIONS[normalizedRole] || [];
    const hasPermission = requiredPermissions.every((permission) => grantedPermissions.includes(permission));

    if (!hasPermission) {
      return next(createError("Forbidden: you do not have permission to access this resource", 403));
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  requireAuth,
  requireRole,
  requirePermission,
  PERMISSIONS,
  ROLES
};

