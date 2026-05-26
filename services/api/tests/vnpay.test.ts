import assert from "node:assert/strict";
import crypto from "node:crypto";
import { describe, it } from "node:test";

import { sortObject, verifyVnpayReturn } from "../src/utils/vnpay";

function signVnpayParams(params: Record<string, string>, secretKey: string) {
  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  return crypto.createHmac("sha512", secretKey).update(Buffer.from(signData, "utf-8")).digest("hex");
}

describe("VNPay verification", () => {
  it("verifies a valid signed payload without mutating the original object", () => {
    process.env.VNPAY_HASH_SECRET = "test_vnpay_secret";
    const params = {
      vnp_Amount: "1000000",
      vnp_ResponseCode: "00",
      vnp_TmnCode: "TEST",
      vnp_TxnRef: "123"
    };
    const secureHash = signVnpayParams(params, process.env.VNPAY_HASH_SECRET);
    const payload = { ...params, vnp_SecureHash: secureHash };

    assert.equal(verifyVnpayReturn(payload), true);
    assert.equal(payload.vnp_SecureHash, secureHash);
  });

  it("rejects payloads without a secure hash", () => {
    process.env.VNPAY_HASH_SECRET = "test_vnpay_secret";

    assert.equal(verifyVnpayReturn({ vnp_TxnRef: "123" }), false);
  });
});
