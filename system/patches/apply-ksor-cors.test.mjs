import assert from "node:assert/strict";
import test from "node:test";

import { patchKsorCors } from "./apply-ksor-cors.mjs";

test("adds the ChatGPT-only Streamable HTTP CORS preflight and response headers", () => {
  const patched = patchKsorCors('\tapp.get("/live", (c) => c.json({ live: true }));');

  assert.match(patched, /app\.use\("\/mcp"/);
  assert.match(patched, /c\.req\.method === "OPTIONS"\) return new Response\(null, \{ status: 204, headers \}\)/);
  assert.match(patched, /"access-control-allow-origin": "https:\/\/chatgpt\.com"/);
  assert.match(patched, /"access-control-allow-methods": "POST, OPTIONS"/);
  assert.match(patched, /Authorization, Content-Type, Accept, MCP-Protocol-Version/);
  assert.match(patched, /WWW-Authenticate, Mcp-Session-Id/);
});

test("is idempotent", () => {
  const once = patchKsorCors('\tapp.get("/live", (c) => c.json({ live: true }));');
  assert.equal(patchKsorCors(once), once);
});

test("refuses an unknown KSoR server layout", () => {
  assert.throws(() => patchKsorCors("unknown"), /HTTP anchor not found/);
});
