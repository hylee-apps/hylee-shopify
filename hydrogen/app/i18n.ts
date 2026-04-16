import type {InitOptions} from 'i18next';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';
import {
  dynamicTranslations,
  type SupportedLocale,
} from './config/dynamic-translations';

// Build the nav.categoryTitles map for a given locale from the central config.
// This is the ONLY place category title translations need to be maintained.
function buildCategoryTitles(locale: SupportedLocale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(dynamicTranslations.categories).map(([handle, entry]) => [
      handle,
      entry[locale],
    ]),
  );
}

// Merge locale JSON with programmatically-built dynamic sections.
// The config takes precedence over anything in the JSON files.
function buildLocale(
  base: typeof en,
  locale: SupportedLocale,
): typeof en & {nav: {categoryTitles: Record<string, string>}} {
  return {
    ...base,
    nav: {
      ...base.nav,
      categoryTitles: buildCategoryTitles(locale),
    },
  };
}

export const resources = {
  en: {common: buildLocale(en, 'en')},
  es: {common: buildLocale(es, 'es')},
  fr: {common: buildLocale(fr, 'fr')},
};

export const i18nConfig: InitOptions = {
  supportedLngs: ['en', 'es', 'fr'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {escapeValue: false},
};
