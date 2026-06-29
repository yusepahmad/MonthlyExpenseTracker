import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vercel's Supabase integration injects env vars prefixed SUPABASE_
  // (no VITE_ prefix), while local dev uses the standard VITE_ prefix.
  // Support both so the same code works in both environments.
  envPrefix: ["VITE_", "SUPABASE_"],
});
