import { defineConfig } from 'vite';

const port = 4000;

export default defineConfig({
  server: {
    proxy: {
      '/api': `http://localhost:${ port }`,
      '/ws': {
        target: `ws://localhost:${ port }`,
        ws: true,
      },
    },
  },
});
