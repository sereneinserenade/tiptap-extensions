import { createMDX } from 'fumadocs-mdx/next';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  // GitHub Pages serves the site under /tiptap-extensions
  basePath: process.env.DOCS_BASE_PATH ?? '',
  // emit docs/index.html rather than docs.html next to a docs/ folder, which GitHub Pages can 404 on
  trailingSlash: true,
  reactStrictMode: true,
  // lets the tsconfig paths reach ../src, so demos run the source without a package build
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
};

export default withMDX(config);
