import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const TARGET = new URL("../../node_modules/@panaversity/ksor/dist/cli.mjs", import.meta.url);
const ANCHOR = '\tapp.get("/live", (c) => c.json({ live: true }));';
const RESOURCE_METADATA_ANCHOR = 'const resourceMetadataUrl = auth.mode === "public" ? new URL("/.well-known/oauth-protected-resource/mcp", auth.config.resourceUrl).toString() : "";';
const RESOURCE_ROUTE_ANCHOR = `\tapp.get("/.well-known/oauth-protected-resource/mcp", (c) => auth.mode === "public" ? c.json({
\t\tresource: auth.config.resourceUrl,
\t\tauthorization_servers: [auth.config.ssoUrl]
\t}) : c.json({ error: "no public auth door configured" }, 404));`;
const SENTINEL = "ksor-chatgpt-oauth-cors-v2";
const V1_SENTINEL = "ksor-chatgpt-cors";

const V1_CORS_MIDDLEWARE = `
\t// ksor-chatgpt-cors: ChatGPT Work uses the browser-based Streamable HTTP flow.
\t// Limit CORS to its public origin; bearer authentication remains unchanged.
\tapp.use("/mcp", async (c, next) => {
\t\tif (c.req.header("origin") !== "https://chatgpt.com") {
\t\t\tawait next();
\t\t\treturn;
\t\t}
\t\tconst headers = {
\t\t\t"access-control-allow-origin": "https://chatgpt.com",
\t\t\t"access-control-allow-methods": "POST, OPTIONS",
\t\t\t"access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version",
\t\t\t"access-control-expose-headers": "WWW-Authenticate, Mcp-Session-Id",
\t\t\t"vary": "Origin"
\t\t};
\t\tif (c.req.method === "OPTIONS") return new Response(null, { status: 204, headers });
\t\tawait next();
\t\tfor (const [name, value] of Object.entries(headers)) c.res.headers.set(name, value);
\t});
`;

const CORS_MIDDLEWARE = `
\t// ksor-chatgpt-oauth-cors-v2: browser Streamable HTTP and OAuth resource discovery.
\tapp.use("/mcp", async (c, next) => {
\t\tif (c.req.header("origin") !== "https://chatgpt.com") {
\t\t\tawait next();
\t\t\treturn;
\t\t}
\t\tconst headers = {
\t\t\t"access-control-allow-origin": "https://chatgpt.com",
\t\t\t"access-control-allow-methods": "POST, OPTIONS",
\t\t\t"access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version",
\t\t\t"access-control-expose-headers": "WWW-Authenticate, Mcp-Session-Id",
\t\t\t"vary": "Origin"
\t\t};
\t\tif (c.req.method === "OPTIONS") return new Response(null, { status: 204, headers });
\t\tawait next();
\t\tfor (const [name, value] of Object.entries(headers)) c.res.headers.set(name, value);
\t});
`;

const RESOURCE_ROUTES = `
\tconst protectedResourceMetadata = () => ({
\t\tresource: auth.config.resourceUrl,
\t\tauthorization_servers: [auth.config.issuer ?? auth.config.ssoUrl]
\t});
\tapp.get("/.well-known/oauth-protected-resource", (c) => auth.mode === "public" ? c.json(protectedResourceMetadata()) : c.json({ error: "no public auth door configured" }, 404));
\tapp.get("/.well-known/oauth-protected-resource/mcp", (c) => auth.mode === "public" ? c.json(protectedResourceMetadata()) : c.json({ error: "no public auth door configured" }, 404));`;

export function patchKsorCors(source) {
  if (source.includes(SENTINEL)) return source;
  if (!source.includes(ANCHOR) || !source.includes(RESOURCE_METADATA_ANCHOR) || !source.includes(RESOURCE_ROUTE_ANCHOR)) {
    throw new Error("KSoR 0.0.60 HTTP anchor not found; refusing to patch an unknown server version.");
  }
  const unpatched = source.includes(V1_SENTINEL) ? source.replace(V1_CORS_MIDDLEWARE, "") : source;
  return unpatched
    .replace(RESOURCE_METADATA_ANCHOR, 'const resourceMetadataUrl = auth.mode === "public" ? new URL("/.well-known/oauth-protected-resource", auth.config.resourceUrl).toString() : "";')
    .replace(RESOURCE_ROUTE_ANCHOR, RESOURCE_ROUTES)
    .replace(ANCHOR, `${CORS_MIDDLEWARE}\n${ANCHOR}`);
}

export async function applyKsorCors(target = TARGET) {
  const source = await readFile(target, "utf8");
  const patched = patchKsorCors(source);
  if (patched !== source) await writeFile(target, patched);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await applyKsorCors();
