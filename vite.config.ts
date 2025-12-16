import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Frontend calls: /api/reqres/login
      // Vite forwards to: https://reqres.in/api/login
      "/api/reqres": {
        target: "https://reqres.in",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/reqres/, ""),
      },
    },
  },
});
