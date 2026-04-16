import {useTranslation} from 'react-i18next';
import {
  dynamicTranslations,
  type SupportedLocale,
} from '~/config/dynamic-translations';

/**
 * useDynamicTranslation — translate any dynamic Shopify content.
 *
 * For content whose translation lives in `config/dynamic-translations.ts`
 * rather than in a static i18n key. Falls back to the Shopify-provided value
 * (e.g. the title returned by @inContext) when no override is configured.
 *
 * @param section - The section in dynamicTranslations (e.g. 'categories')
 * @param key     - The content identifier (e.g. Shopify collection handle)
 * @param fallback - The value to show when no translation is found
 *
 * @example
 * // Translate a collection title in a custom component
 * const title = useDynamicTranslation('categories', collection.handle, collection.title);
 */
export function useDynamicTranslation(
  section: keyof typeof dynamicTranslations,
  key: string,
  fallback: string,
): string {
  const {i18n} = useTranslation();
  const locale = (i18n.language ?? 'en') as SupportedLocale;
  const entry = dynamicTranslations[section][key];
  if (!entry) return fallback;
  return entry[locale] ?? entry.en ?? fallback;
}

/**
 * Convenience hook for nav category titles.
 *
 * @example
 * const label = useCategoryTitle(category.handle, category.title);
 */
export function useCategoryTitle(handle: string, fallback: string): string {
  return useDynamicTranslation('categories', handle, fallback);
}
