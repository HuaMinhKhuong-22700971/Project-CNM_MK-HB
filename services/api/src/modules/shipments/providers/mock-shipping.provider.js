function generateTrackingCode(orderId) {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MOCK-${orderId}-${timestamp}-${random}`;
}

function createShipmentPayload(orderId, payload = {}) {
  return {
    trackingCode: String(payload.trackingCode || generateTrackingCode(orderId)).trim(),
    status: String(payload.status || "CREATED").trim().toUpperCase() || "CREATED",
    provider: "MOCK_SHIPPING"
  };
}

module.exports = {
  createShipmentPayload,
  generateTrackingCode
};
