import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: "/static/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ["host.docker.internal"], 
  },
  build: {
    manifest: "manifest.json",
    outDir: resolve("./assets"),

    // Clears output directory before fresh build
    emptyOutDir: true,
    assetsDir: "django-assets", 
    rollupOptions: {
      input: {
        crime_reporter: resolve('src/js/main/main.jsx')
      }
    }
  }, 
})