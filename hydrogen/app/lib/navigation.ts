import type {CategoryNavConfig} from '~/config/navigation';

interface Category {
  id: string;
  title: string;
  handle: string;
  priority?: number | null;
}

/**
 * Sorts collections for header navigation display.
 *
 * Collections with a `custom.menu_priority_order` metafield appear first,
 * sorted ascending by priority value (1 appears first).
 * Remaining collections follow, sorted alphabetically by title.
 *
 * Additional filtering:
 * - Collections in `config.excluded` are removed
 * - Result is truncated to `config.maxVisible` (0 = unlimited)
 */
export function prioritizeCategories<T extends Category>(
  collections: T[],
  config: CategoryNavConfig,
): T[] {
  const excludedSet = new Set(config.excluded);

  const available = collections.filter((c) => !excludedSet.has(c.handle));

  // Split into prioritized (have metafield) and unprioritized
  const withPriority: T[] = [];
  const withoutPriority: T[] = [];

  for (const c of available) {
    if (c.priority != null && !isNaN(c.priority)) {
      withPriority.push(c);
    } else {
      withoutPriority.push(c);
    }
  }

  // Prioritized first (ascending), then remaining alphabetically
  withPriority.sort((a, b) => a.priority! - b.priority!);
  withoutPriority.sort((a, b) => a.title.localeCompare(b.title));

  const sorted = [...withPriority, ...withoutPriority];

  if (config.maxVisible > 0) {
    sorted.splice(config.maxVisible);
  }

  // Append pinned handles not already present
  if (config.pinned?.length) {
    const existingHandles = new Set(sorted.map((c) => c.handle));
    for (const p of config.pinned) {
      if (!existingHandles.has(p.handle)) {
        sorted.push({id: p.handle, title: p.title, handle: p.handle} as T);
      }
    }
  }

  return sorted;
}
