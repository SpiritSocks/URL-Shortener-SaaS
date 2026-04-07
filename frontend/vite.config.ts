import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

function bioPageSpaFallback(): Plugin {
  return {
    name: 'bio-page-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '';

        if (
          url.startsWith('/@') &&
          !/^\/@(vite|fs|id|react-refresh|tailwind)(\/|$)/.test(url)
        ) {
          const queryIndex = url.indexOf('?');
          req.url = queryIndex === -1 ? '/' : '/' + url.slice(queryIndex);
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [bioPageSpaFallback(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/r': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
