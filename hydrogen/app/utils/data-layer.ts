// Error Isolation -broken push must never surface to the user
import type { DataLayerPush, DataLayerItem, EcommerceReset } from '~/types/data-layer';

// ─── Window augmentation ─────────────────────────────────────────────────────

declare global {
    interface Window {
        dataLayer: DataLayerPush[];
    }
}

// ─── Core push ───────────────────────────────────────────────────────────────

/**
 * Type-safe dataLayer push. Silently no-ops in two cases:
 *   1. SSR (window is undefined)
 *   2. Any runtime error — analytics must never crash the application
 */
export function pushDataLayer(payload: DataLayerPush): void {
    if (typeof window === 'undefined') return;

    try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);
    } catch (err) {
        // Log to your error monitoring (Sentry, etc.) but do not rethrow
        if (process.env.NODE_ENV !== 'production') {
            console.error('[DataLayer] Push failed:', err, payload);
        }
    }
}

/**
 * Ecommerce event push. Always clears the previous ecommerce object first.
 * GTM merges dataLayer objects — without the reset, stale item data from
 * a previous event bleeds into the current one.
 */
export function pushEcommerceEvent(
    payload: Exclude<DataLayerPush, EcommerceReset>
): void {
    pushDataLayer({ ecommerce: null });
    pushDataLayer(payload);
}

// ─── Item builder ────────────────────────────────────────────────────────────

interface MinimalProduct {
    id: string;
    title: string;
    vendor: string;
    productType: string;
}

interface MinimalVariant {
    id: string;
    sku: string | null;
    title: string;
    price: { amount: string; currencyCode: string };
}

/**
 * Strips Shopify GIDs and maps product/variant fields to the GA4 item schema.
 * Pass `overrides` for list context (index, item_list_name) or line-level fields.
 */
export function buildDataLayerItem(
    product: MinimalProduct,
    variant: MinimalVariant,
    overrides: Partial<DataLayerItem> = {}
): DataLayerItem {
    return {
        item_id: variant.sku || stripGid(variant.id),
        item_name: product.title,
        item_brand: product.vendor,
        item_category: product.productType,
        item_variant: variant.title,
        price: parseFloat(variant.price.amount),
        quantity: 1,
        affiliation: product.vendor,
        ...overrides,
    };
}

// ─── PII hashing ─────────────────────────────────────────────────────────────

/**
 * SHA-256 hashes a PII string for Enhanced Conversions.
 * Normalises whitespace and casing before hashing.
 * Returns null if the input is empty or hashing is unavailable.
 */
export async function hashPii(raw: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    if (!window.crypto?.subtle) return null;

    const normalised = raw.trim().toLowerCase();
    if (!normalised) return null;

    try {
        const encoded = new TextEncoder().encode(normalised);
        const buffer = await window.crypto.subtle.digest('SHA-256', encoded);
        const byteArr = Array.from(new Uint8Array(buffer));
        return byteArr.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        return null;
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripGid(gid: string): string {
    return gid.split('/').pop() ?? gid;
}