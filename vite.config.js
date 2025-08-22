import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'competitors-example-consultant-tobacco.trycloudflare.com'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'competitors-example-consultant-tobacco.trycloudflare.com'
    ]
  }
})
