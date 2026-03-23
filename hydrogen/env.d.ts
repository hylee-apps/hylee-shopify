/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    SEARCHANISE_API_KEY: string;
    ADMIN_APP_CLIENT_ID: string;
    ADMIN_APP_CLIENT_SECRET: string;
  }
}
