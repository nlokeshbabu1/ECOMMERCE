import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['ecommerce'],
    host: '0.0.0.0',  // or your desired IP
    port: 3001        // or any custom port
  }
});
