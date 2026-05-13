import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { handleGeminiRequest } from "./geminiApi.js";

const geminiApiPlugin = (mode) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.GEMINI_API_KEY;

  return {
    name: "gemini-api",
    configureServer(server) {
      server.middlewares.use("/api/gemini", async (request, response) => {
        handleGeminiRequest(request, response, apiKey);
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), geminiApiPlugin(mode)],
}));
