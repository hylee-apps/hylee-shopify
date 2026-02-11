import React from 'react';

export type SkeletonType =
  | 'text'
  | 'card'
  | 'image'
  | 'avatar'
  | 'button'
  | 'product-card';

export interface SkeletonProps {
  /** Skeleton type determines the shape and structure */
  type?: SkeletonType;
  /** Number of text lines (for type: 'text') */
  lines?: number;
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
  /** Aspect ratio for images (e.g., '1/1', '16/9') */
  aspectRatio?: string;
  /** Additional CSS classes */
  className?: string;
}

const shimmerClass =
  'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]';

/**
 * Skeleton component - migrated from theme/snippets/skeleton.liquid
 *
 * Loading placeholder components for various content types.
 *
 * @example
 * <Skeleton type="text" lines={3} />
 *
 * @example
 * <Skeleton type="product-card" />
 *
 * @example
 * <Skeleton type="image" aspectRatio="16/9" />
 */
export function Skeleton({
  type = 'text',
  lines = 1,
  width,
  height,
  aspectRatio,
  className,
}: SkeletonProps) {
  const baseClasses = ['skeleton', className].filter(Boolean).join(' ');

  const customStyles: React.CSSProperties = {
    ...(width && {width: typeof width === 'number' ? `${width}px` : width}),
    ...(height && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  // Text skeleton
  if (type === 'text') {
    return (
      <div className={baseClasses} style={customStyles} aria-hidden="true">
        {Array.from({length: lines}, (_, i) => (
          <div
            key={i}
            className={`h-4 ${shimmerClass} rounded mb-2 last:mb-0`}
            style={{width: i === lines - 1 ? '60%' : '100%'}}
          />
        ))}
      </div>
    );
  }

  // Card skeleton
  if (type === 'card') {
    return (
      <div
        className={`${baseClasses} rounded-xl overflow-hidden border border-slate-200`}
        style={customStyles}
        aria-hidden="true"
      >
        <div className={`${shimmerClass}`} style={{aspectRatio: '16/9'}} />
        <div className="p-4 space-y-2">
          <div
            className={`h-4 ${shimmerClass} rounded`}
            style={{width: '70%'}}
          />
          <div
            className={`h-4 ${shimmerClass} rounded`}
            style={{width: '100%'}}
          />
          <div
            className={`h-4 ${shimmerClass} rounded`}
            style={{width: '40%'}}
          />
        </div>
      </div>
    );
  }

  // Product card skeleton
  if (type === 'product-card') {
    return (
      <div
        className={`${baseClasses} rounded-xl overflow-hidden border border-slate-200`}
        style={customStyles}
        aria-hidden="true"
      >
        <div className={`${shimmerClass}`} style={{aspectRatio: '1/1'}} />
        <div className="p-4 space-y-2">
          <div
            className={`h-3 ${shimmerClass} rounded`}
            style={{width: '50%'}}
          />
          <div
            className={`h-4 ${shimmerClass} rounded`}
            style={{width: '90%'}}
          />
          <div
            className={`h-6 ${shimmerClass} rounded`}
            style={{width: '30%'}}
          />
        </div>
      </div>
    );
  }

  // Image skeleton
  if (type === 'image') {
    return (
      <div
        className={`${baseClasses} ${shimmerClass} rounded-lg`}
        style={{
          ...customStyles,
          aspectRatio: aspectRatio || '1/1',
        }}
        aria-hidden="true"
      />
    );
  }

  // Avatar skeleton
  if (type === 'avatar') {
    return (
      <div
        className={`${baseClasses} ${shimmerClass} rounded-full`}
        style={{
          width: width || '40px',
          height: height || '40px',
          ...customStyles,
        }}
        aria-hidden="true"
      />
    );
  }

  // Button skeleton
  if (type === 'button') {
    return (
      <div
        className={`${baseClasses} ${shimmerClass} rounded-xl`}
        style={{
          width: width || '120px',
          height: height || '36px',
          ...customStyles,
        }}
        aria-hidden="true"
      />
    );
  }

  // Default: simple rectangle
  return (
    <div
      className={`${baseClasses} ${shimmerClass} rounded`}
      style={{
        width: width || '100%',
        height: height || '20px',
        ...customStyles,
      }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
