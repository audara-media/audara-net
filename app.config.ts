import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    resolve: {
      alias: {
        '~': resolve(import.meta.dirname, './src'),
      },
    },
  },
  server: {
    experimental: {
      websocket: true,
    },
  },
}).then((config) =>
  config.addRouter({
    name: "websocket",
    type: "http",
    handler: "./src/ws.tsx",
    target: "server",
    base: "/_ws",
  })
);
