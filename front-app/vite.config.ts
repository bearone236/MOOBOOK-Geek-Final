import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react()],
    envDir: '../', // これを追加
    server: {
      host: true,
      port: 3000,
    },
    build: {
      rollupOptions: {
        external: ['prop-types'],
      },
    },
  });
};
