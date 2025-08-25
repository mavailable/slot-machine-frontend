import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4173,
    // Allow all hosts (including random trycloudflare.com subdomains)
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    // Allow all hosts (including random trycloudflare.com subdomains)
    allowedHosts: true
  }
})
