import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // !!! REMOVED THE KEY INJECTION FROM 'define' !!!
    define: {
    // You may still need to define process.env.NODE_ENV for some libraries
    'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
