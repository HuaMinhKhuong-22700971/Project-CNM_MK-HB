import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";

describe("GET /api/health", () => {
  it("returns service status and database probe", async () => {
    const app = createApp();
    const response = await request(app).get("/api/health");

    assert.ok([200, 503].includes(response.status));
    assert.equal(response.body.service, "api");
    assert.ok(response.body.database);
    assert.equal(typeof response.body.database.connected, "boolean");
  });
});
