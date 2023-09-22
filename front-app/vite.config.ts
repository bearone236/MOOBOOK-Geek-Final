import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default () => {
  const apiUrl = process.env.VITE_API_URL;

  return defineConfig({
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      cors: true,
      proxy: {
        '/upload': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        external: ['prop-types'],
      },
    },
  });
};
