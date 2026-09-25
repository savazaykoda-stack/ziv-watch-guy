import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ziv-watch-guy/" : "/",
  server: {
    port: 5173,
    host: true,
  },
}));
