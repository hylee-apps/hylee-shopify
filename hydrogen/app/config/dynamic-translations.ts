/**
 * Dynamic content translations — single source of truth.
 *
 * Use this file to translate any Shopify content (collection titles, product
 * types, tags, etc.) that cannot be translated via Shopify's own translation
 * system (@inContext) because the store doesn't have translations configured.
 *
 * HOW TO ADD A NEW TRANSLATION
 * ─────────────────────────────
 * 1. Find the Shopify handle for the content (e.g. "Kitchen & Dining" → "kitchen-dining").
 *    Shopify handles are lowercase with hyphens; special characters become hyphens.
 * 2. Add a single entry to the appropriate section below with all three locales.
 * 3. Done — no other file needs to change.
 *
 * PRODUCTION NOTE
 * ───────────────
 * For a live multilingual store, configure translations in Shopify Admin via
 * "Translate & Adapt". Once Shopify has translations, @inContext(language: ...)
 * returns them automatically and entries here become redundant (but harmless).
 */

export type SupportedLocale = 'en' | 'es' | 'fr';

export type TranslationEntry = Record<SupportedLocale, string>;

export interface DynamicTranslations {
  /**
   * Header nav category translations.
   * Key: Shopify collection handle.
   */
  categories: Record<string, TranslationEntry>;
}

export const dynamicTranslations: DynamicTranslations = {
  categories: {
    // ── Seasonal ─────────────────────────────────────────────────────────────
    seasonal: {en: 'Seasonal', es: 'Temporada', fr: 'Saisonnier'},

    // ── Home & Living ────────────────────────────────────────────────────────
    furniture: {en: 'Furniture', es: 'Muebles', fr: 'Mobilier'},
    bedroom: {en: 'Bedroom', es: 'Dormitorio', fr: 'Chambre'},
    'living-room': {en: 'Living Room', es: 'Sala de Estar', fr: 'Salon'},
    'accent-tables': {
      en: 'Accent Tables',
      es: 'Mesas de Acento',
      fr: "Tables d'Appoint",
    },
    'beds-accessories': {
      en: 'Beds & Accessories',
      es: 'Camas y Accesorios',
      fr: 'Lits & Accessoires',
    },
    'home-garden': {
      en: 'Home & Garden',
      es: 'Hogar y Jardín',
      fr: 'Maison & Jardin',
    },
    'outdoor-garden': {
      en: 'Outdoor & Garden',
      es: 'Exterior y Jardín',
      fr: 'Extérieur & Jardin',
    },

    // ── Kitchen ──────────────────────────────────────────────────────────────
    'kitchen-dining': {
      en: 'Kitchen & Dining',
      es: 'Cocina y Comedor',
      fr: 'Cuisine & Salle à Manger',
    },

    // ── Appliances ───────────────────────────────────────────────────────────
    appliances: {
      en: 'Appliances',
      es: 'Electrodomésticos',
      fr: 'Électroménager',
    },
    'home-appliances': {
      en: 'Home Appliances',
      es: 'Electrodomésticos del Hogar',
      fr: 'Électroménager Maison',
    },
    'household-appliances': {
      en: 'Household Appliances',
      es: 'Electrodomésticos del Hogar',
      fr: 'Appareils Ménagers',
    },
    'air-fryers': {
      en: 'Air Fryers',
      es: 'Freidoras de Aire',
      fr: 'Friteuses à Air',
    },

    // ── Electronics ──────────────────────────────────────────────────────────
    electronics: {en: 'Electronics', es: 'Electrónica', fr: 'Électronique'},
    'bridges-routers': {
      en: 'Bridges & Routers',
      es: 'Puentes y Routers',
      fr: 'Ponts & Routeurs',
    },
  },
};
