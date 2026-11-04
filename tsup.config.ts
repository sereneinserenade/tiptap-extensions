import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2020',
})
