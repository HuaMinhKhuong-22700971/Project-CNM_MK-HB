import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { env } from "../src/config/env";

describe("Chat storage config", () => {
  it("allows overriding chat storage path via env var", () => {
    const originalPath = env.chatStoragePath;
    (env as any).chatStoragePath = "/custom/path/chat.json";
    assert.strictEqual(env.chatStoragePath, "/custom/path/chat.json");
    (env as any).chatStoragePath = originalPath;
  });

  it("uses default path when chatStoragePath is not set", () => {
    const originalPath = env.chatStoragePath;
    (env as any).chatStoragePath = undefined;
    assert.strictEqual(env.chatStoragePath, undefined);
    (env as any).chatStoragePath = originalPath;
  });
});
