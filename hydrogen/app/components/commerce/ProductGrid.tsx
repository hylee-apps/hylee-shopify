import {ProductCard} from './ProductCard';
import type {ProductCardProps} from './ProductCard';

type ProductCardProduct = ProductCardProps['product'];

export interface ProductGridProps {
  products: ProductCardProduct[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * ProductGrid — responsive product card grid with grid/list toggle.
 *
 * Wraps existing ProductCard components in a responsive layout.
 */
export function ProductGrid({
  products,
  viewMode = 'grid',
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  const gridClasses =
    viewMode === 'list'
      ? 'grid grid-cols-1 gap-4'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`${gridClasses} ${className ?? ''}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          showVendor
          showRating
          showQuickAdd
          showDiscountPercentage
          lazyLoad={index >= 6}
        />
      ))}
    </div>
  );
}
