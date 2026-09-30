import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { validatePublicEnv } from "./src/lib/validate-public-env";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  if (command === "build") {
    validatePublicEnv(loadEnv(mode, process.cwd(), "VITE_"));
  }
  return {
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
  };
});
