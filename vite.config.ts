import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load from .env files AND fall back to host-provided environment variables.
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  const get = (key: string) => (process.env[key] ?? fileEnv[key] ?? "") as string;

  return {
    base: "/studylane-dashboard/",
    server: {
      host: "::",
      port: 8080,
    },
    // Make sure these are always defined at build-time.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(get("VITE_SUPABASE_URL")),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(get("VITE_SUPABASE_PUBLISHABLE_KEY")),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(get("VITE_SUPABASE_PROJECT_ID")),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

