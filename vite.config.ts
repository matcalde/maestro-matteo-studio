import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  optimizeDeps: {
    exclude: ["@mlc-ai/web-llm"],
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 2000,
  },
});
