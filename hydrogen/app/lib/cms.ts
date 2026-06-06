/**
 * Shopify Admin as CMS — global config via Shop metafields.
 *
 * All metafields live under namespace "custom" on the Shop resource.
 * They are queryable via the Storefront API once Storefront API access is
 * enabled per-definition.
 *
 * HOW TO ADD A NEW FIELD
 * ─────────────────────
 * 1. Add the metafield alias to GLOBAL_CMS_QUERY (alias matches the key below)
 * 2. Add a typed key to GlobalCmsConfig
 * 3. Add its default to DEFAULT_CMS_CONFIG
 * 4. Parse it in parseGlobalCms
 * 5. In Shopify Admin:
 *    - Create definition: Settings → Metafields and metaobjects →
 *      Metafield definitions → Shop → Add definition
 *    - Enable Storefront API access on the definition
 *    - Set value: Settings → General → Store Assets → Metafields
 *
 * METAFIELD DEFINITIONS (create these in Admin)
 * ──────────────────────────────────────────────
 * Namespace: custom
 *
 * | Key                           | Type               | Purpose                              |
 * |-------------------------------|--------------------|--------------------------------------|
 * | announcement_bar              | Single line text   | Header banner text; null=hidden      |
 * | promo_tier_enabled            | True or false      | Show/hide promo tier bar             |
 * | og_image_url                  | Single line text   | Default OG social share image        |
 * | homepage_description          | Single line text   | Default homepage description         |
 * | homepage_title                | Single line text   | Default homepage title               |
 * | social_media_facebook         | URL                | Facebook profile URL                 |
 * | social_media_instagram        | URL                | Instagram profile URL                |
 * | social_media_pinterest        | URL                | Pinterest profile URL                |
 * | google_container_id           | Single line text   | GTM container ID (e.g. GTM-XXXXXXX)  |
 * | shopify_inbox_widget_script_url | URL              | Inbox widget CDN URL fallback        |
 * | shopify_inbox_shop_id         | Single line text   | Inbox data-shop-id attribute value   |
 *
 * HOW TO SET VALUES
 * ─────────────────
 * Admin → Settings → General → Store Assets → Metafields
 * Changes take effect on the next request (no deploy needed).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GlobalCmsConfig {
  /** Whether the promo tier sticky banner is visible. Default: false (off until enabled in Admin). */
  promoTierEnabled: boolean;
  /** Default OG image URL for pages that don't specify their own. */
  ogImageUrl: string | null;
  /** Default homepage description for pages that don't specify their own. */
  homepage_description: string | null;
  /** Default homepage title for pages that don't specify their own. */
  homepage_title: string | null;
  /** Social media profile URLs — null falls back to the hardcoded icon link. */
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialPinterest: string | null;
  /** GTM container ID (e.g. "GTM-T925VVHC"). null = metafield not configured, GTM will not load. */
  gtmContainerId: string | null;
  /** Shopify Inbox widget CDN URL. Used as fallback when Admin API script_tags lookup fails. */
  shopifyInboxWidgetScriptUrl: string | null;
  /** Inbox widget data-shop-id attribute. Visible in the Liquid <script> tag Shopify injects. */
  shopifyInboxShopId: string | null;
}

const DEFAULT_CMS_CONFIG: GlobalCmsConfig = {
  promoTierEnabled: false,
  ogImageUrl: null,
  homepage_description: null,
  homepage_title: null,
  socialFacebook: null,
  socialInstagram: null,
  socialPinterest: null,
  gtmContainerId: null,
  shopifyInboxWidgetScriptUrl: null,
  shopifyInboxShopId: null,
};

// ─── GraphQL Query ────────────────────────────────────────────────────────────

export const GLOBAL_CMS_QUERY = `#graphql
  query GlobalCms {
    shop {
      promoTierEnabled: metafield(namespace: "custom", key: "promo_tier_enabled") {
        value
      }
      ogImageUrl: metafield(namespace: "custom", key: "og_image_url") {
        value
      }
      homepageDescription: metafield(namespace: "custom", key: "homepage_description") {
        value
      }
      homepageTitle: metafield(namespace: "custom", key: "homepage_title") {
        value
      }
      socialFacebook: metafield(namespace: "custom", key: "social_media_facebook") {
        value
      }
      socialInstagram: metafield(namespace: "custom", key: "social_media_instagram") {
        value
      }
      socialPinterest: metafield(namespace: "custom", key: "social_media_pinterest") {
        value
      }
      gtmContainerId: metafield(namespace: "custom", key: "google_container_id") {
        value
      }
      shopifyInboxWidgetScriptUrl: metafield(namespace: "custom", key: "shopify_inbox_widget_script_url") {
        value
      }
      shopifyInboxShopId: metafield(namespace: "custom", key: "shopify_inbox_shop_id") {
        value
      }
    }
  }
` as const;

// ─── Parser ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseGlobalCms(
  data: any,
  env?: {[key: string]: string | undefined},
): GlobalCmsConfig {
  const shop = data?.shop ?? {};
  return {
    // Local .env overrides take precedence over Shopify metafields.
    // Set PROMO_TIER_ENABLED=true in .env to force-enable locally.
    promoTierEnabled:
      env?.PROMO_TIER_ENABLED !== undefined
        ? env.PROMO_TIER_ENABLED === 'true'
        : shop.promoTierEnabled?.value === 'true',
    ogImageUrl: shop.ogImageUrl?.value ?? DEFAULT_CMS_CONFIG.ogImageUrl,
    homepage_description:
      shop.homepageDescription?.value ??
      DEFAULT_CMS_CONFIG.homepage_description,
    homepage_title:
      shop.homepageTitle?.value ?? DEFAULT_CMS_CONFIG.homepage_title,
    socialFacebook:
      shop.socialFacebook?.value ?? DEFAULT_CMS_CONFIG.socialFacebook,
    socialInstagram:
      shop.socialInstagram?.value ?? DEFAULT_CMS_CONFIG.socialInstagram,
    socialPinterest:
      shop.socialPinterest?.value ?? DEFAULT_CMS_CONFIG.socialPinterest,
    gtmContainerId: shop.gtmContainerId?.value || null,
    shopifyInboxWidgetScriptUrl:
      shop.shopifyInboxWidgetScriptUrl?.value ??
      DEFAULT_CMS_CONFIG.shopifyInboxWidgetScriptUrl,
    shopifyInboxShopId:
      shop.shopifyInboxShopId?.value ?? DEFAULT_CMS_CONFIG.shopifyInboxShopId,
  };
}
