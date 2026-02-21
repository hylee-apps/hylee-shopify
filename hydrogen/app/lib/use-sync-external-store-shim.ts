// React 18 ships useSyncExternalStore natively.
// This shim redirects use-sync-external-store/shim imports (used by Radix UI)
// to the native React 18 implementation, avoiding the CJS/ESM issue in Vite SSR.
export {useSyncExternalStore} from 'react';
