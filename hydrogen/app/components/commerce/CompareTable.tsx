'use client';

import {Link, useSearchParams} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {PriceDisplay} from './PriceDisplay';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface CompareProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  productType?: string | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  variants: {
    nodes: Array<{
      weight?: number | null;
      weightUnit?: string | null;
      price: {amount: string; currencyCode: string};
      compareAtPrice?: {amount: string; currencyCode: string} | null;
    }>;
  };
  dimensions?: {value: string} | null;
  material?: {value: string} | null;
  specifications?: {value: string} | null;
}

export interface CompareTableProps {
  products: CompareProduct[];
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CompareTable — migrated from theme/snippets/pdp-compare-similar.liquid
 *
 * Side-by-side product comparison table with desktop (horizontal scroll)
 * and mobile (stacked cards) layouts.
 */
export function CompareTable({products, className}: CompareTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const removeProduct = (productId: string) => {
    const compareParam = searchParams.get('compare') || '';
    const compareList = compareParam
      .split(',')
      .filter((id) => id !== productId);
    const newParams = new URLSearchParams(searchParams);
    if (compareList.length > 0) {
      newParams.set('compare', compareList.join(','));
    } else {
      newParams.delete('compare');
    }
    setSearchParams(newParams, {replace: true});
  };

  const rows = buildComparisonRows(products);

  return (
    <div className={className}>
      {/* Desktop: Horizontal scroll table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-150 border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-35 min-w-35 border-b border-r border-slate-200 bg-slate-50 p-4 text-left text-sm font-medium text-slate-600">
                  Product
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="border-b border-r border-slate-200 bg-white p-4 last:border-r-0"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="self-end rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Remove ${product.title} from comparison`}
                      >
                        <Icon name="x" size={16} />
                      </button>
                      <Link
                        to={`/products/${product.handle}`}
                        className="group text-center"
                      >
                        {product.featuredImage ? (
                          <Image
                            data={product.featuredImage}
                            sizes="150px"
                            className="mx-auto h-30 w-30 rounded-lg object-contain"
                          />
                        ) : (
                          <div className="mx-auto flex h-30 w-30 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                            <Icon name="image" size={32} />
                          </div>
                        )}
                        <span className="mt-2 block text-sm font-medium text-slate-900 group-hover:text-primary">
                          {product.title}
                        </span>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
                    {row.label}
                  </td>
                  {row.values.map((value, i) => (
                    <td
                      key={products[i].id}
                      className="border-b border-r border-slate-200 p-4 text-center text-sm text-slate-700 last:border-r-0"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Stacked cards */}
      <div className="space-y-4 lg:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-start gap-4 p-4">
              <Link to={`/products/${product.handle}`} className="shrink-0">
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    sizes="80px"
                    className="h-20 w-20 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                    <Icon name="image" size={24} />
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${product.handle}`}
                  className="text-sm font-medium text-slate-900 hover:text-primary"
                >
                  {product.title}
                </Link>
                <div className="mt-1">
                  <PriceDisplay
                    price={product.priceRange.minVariantPrice}
                    compareAtPrice={
                      product.compareAtPriceRange?.minVariantPrice
                    }
                    size="sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label={`Remove ${product.title}`}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <dl className="divide-y divide-slate-100 border-t border-slate-100">
              {buildMobileRows(product).map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between px-4 py-2.5"
                >
                  <dt className="text-xs font-medium text-slate-500">
                    {row.label}
                  </dt>
                  <dd className="text-xs text-slate-700">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

interface ComparisonRow {
  label: string;
  values: React.ReactNode[];
}

function buildComparisonRows(products: CompareProduct[]): ComparisonRow[] {
  const rows: ComparisonRow[] = [];

  // Price
  rows.push({
    label: 'Price',
    values: products.map((p) => (
      <PriceDisplay
        key={p.id}
        price={p.priceRange.minVariantPrice}
        compareAtPrice={p.compareAtPriceRange?.minVariantPrice}
        size="sm"
        layout="vertical"
      />
    )),
  });

  // Brand
  rows.push({
    label: 'Brand',
    values: products.map((p) => p.vendor || '—'),
  });

  // Type
  rows.push({
    label: 'Type',
    values: products.map((p) => p.productType || '—'),
  });

  // Weight
  rows.push({
    label: 'Weight',
    values: products.map((p) => {
      const variant = p.variants.nodes[0];
      if (variant?.weight && variant.weight > 0) {
        const unit = (variant.weightUnit || 'KILOGRAMS').toLowerCase();
        const unitLabel =
          unit === 'kilograms'
            ? 'kg'
            : unit === 'grams'
              ? 'g'
              : unit === 'pounds'
                ? 'lb'
                : unit === 'ounces'
                  ? 'oz'
                  : unit;
        return `${variant.weight} ${unitLabel}`;
      }
      return '—';
    }),
  });

  // Dimensions
  rows.push({
    label: 'Dimensions',
    values: products.map((p) => p.dimensions?.value || '—'),
  });

  // Material
  rows.push({
    label: 'Material',
    values: products.map((p) => p.material?.value || '—'),
  });

  return rows;
}

interface MobileRow {
  label: string;
  value: string;
}

function buildMobileRows(product: CompareProduct): MobileRow[] {
  const rows: MobileRow[] = [];

  if (product.vendor) {
    rows.push({label: 'Brand', value: product.vendor});
  }

  if (product.productType) {
    rows.push({label: 'Type', value: product.productType});
  }

  const variant = product.variants.nodes[0];
  if (variant?.weight && variant.weight > 0) {
    const unit = (variant.weightUnit || 'KILOGRAMS').toLowerCase();
    const unitLabel =
      unit === 'kilograms'
        ? 'kg'
        : unit === 'grams'
          ? 'g'
          : unit === 'pounds'
            ? 'lb'
            : unit === 'ounces'
              ? 'oz'
              : unit;
    rows.push({label: 'Weight', value: `${variant.weight} ${unitLabel}`});
  }

  if (product.dimensions?.value) {
    rows.push({label: 'Dimensions', value: product.dimensions.value});
  }

  if (product.material?.value) {
    rows.push({label: 'Material', value: product.material.value});
  }

  return rows;
}
