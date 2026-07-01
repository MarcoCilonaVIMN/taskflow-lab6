import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy verso l'API: il frontend chiama /api/... e Vite inoltra a :3000
    proxy: { "/api": "http://localhost:3000" },
  },
});
