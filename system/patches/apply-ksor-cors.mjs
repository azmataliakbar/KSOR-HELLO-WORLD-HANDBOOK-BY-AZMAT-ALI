import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const TARGET = new URL("../../node_modules/@panaversity/ksor/dist/cli.mjs", import.meta.url);
const ANCHOR = '\tapp.get("/live", (c) => c.json({ live: true }));';
const SENTINEL = "ksor-chatgpt-cors";

const CORS_MIDDLEWARE = `
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

export function patchKsorCors(source) {
  if (source.includes(SENTINEL)) return source;
  if (!source.includes(ANCHOR)) {
    throw new Error("KSoR 0.0.60 HTTP anchor not found; refusing to patch an unknown server version.");
  }
  return source.replace(ANCHOR, `${CORS_MIDDLEWARE}\n${ANCHOR}`);
}

export async function applyKsorCors(target = TARGET) {
  const source = await readFile(target, "utf8");
  const patched = patchKsorCors(source);
  if (patched !== source) await writeFile(target, patched);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await applyKsorCors();
