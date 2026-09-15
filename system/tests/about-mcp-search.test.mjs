import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { fileURLToPath } from "node:url";

const port = 18082;
const cli = fileURLToPath(new URL("../../node_modules/@panaversity/ksor/dist/cli.mjs", import.meta.url));

function startServer() {
  const child = spawn(process.execPath, [cli, "serve", "--instance", "instance.md"], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    env: { ...process.env, KSOR_MCP_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("KSoR MCP did not start within 90 seconds")), 90_000);
    const onOutput = (chunk) => {
      output += chunk;
      if (output.includes(`http://127.0.0.1:${port}/mcp`)) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on("data", onOutput);
    child.stderr.on("data", onOutput);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`KSoR MCP exited before readiness (code ${code})`));
    });
    child.once("error", reject);
  });
  return { child, ready };
}

function sseResult(text) {
  const line = text.split("\n").find((value) => value.startsWith("data: "));
  assert.ok(line, "MCP response must include an SSE data event");
  return JSON.parse(line.slice("data: ".length));
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGKILL");
  await Promise.race([
    exited,
    new Promise((_, reject) => setTimeout(() => reject(new Error("KSoR MCP did not stop within 10 seconds")), 10_000)),
  ]);
}

test("MCP search returns the governed About document and stable ID", { timeout: 120_000 }, async () => {
  const { child, ready } = startServer();
  try {
    await ready;
    const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        "mcp-protocol-version": "2025-11-25",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "search",
          arguments: { query: "About This KSoR Handbook Azmat Ali", k: 5 },
        },
      }),
    });
    assert.equal(response.status, 200);
    const result = sseResult(await response.text());
    const payload = result.result.structuredContent;
    assert.equal(payload.ok, true);
    assert.ok(payload.hits.some((hit) => hit.provenance.stable_id === "knowledge/about-ksor-handbook"));
  } finally {
    await stopServer(child);
  }
});
