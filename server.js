import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handleGeminiRequest } from "./geminiApi.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(__dirname, "dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const loadEnvFile = () => {
  const envPath = join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;

    const [, key, rawValue = ""] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
};

const serveStaticFile = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const normalizedPath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distDir, normalizedPath === "/" ? "index.html" : normalizedPath);
  const safePath = filePath.startsWith(distDir) && existsSync(filePath) ? filePath : join(distDir, "index.html");
  const ext = extname(safePath);

  response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  response.end(readFileSync(safePath));
};

loadEnvFile();

createServer((request, response) => {
  if (request.url?.startsWith("/api/gemini")) {
    handleGeminiRequest(request, response, process.env.GEMINI_API_KEY);
    return;
  }

  serveStaticFile(request, response);
}).listen(port, host, () => {
  console.log(`Smart Garden server is running at http://${host}:${port}`);
});
