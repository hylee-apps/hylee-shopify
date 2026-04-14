import type {InitOptions} from 'i18next';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';

export const resources = {
  en: {common: en},
  es: {common: es},
  fr: {common: fr},
} as const;

export const i18nConfig: InitOptions = {
  supportedLngs: ['en', 'es', 'fr'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {escapeValue: false},
};
