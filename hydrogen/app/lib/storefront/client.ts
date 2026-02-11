/**
 * Storefront API convenience helpers.
 *
 * The actual Storefront client is created in context.ts via createHydrogenContext().
 * This module re-exports query fragments and provides typed helpers
 * used across route loaders.
 */
export {CART_QUERY_FRAGMENT, HEADER_QUERY, FOOTER_QUERY} from '../fragments';
