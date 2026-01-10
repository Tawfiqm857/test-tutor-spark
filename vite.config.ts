import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load from .env files AND fall back to host-provided environment variables.
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  
  // Fallback values for Lovable Cloud Supabase project
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || "https://mkzcdvcqzimjkqlwljhv.supabase.co";
  const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1remNkdmNxemltamtxbHdsamh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjQzOTcsImV4cCI6MjA4MzUwMDM5N30.WN4uLeazNq0c7JfR9fwXbIjUwv899H2WTSrJWKdrgKE";
  const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || fileEnv.VITE_SUPABASE_PROJECT_ID || "mkzcdvcqzimjkqlwljhv";

  return {
    base: "/studylane-dashboard/",
    server: {
      host: "::",
      port: 8080,
    },
    // Make sure these are always defined at build-time.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

