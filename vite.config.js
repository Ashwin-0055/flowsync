import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
    allowedHosts: [
      '472f95dfaeaa.ngrok-free.app',
      '.ngrok-free.app', // Allow any ngrok subdomain
      'localhost'
    ]
  }
})
