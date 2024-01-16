// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/rockets-index",
  root: resolve(__dirname, 'src'),
  build: {
    outDir: resolve(__dirname, 'docs'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      }
    }
  }
})
