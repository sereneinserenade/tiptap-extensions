import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  resolve: {
    alias: { '@sereneinserenade/tiptap-extensions': fileURLToPath(new URL('../src', import.meta.url)) },
  },
})
