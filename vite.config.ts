import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import CommonJs from 'vite-plugin-commonjs';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    assetsDir: "code",
    rollupOptions: {
      // for production
      plugins: [nodePolyfills()],
    },
    target: ['chrome109', 'edge112', 'firefox102', 'safari15.6', 'ios15.6']
  },
  resolve: {
    alias: {
      // by node-globals-polyfill
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      }
    }
  },
  plugins: [
    CommonJs(),
    nodePolyfills(),
    NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
    NodeModulesPolyfillPlugin(),
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,json, png}',
        ],
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
