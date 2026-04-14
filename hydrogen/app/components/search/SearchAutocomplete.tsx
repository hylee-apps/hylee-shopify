'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Link, useNavigate} from 'react-router';
import {Search} from 'lucide-react';
import {PillInput} from '~/components/ui/pill-input';
import type {
  SearchaniseSuggestion,
  SearchaniseProduct,
} from '~/lib/searchanise';

// ============================================================================
// Types
// ============================================================================

interface AutocompleteResponse {
  suggestions: SearchaniseSuggestion[];
  products: SearchaniseProduct[];
}

interface SearchAutocompleteProps {
  /** Tailwind classes forwarded to the outer container */
  className?: string;
  /** Placeholder for the search input */
  placeholder?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ============================================================================
// SearchAutocomplete
// ============================================================================

export function SearchAutocomplete({
  className = '',
  placeholder,
}: SearchAutocompleteProps) {
  const {t} = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('search.placeholder');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AutocompleteResponse>({
    suggestions: [],
    products: [],
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch suggestions ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults({suggestions: [], products: []});
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    fetch(`/api/predictive-search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<AutocompleteResponse>)
      .then((data) => {
        setResults(data);
        setOpen(data.suggestions.length > 0 || data.products.length > 0);
        setActiveIndex(-1);
      })
      .catch((err: unknown) => {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (!isAbort) console.error('[SearchAutocomplete]', err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────────

  const totalItems = results.suggestions.length + results.products.length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
      } else if (e.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const suggestionCount = results.suggestions.length;
        if (activeIndex < suggestionCount) {
          const term = results.suggestions[activeIndex].value;
          navigate(`/search?q=${encodeURIComponent(term)}`);
        } else {
          const product = results.products[activeIndex - suggestionCount];
          navigate(`/products/${product.handle}`);
        }
        setOpen(false);
      }
    },
    [open, activeIndex, totalItems, results, navigate],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const hasSuggestions = results.suggestions.length > 0;
  const hasProducts = results.products.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Form action="/search" method="get" onSubmit={() => setOpen(false)}>
        <PillInput
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.suggestions.length > 0 || results.products.length > 0) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-autocomplete-list"
          data-testid="header-search-input"
          loading={loading}
          className="flex-1"
        />
      </Form>

      {/* Dropdown */}
      {open && (hasSuggestions || hasProducts) && (
        <div
          id="search-autocomplete-list"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-lg border border-border bg-white shadow-lg overflow-hidden"
          data-testid="search-autocomplete-dropdown"
        >
          {/* Query suggestions */}
          {hasSuggestions && (
            <div>
              <p className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Suggestions
              </p>
              <ul>
                {results.suggestions.map((s, i) => (
                  <li
                    key={s.value}
                    role="option"
                    aria-selected={activeIndex === i}
                  >
                    <Link
                      to={`/search?q=${encodeURIComponent(s.value)}`}
                      className={`flex items-center gap-2.5 px-3 py-2 text-[14px] text-dark hover:bg-surface transition-colors ${
                        activeIndex === i ? 'bg-surface' : ''
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <Search size={14} className="shrink-0 text-text-muted" />
                      <span>{s.value}</span>
                      {s.count > 0 && (
                        <span className="ml-auto text-[12px] text-text-muted">
                          {s.count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product previews */}
          {hasProducts && (
            <div className={hasSuggestions ? 'border-t border-border' : ''}>
              <p className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Products
              </p>
              <ul>
                {results.products.map((product, i) => {
                  const idx = results.suggestions.length + i;
                  return (
                    <li
                      key={product.product_id}
                      role="option"
                      aria-selected={activeIndex === idx}
                    >
                      <Link
                        to={`/products/${product.handle}`}
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-surface transition-colors ${
                          activeIndex === idx ? 'bg-surface' : ''
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {product.image_link ? (
                          <img
                            src={product.image_link}
                            alt={product.title}
                            className="h-10 w-10 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-surface shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-dark">
                            {product.title}
                          </p>
                          <p className="text-[12px] text-text-muted">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Footer link to full results */}
          <div className="border-t border-border px-3 py-2">
            <Link
              to={`/search?q=${encodeURIComponent(query)}`}
              className="text-[13px] font-medium text-secondary hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              See all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
