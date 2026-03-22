/**
 * Category navigation configuration.
 *
 * Collections are displayed in the header navigation only if they have
 * a `custom.menu_priority_order` metafield set in Shopify Admin.
 * They are sorted ascending by that value (1 appears first).
 *
 * This config provides additional filtering on top of the metafield.
 */

export interface CategoryNavConfig {
  /** Collection handles that should never appear in navigation */
  excluded: string[];
  /** Max categories to display. 0 = unlimited */
  maxVisible: number;
}

export const categoryNavConfig: CategoryNavConfig = {
  excluded: [
    // Collection handles to hide from navigation.
    // e.g. 'hidden-collection', 'test-products'
  ],
  maxVisible: 7,
};
