/**
 * Shared breadcrumb helpers
 *
 * Supports two strategies for building breadcrumb paths:
 *
 * Strategy A — Collection metafields (preferred)
 *   Each collection has a `custom.parent_collection` metafield (type: Collection
 *   reference) pointing to its parent. The chain is fetched inline via GraphQL
 *   using PARENT_CHAIN_FRAGMENT and walked by buildPathFromParentMetafields().
 *
 *   Setup: Shopify Admin → Settings → Custom Data → Collections → Add definition:
 *     namespace: custom, key: parent_node, type: Collection reference
 *   Then set the metafield on each collection (e.g. Air Fryers → Kitchen Appliance).
 *
 * Strategy B — Nav menu (fallback)
 *   Walk the Shopify navigation menu recursively looking for the collection handle.
 *   Only works if the navigation is set up with the full collection hierarchy.
 *
 * Both strategies return Array<{title, url}> ordered from L1 to the current page.
 *
 * Example path: [Home & Garden, Kitchen & Dining, Kitchen Appliance, Air Fryers]
 */

// ============================================================================
// Types — Collection metafield chain
// ============================================================================

/**
 * A Shopify Collection node with an optional `parent_collection` metafield
 * (namespace: "custom", key: "parent_collection", type: Collection reference).
 *
 * Supports up to 4 nesting levels (L4 → L3 → L2 → L1).
 */
export type CollectionRef = {
  handle: string;
  title: string;
  metafield?: {
    reference?: CollectionRef | null;
  } | null;
};

// ============================================================================
// GraphQL fragments — collection parent chain
// ============================================================================

/**
 * GraphQL named fragments for fetching a collection's full parent chain.
 *
 * Spread `...BcCollectionWithParents` on any Collection selection to include
 * handle, title, and up to 3 levels of `parent_collection` references.
 *
 * Include this string in the query via template literal interpolation:
 *   `...BcCollectionWithParents` in the Collection selection
 *   `${PARENT_CHAIN_FRAGMENT}` at the end of the query string
 */
export const PARENT_CHAIN_FRAGMENT = `#graphql
  fragment BcL1 on Collection {
    handle
    title
  }
  fragment BcL2 on Collection {
    handle
    title
    metafield(namespace: "custom", key: "parent_node") {
      reference { ...BcL1 }
    }
  }
  fragment BcL3 on Collection {
    handle
    title
    metafield(namespace: "custom", key: "parent_node") {
      reference { ...BcL2 }
    }
  }
  fragment BcCollectionWithParents on Collection {
    handle
    title
    metafield(namespace: "custom", key: "parent_node") {
      reference { ...BcL3 }
    }
  }
` as const;

// ============================================================================
// Helpers — Strategy A: collection metafields
// ============================================================================

/**
 * Build a breadcrumb path from a collection's `parent_collection` metafield chain.
 *
 * The metafield chain runs from MOST SPECIFIC upward:
 *   Air Fryers → Kitchen Appliance → Kitchen & Dining → Home & Garden
 *
 * Returns the path in breadcrumb order (LEAST to MOST specific):
 *   [Home & Garden, Kitchen & Dining, Kitchen Appliance, Air Fryers]
 *
 * Returns null when no `parent_collection` metafield is set (no chain exists).
 */
export function buildPathFromParentMetafields(
  collection: CollectionRef,
): Array<{title: string; url: string}> | null {
  if (!collection.metafield?.reference) return null;

  const ancestors: Array<{title: string; url: string}> = [];
  let parent: CollectionRef | null | undefined = collection.metafield.reference;

  while (parent) {
    ancestors.unshift({
      title: parent.title,
      url: `/collections/${parent.handle}`,
    });
    parent = parent.metafield?.reference ?? null;
  }

  // Append the current collection as the deepest (last) item
  ancestors.push({
    title: collection.title,
    url: `/collections/${collection.handle}`,
  });

  return ancestors;
}

