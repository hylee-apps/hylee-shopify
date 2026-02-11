'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

interface PredictiveProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width: number;
    height: number;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface PredictiveCollection {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string | null;
    width: number;
    height: number;
  } | null;
}

interface PredictiveQuery {
  text: string;
  styledText: string;
}

interface PredictiveSearchResults {
  products: PredictiveProduct[];
  collections: PredictiveCollection[];
  queries: PredictiveQuery[];
}

export interface PredictiveSearchProps {
  /** Whether the search overlay is open */
  isOpen: boolean;
  /** Callback to close */
  onClose: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(money: {amount: string; currencyCode: string}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

// ============================================================================
// Component
// ============================================================================

/**
 * PredictiveSearch — Full-screen search overlay with instant results
 *
 * Uses a resource route (/api/predictive-search) to fetch results
 * as the user types, with debounced requests.
 */
export function PredictiveSearch({isOpen, onClose}: PredictiveSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<PredictiveSearchResults>();
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const results = fetcher.data;
  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.collections.length > 0 ||
      results.queries.length > 0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Debounced fetch
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      clearTimeout(debounceRef.current);

      if (value.length < 2) return;

      debounceRef.current = setTimeout(() => {
        fetcher.load(`/api/predictive-search?q=${encodeURIComponent(value)}`);
      }, 300);
    },
    [fetcher],
  );

  // Submit full search
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    },
    [query, navigate, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <form onSubmit={handleSubmit} className="relative flex-1">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search products, collections..."
              autoComplete="off"
              className="w-full rounded-md border border-border py-2.5 pl-10 pr-4 text-base text-dark placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-muted transition-colors hover:text-dark"
            aria-label="Close search"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {fetcher.state === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Icon
                name="loader"
                size={24}
                className="animate-spin text-text-muted"
              />
            </div>
          )}

          {query.length >= 2 && fetcher.state === 'idle' && !hasResults && (
            <div className="py-8 text-center">
              <Icon
                name="search"
                size={48}
                className="mx-auto mb-3 text-text-muted"
              />
              <p className="text-text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {hasResults && results && (
            <div className="space-y-8">
              {/* Suggested Queries */}
              {results.queries.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Suggestions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.queries.map((q) => (
                      <Link
                        key={q.text}
                        to={`/search?q=${encodeURIComponent(q.text)}`}
                        onClick={onClose}
                        className="rounded-full border border-border px-3 py-1.5 text-sm text-text transition-colors hover:border-primary hover:text-primary"
                      >
                        {q.text}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Products
                  </h3>
                  <div className="space-y-3">
                    {results.products.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                      >
                        {product.featuredImage ? (
                          <Image
                            data={product.featuredImage}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-md object-cover"
                            alt={product.featuredImage.altText || product.title}
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-surface">
                            <Icon
                              name="image"
                              size={24}
                              className="text-text-muted"
                            />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-dark">
                            {product.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {product.vendor}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-dark">
                          {formatMoney(product.priceRange.minVariantPrice)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View all results
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              )}

              {/* Collections */}
              {results.collections.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Collections
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.collections.map((collection) => (
                      <Link
                        key={collection.id}
                        to={`/collections/${collection.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text transition-colors hover:border-primary hover:text-primary"
                      >
                        <Icon name="grid" size={14} />
                        {collection.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {query.length < 2 && (
            <div className="py-8 text-center">
              <Icon
                name="search"
                size={48}
                className="mx-auto mb-3 text-text-muted"
              />
              <p className="text-text-muted">
                Start typing to search products and collections
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictiveSearch;
