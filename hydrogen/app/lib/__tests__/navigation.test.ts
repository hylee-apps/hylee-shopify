import {describe, it, expect} from 'vitest';
import {prioritizeCategories} from '../navigation';
import type {CategoryNavConfig} from '~/config/navigation';

function makeCategory(handle: string, title: string, priority?: number | null) {
  return {id: `gid://shopify/Collection/${handle}`, title, handle, priority};
}

const defaultConfig: CategoryNavConfig = {
  excluded: [],
  maxVisible: 0,
  pinned: [],
};

describe('prioritizeCategories', () => {
  it('places prioritized collections first, then remaining alphabetically', () => {
    const collections = [
      makeCategory('clothing', 'Clothing', null),
      makeCategory('electronics', 'Electronics', 2),
      makeCategory('home', 'Home & Garden', 1),
      makeCategory('accessories', 'Accessories', null),
    ];

    const result = prioritizeCategories(collections, defaultConfig);

    expect(result.map((c) => c.handle)).toEqual([
      'home', // priority 1
      'electronics', // priority 2
      'accessories', // alphabetical
      'clothing', // alphabetical
    ]);
  });

  it('sorts all alphabetically when none have priority', () => {
    const collections = [
      makeCategory('clothing', 'Clothing'),
      makeCategory('accessories', 'Accessories'),
      makeCategory('electronics', 'Electronics'),
    ];

    const result = prioritizeCategories(collections, defaultConfig);

    expect(result.map((c) => c.handle)).toEqual([
      'accessories',
      'clothing',
      'electronics',
    ]);
  });

  it('excludes collections in config.excluded', () => {
    const collections = [
      makeCategory('clothing', 'Clothing', 1),
      makeCategory('test-products', 'Test Products', 2),
      makeCategory('electronics', 'Electronics'),
    ];

    const config: CategoryNavConfig = {
      ...defaultConfig,
      excluded: ['test-products'],
    };

    const result = prioritizeCategories(collections, config);

    expect(result.map((c) => c.handle)).toEqual(['clothing', 'electronics']);
  });

  it('truncates to maxVisible', () => {
    const collections = [
      makeCategory('a', 'A', 1),
      makeCategory('b', 'B'),
      makeCategory('c', 'C'),
      makeCategory('d', 'D'),
      makeCategory('e', 'E'),
    ];

    const config: CategoryNavConfig = {
      ...defaultConfig,
      maxVisible: 3,
    };

    const result = prioritizeCategories(collections, config);

    expect(result).toHaveLength(3);
    expect(result.map((c) => c.handle)).toEqual(['a', 'b', 'c']);
  });

  it('treats maxVisible: 0 as unlimited', () => {
    const collections = Array.from({length: 25}, (_, i) =>
      makeCategory(`cat-${i}`, `Category ${i}`),
    );

    const result = prioritizeCategories(collections, defaultConfig);

    expect(result).toHaveLength(25);
  });

  it('returns empty array for empty input', () => {
    const result = prioritizeCategories([], defaultConfig);
    expect(result).toEqual([]);
  });

  it('combines exclusion, priority, and maxVisible', () => {
    const collections = [
      makeCategory('hidden', 'Hidden', 1), // excluded
      makeCategory('electronics', 'Electronics', 2),
      makeCategory('home', 'Home & Garden', 3),
      makeCategory('clothing', 'Clothing'),
      makeCategory('accessories', 'Accessories'),
      makeCategory('toys', 'Toys'),
    ];

    const config: CategoryNavConfig = {
      excluded: ['hidden'],
      maxVisible: 4,
      pinned: [],
    };

    const result = prioritizeCategories(collections, config);

    expect(result.map((c) => c.handle)).toEqual([
      'electronics', // priority 2
      'home', // priority 3
      'accessories', // alphabetical
      'clothing', // alphabetical (toys cut by maxVisible)
    ]);
  });
});