/**
 * Given a list of collections (each potentially with `parent_collection` metafields),
 * returns the breadcrumb path for the collection with the longest parent chain.
 *
 * Use this on the PDP where a product may belong to several collections and you
 * want the most specific (deepest) breadcrumb trail.
 *
 * Returns null if no collection has a `parent_collection` metafield.
 */
export function findDeepestMetafieldPath(
  collections: CollectionRef[],
): Array<{title: string; url: string}> | null {
  let best: Array<{title: string; url: string}> | null = null;
  for (const col of collections) {
    const path = buildPathFromParentMetafields(col);
    if (path && (!best || path.length > best.length)) {
      best = path;
    }
  }
  return best;
}

// ============================================================================
// Types — nav menu
// ============================================================================

export type MenuNode = {
  title: string;
  url?: string | null;
  /** Custom tags set on the Shopify menu item (e.g. "isParentNode") */
  tags?: string[] | null;
  items?: MenuNode[] | null;
};

// ============================================================================
// Helpers — Strategy B: nav menu
// ============================================================================

/** Extract a collection handle from a Shopify menu URL (e.g. ".../collections/phones" → "phones"). */
export function collectionHandleFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/collections\/([^/?#]+)/);
  return match?.[1] ?? null;
}

/**
 * Returns true if this menu item is a "parent node":
 *  - it has children in the nav, OR
 *  - the merchant has added the custom tag "isParentNode" in Shopify's
 *    menu editor to explicitly mark it as a category heading.
 */
export function isParentNode(node: MenuNode): boolean {
  return (
    (node.items != null && node.items.length > 0) ||
    (node.tags?.includes('isParentNode') ?? false)
  );
}

/**
 * Given multiple collection handles, returns the nav path for whichever
 * collection sits deepest in the menu hierarchy.
 *
 * Use this on the PDP where a product may belong to several collections.
 * The deepest match produces the most complete breadcrumb trail.
 *
 * Returns null only if none of the handles appear in the menu at all.
 */
export function findDeepestNavPath(
  menu: {items?: MenuNode[] | null} | null | undefined,
  handles: string[],
): Array<{title: string; url: string}> | null {
  let best: Array<{title: string; url: string}> | null = null;
  for (const handle of handles) {
    const path = findNavPath(menu, handle);
    if (path && (!best || path.length > best.length)) {
      best = path;
    }
  }
  return best;
}

/**
 * Walk the nav menu and return the full ancestor path (as title+url pairs)
 * that leads to the given collection handle.
 *
 * Recursive — works at any menu depth without modification.
 * Returns null when the collection is not present in the menu at all.
 *
 * The returned array always ends with the node whose handle matches, so:
 *   - The last item is the "current" page (rendered as BreadcrumbPage)
 *   - All preceding items are parent nodes (rendered as BreadcrumbLink)
 *
 * Example: handle "air-fryers" in a 4-level nav returns:
 *   [Home & Garden, Kitchen & Dining, Kitchen Appliance, Air Fryers]
 */
export function findNavPath(
  menu: {items?: MenuNode[] | null} | null | undefined,
  handle: string,
): Array<{title: string; url: string}> | null {
  if (!menu?.items) return null;
  return walkItems(menu.items, handle, []);
}

/**
 * Recursive DFS over the menu item tree.
 * Builds the ancestor path incrementally and returns it as soon as the target
 * handle is found; returns null if this subtree doesn't contain the handle.
 */
function walkItems(
  items: MenuNode[],
  handle: string,
  ancestors: Array<{title: string; url: string}>,
): Array<{title: string; url: string}> | null {
  for (const item of items) {
    const itemHandle = collectionHandleFromUrl(item.url);
    const itemUrl = itemHandle
      ? `/collections/${itemHandle}`
      : (item.url ?? '#');

    const path = [...ancestors, {title: item.title, url: itemUrl}];

    if (itemHandle === handle) {
      return path;
    }

    if (item.items?.length) {
      const result = walkItems(item.items, handle, path);
      if (result) return result;
    }
  }
  return null;
}
