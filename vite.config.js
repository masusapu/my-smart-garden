import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

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
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const geminiApiPlugin = (mode) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.GEMINI_API_KEY;

  return {
    name: "gemini-api",
    configureServer(server) {
      server.middlewares.use("/api/gemini", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }

        if (!apiKey?.trim()) {
          sendJson(response, 500, { error: "Gemini API key is not configured." });
          return;
        }

        try {
          const { prompt } = await readJsonBody(request);
          if (!prompt || typeof prompt !== "string") {
            sendJson(response, 400, { error: "Prompt is required." });
            return;
          }

          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
          const geminiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
          const data = await geminiResponse.json();

          if (!geminiResponse.ok) {
            sendJson(response, geminiResponse.status, {
              error: data?.error?.message || "Unable to call Gemini.",
            });
            return;
          }

          sendJson(response, 200, {
            text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
          });
        } catch (error) {
          sendJson(response, 500, { error: error.message || "Server error." });
        }
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), geminiApiPlugin(mode)],
}));
