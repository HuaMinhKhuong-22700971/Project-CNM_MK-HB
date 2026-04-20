const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.body || {});
  return sendSuccess(res, "Register successful", result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body || {});
  return sendSuccess(res, "Login successful", result);
});

const getCurrentProfile = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentProfile(req.user.id);
  return sendSuccess(res, "Current profile fetched successfully", result);
});

const updateCurrentProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateCurrentProfile(req.user.id, req.body || {});
  return sendSuccess(res, "Profile updated successfully", result);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body || {});
  return sendSuccess(res, "Password changed successfully", result);
});

const getMyAddresses = asyncHandler(async (req, res) => {
  const result = await authService.getMyAddresses(req.user.id);
  return sendSuccess(res, "Addresses fetched successfully", result);
});

const createMyAddress = asyncHandler(async (req, res) => {
  const result = await authService.saveMyAddress(req.user.id, null, req.body || {});
  return sendSuccess(res, "Address created successfully", result, 201);
});

const updateMyAddress = asyncHandler(async (req, res) => {
  const result = await authService.saveMyAddress(req.user.id, req.params.addressId, req.body || {});
  return sendSuccess(res, "Address updated successfully", result);
});

const deleteMyAddress = asyncHandler(async (req, res) => {
  const result = await authService.deleteMyAddress(req.user.id, req.params.addressId);
  return sendSuccess(res, "Address deleted successfully", result);
});

module.exports = {
  register,
  login,
  getCurrentProfile,
  updateCurrentProfile,
  changePassword,
  getMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress
};
