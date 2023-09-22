import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react()],
    envDir: '../',
    server: {
      host: true,
      port: 3000,
      cors: true,
      proxy: {
        '/upload': {
          target: 'https://moobook-geek-final-server-2-tulouizjtq-an.a.run.app',
          changeOrigin: false,
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
