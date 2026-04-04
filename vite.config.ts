import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Bind explicitly so http://localhost:8080 and http://127.0.0.1:8080 both work reliably.
    // (host "::" can fail in some environments when Node enumerates interfaces.)
    host: "127.0.0.1",
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
