import React, {forwardRef} from 'react';
import {Link} from 'react-router';

export type CardVariant = 'default' | 'elevated' | 'hover' | 'clickable';
export type CardSize = 'default' | 'sm' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Header action element */
  action?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Show border on header */
  borderHeader?: boolean;
  /** Show border on footer */
  borderFooter?: boolean;
  /** Make entire card clickable with this URL */
  url?: string;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border border-slate-200 bg-white',
  elevated: 'border-0 bg-white shadow-md',
  hover:
    'border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all',
  clickable:
    'border border-slate-200 bg-white cursor-pointer hover:border-primary hover:shadow-md transition-all',
};

const sizeStyles: Record<CardSize, {card: string; padding: string}> = {
  default: {card: '', padding: 'p-4'},
  sm: {card: '', padding: 'p-3'},
  lg: {card: '', padding: 'p-6'},
};

/**
 * Card component - migrated from theme/snippets/card.liquid
 *
 * A versatile container component with optional header, footer, and image.
 *
 * @example
 * <Card title="Product Name" description="A great product">
 *   <p>Card content here</p>
 * </Card>
 *
 * @example
 * <Card
 *   variant="clickable"
 *   url="/products/example"
 *   imageUrl="/image.jpg"
 *   title="Click me"
 * />
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'default',
      title,
      description,
      action,
      footer,
      imageUrl,
      imageAlt,
      borderHeader = false,
      borderFooter = false,
      url,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const effectiveVariant = url ? 'clickable' : variant;
    const sizes = sizeStyles[size];

    const hasHeader = !!(title || description || action);
    const hasFooter = !!footer;

    const cardClasses = [
      'rounded-xl overflow-hidden',
      variantStyles[effectiveVariant],
      sizes.card,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const headerClasses = [
      'flex items-start justify-between gap-4',
      sizes.padding,
      borderHeader ? 'border-b border-slate-200' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const footerClasses = [
      sizes.padding,
      borderFooter ? 'border-t border-slate-200' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const cardContent = (
      <>
        {imageUrl && (
          <div className="card-image">
            <img
              src={imageUrl}
              alt={imageAlt || ''}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {hasHeader && (
          <div className={headerClasses}>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-semibold text-slate-900 text-base">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}

        {children && (
          <div className={`${sizes.padding} ${hasHeader ? 'pt-0' : ''}`}>
            {children}
          </div>
        )}

        {hasFooter && <div className={footerClasses}>{footer}</div>}
      </>
    );

    if (url) {
      return (
        <Link
          to={url}
          className={cardClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...rest}>
        {cardContent}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
