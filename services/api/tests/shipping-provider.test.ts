import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { createShipmentPayload } = require("../src/modules/shipments/providers/mock-shipping.provider");

describe("Shipping provider mock mode", () => {
  it("generates mock tracking code when mock mode is enabled", () => {
    const payload = createShipmentPayload(123, { carrier: "GHTK" });
    assert.ok(payload.trackingCode);
    assert.ok(payload.trackingCode.includes("MOCK"));
  });

  it("uses provided tracking code when supplied", () => {
    const payload = createShipmentPayload(123, { trackingCode: "REAL-TRACKING-123" });
    assert.strictEqual(payload.trackingCode, "REAL-TRACKING-123");
  });
});
