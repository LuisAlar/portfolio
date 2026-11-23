import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Public R2 bucket URL. Production proxies /photos/* to it via vercel.json; keep the two in sync.
const PHOTOS_ORIGIN = "https://pub-4270c7f8f7ce494bbf8c0e23e9b4a5a9.r2.dev";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/photos": { target: PHOTOS_ORIGIN, changeOrigin: true },
    },
  },
});
