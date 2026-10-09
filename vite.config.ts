import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { historyApiFallback: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          pdf: ['jspdf', 'html2canvas'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})
