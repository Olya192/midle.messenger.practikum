import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'static',
    rollupOptions: {
      output: {
        entryFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`.toLowerCase();
        },
        chunkFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`.toLowerCase();
        },
        assetFileNames: (assetInfo) => {
          return `assets/[name]-[hash].[ext]`.toLowerCase();
        }
      }
    }
  },
})