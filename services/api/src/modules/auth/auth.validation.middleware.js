function sendValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function validateRegister(req, res, next) {
  const { full_name, email, password } = req.body || {};
  const errors = [];

  if (!String(full_name || "").trim()) {
    errors.push({ field: "full_name", message: "Full name is required" });
  }

  if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Email is invalid" });
  }

  if (String(password || "").length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Email is invalid" });
  }

  if (!String(password || "").trim()) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  next();
}

function validateUpdateProfile(req, res, next) {
  const { full_name, fullName, phone } = req.body || {};
  const errors = [];
  const nextFullName = String(full_name || fullName || "").trim();

  if (!nextFullName) {
    errors.push({ field: "full_name", message: "Full name is required" });
  }

  if (phone !== undefined && String(phone).length > 30) {
    errors.push({ field: "phone", message: "Phone is too long" });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  next();
}

function validateChangePassword(req, res, next) {
  const { currentPassword, current_password, newPassword, new_password } = req.body || {};
  const errors = [];
  const currentValue = String(currentPassword || current_password || "");
  const nextValue = String(newPassword || new_password || "");

  if (!currentValue.trim()) {
    errors.push({ field: "currentPassword", message: "Current password is required" });
  }

  if (nextValue.length < 6) {
    errors.push({ field: "newPassword", message: "New password must be at least 6 characters" });
  }

  if (currentValue && nextValue && currentValue === nextValue) {
    errors.push({ field: "newPassword", message: "New password must be different from current password" });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  next();
}

function validateAddress(req, res, next) {
  const { addressLine, address_line } = req.body || {};
  const errors = [];

  if (!String(addressLine || address_line || "").trim()) {
    errors.push({ field: "addressLine", message: "Address line is required" });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateAddress
};
