import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import {resources, i18nConfig} from '~/i18n';

// Initialize global i18next instance for client-side.
// The locale is synced at runtime via useChangeLanguage in root.tsx.
void i18next.use(initReactI18next).init({
  ...i18nConfig,
  lng: 'en',
  resources,
});

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    const existingNonce =
      document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
