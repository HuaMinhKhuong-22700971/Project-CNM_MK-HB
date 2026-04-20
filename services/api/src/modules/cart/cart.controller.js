const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const cartService = require("./cart.service");

const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCurrentCart(req.user.id);
  return sendSuccess(res, "Cart fetched successfully", result);
});

const addItem = asyncHandler(async (req, res) => {
  const result = await cartService.addItem(req.user.id, req.body || {});
  return sendSuccess(res, "Product added to cart successfully", result, 201);
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const result = await cartService.updateItemQuantity(req.user.id, req.params.itemId, req.body || {});
  return sendSuccess(res, "Cart item updated successfully", result);
});

const removeItem = asyncHandler(async (req, res) => {
  const result = await cartService.removeItem(req.user.id, req.params.itemId);
  return sendSuccess(res, "Cart item removed successfully", result);
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem
};
