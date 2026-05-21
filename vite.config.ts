import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: { overlay: false },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps vendor bundles cacheable
        manualChunks: {
          "react-vendor":  ["react", "react-dom", "react/jsx-runtime"],
          "router":        ["react-router-dom"],
          "query":         ["@tanstack/react-query"],
          "charts":        ["recharts"],
          "motion":        ["framer-motion"],
          "radix":         [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-scroll-area",
          ],
          "icons":         ["lucide-react"],
          "forms":         ["react-hook-form", "@hookform/resolvers", "zod"],
          "utils":         ["clsx", "tailwind-merge", "class-variance-authority", "date-fns"],
          "toast":         ["sonner"],
          "state":         ["zustand"],
        },
        // Deterministic chunk filenames for long-term caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Warn if any individual chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
  },
  // Pre-bundle these for faster dev starts
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
      "recharts",
      "zustand",
      "sonner",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
}));

