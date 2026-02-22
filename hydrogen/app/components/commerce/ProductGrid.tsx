import {ProductCard} from './ProductCard';
import type {ProductCardProps} from './ProductCard';

type ProductCardProduct = ProductCardProps['product'];

export interface ProductGridProps {
  products: ProductCardProduct[];
  /**
   * Card size — passed through to each ProductCard.
   * 'small' renders Card=ProductSmall (PLP layout, 5-column grid).
   * 'default' renders the standard 3-column grid.
   */
  size?: 'default' | 'small';
  viewMode?: 'grid' | 'list';
  className?: string;
  /** Collection handle appended as ?collection= on product links for PDP breadcrumbs */
  collectionHandle?: string;
}

/**
 * ProductGrid — responsive product card grid.
 *
 * size="small"   → 5-column PLP grid (Figma: gap-[10px], Card=ProductSmall)
 * size="default" → 3-column standard grid
 */
export function ProductGrid({
  products,
  size = 'default',
  viewMode = 'grid',
  className,
  collectionHandle,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  let gridClasses: string;
  if (viewMode === 'list') {
    gridClasses = 'grid grid-cols-1 gap-4';
  } else if (size === 'small') {
    // Figma PLP: 5 columns, gap-x-2.5 between cards, gap-y-5 between rows
    gridClasses =
      'grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3 md:grid-cols-5';
  } else {
    gridClasses = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';
  }

  return (
    <div className={`${gridClasses} ${className ?? ''}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          size={size}
          showVendor={size === 'default'}
          showRating={size === 'default'}
          showQuickAdd={size === 'default'}
          showDiscountPercentage={size === 'default'}
          lazyLoad={index >= 6}
          collectionHandle={collectionHandle}
        />
      ))}
    </div>
  );
}
