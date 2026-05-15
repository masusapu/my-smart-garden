import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { handleGeminiRequest } from "./src/server/geminiApi.js";

const geminiApiPlugin = (mode) => {
  const env = loadEnv(mode, process.cwd() + "/src/config", "");

  return {
    name: "gemini-api",
    configureServer(server) {
      server.middlewares.use("/api/gemini", async (request, response) => {
        handleGeminiRequest(request, response, {
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          GEMINI_RATE_LIMIT_MAX: env.GEMINI_RATE_LIMIT_MAX,
          GEMINI_RATE_LIMIT_WINDOW_MS: env.GEMINI_RATE_LIMIT_WINDOW_MS,
        });
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  envDir: "./src/config",
  plugins: [vue(), geminiApiPlugin(mode)],
}));
