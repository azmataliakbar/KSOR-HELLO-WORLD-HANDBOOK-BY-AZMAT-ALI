import assert from "node:assert/strict";
import test from "node:test";

import { patchKsorCors } from "./apply-ksor-cors.mjs";

const fixture = `const resourceMetadataUrl = auth.mode === "public" ? new URL("/.well-known/oauth-protected-resource/mcp", auth.config.resourceUrl).toString() : "";
\tapp.get("/.well-known/oauth-protected-resource/mcp", (c) => auth.mode === "public" ? c.json({
\t\tresource: auth.config.resourceUrl,
\t\tauthorization_servers: [auth.config.ssoUrl]
\t}) : c.json({ error: "no public auth door configured" }, 404));
\tapp.get("/live", (c) => c.json({ live: true }));`;

test("adds ChatGPT-only Streamable HTTP CORS preflight and response headers", () => {
  const patched = patchKsorCors(fixture);

  assert.match(patched, /app\.use\("\/mcp"/);
  assert.match(patched, /c\.req\.method === "OPTIONS"\) return new Response\(null, \{ status: 204, headers \}\)/);
  assert.match(patched, /"access-control-allow-origin": "https:\/\/chatgpt\.com"/);
  assert.match(patched, /"access-control-allow-methods": "POST, OPTIONS"/);
  assert.match(patched, /Authorization, Content-Type, Accept, MCP-Protocol-Version/);
  assert.match(patched, /WWW-Authenticate, Mcp-Session-Id/);
});

test("publishes root protected-resource metadata and advertises the configured issuer", () => {
  const patched = patchKsorCors(fixture);

  assert.match(patched, /oauth-protected-resource", auth\.config\.resourceUrl/);
  assert.match(patched, /app\.get\("\/.well-known\/oauth-protected-resource",/);
  assert.match(patched, /authorization_servers: \[auth\.config\.issuer \?\? auth\.config\.ssoUrl\]/);
  assert.match(patched, /oauth-protected-resource\/mcp/);
});

test("is idempotent", () => {
  const once = patchKsorCors(fixture);
  assert.equal(patchKsorCors(once), once);
});

test("refuses an unknown KSoR server layout", () => {
  assert.throws(() => patchKsorCors("unknown"), /HTTP anchor not found/);
});
