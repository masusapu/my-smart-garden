import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const readJsonBody = (request) =>
  new Promise((resolveBody, rejectBody) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        rejectBody(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch (error) {
        rejectBody(new Error("Invalid JSON body."));
      }
    });
  });

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
};

const askGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return { statusCode: 500, payload: { error: "Gemini API key is not configured." } };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      payload: { error: data?.error?.message || "Unable to call Gemini." },
    };
  }

  return {
    statusCode: 200,
    payload: { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "" },
  };
};

const handleGeminiRequest = async (request, response) => {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const { prompt } = await readJsonBody(request);
    if (!prompt || typeof prompt !== "string") {
      sendJson(response, 400, { error: "Prompt is required." });
      return;
    }

    const result = await askGemini(prompt);
    sendJson(response, result.statusCode, result.payload);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
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
    handleGeminiRequest(request, response);
    return;
  }

  serveStaticFile(request, response);
}).listen(port, host, () => {
  console.log(`Smart Garden server is running at http://${host}:${port}`);
});
