import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        // Redirect use-sync-external-store/shim (used by Radix UI) to a local
        // ESM wrapper around React 18's native useSyncExternalStore, avoiding
        // the CJS/ESM mismatch in Vite 6's SSR module runner.
        find: /^use-sync-external-store\/shim$/,
        replacement: fileURLToPath(
          new URL('./app/lib/use-sync-external-store-shim.ts', import.meta.url),
        ),
      },
    ],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      include: ['style-to-js', 'react-router'],
    },
    noExternal: [/^@radix-ui\//, 'radix-ui', 'set-cookie-parser', 'cookie'],
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
