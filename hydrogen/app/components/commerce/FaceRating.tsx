import {Smile, Meh, Frown, type LucideIcon} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/**
 * 3-tier face sentiment rating scale:
 *   1 = Happy   (highest / best)
 *   2 = Neutral (middle)
 *   3 = Unhappy (lowest / worst)
 */
export type FaceRatingValue = 1 | 2 | 3;

interface FaceConfig {
  label: 'Happy' | 'Neutral' | 'Unhappy';
  Icon: LucideIcon;
  /** Tailwind text color class */
  colorClass: string;
  /** Tailwind background class (for pill / badge) */
  bgClass: string;
}

// ============================================================================
// Config
// ============================================================================

export const FACE_CONFIG: Record<FaceRatingValue, FaceConfig> = {
  1: {
    label: 'Happy',
    Icon: Smile,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  2: {
    label: 'Neutral',
    Icon: Meh,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10',
  },
  3: {
    label: 'Unhappy',
    Icon: Frown,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
  },
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert a numeric Shopify rating (1–5 float) to a FaceRatingValue.
 *   ≥ 3.5  → 1 Happy
 *   ≥ 2.0  → 2 Neutral
 *   < 2.0  → 3 Unhappy
 */
export function toFaceRating(rating: number): FaceRatingValue {
  if (rating >= 3.5) return 1;
  if (rating >= 2.0) return 2;
  return 3;
}

// ============================================================================
// FaceIcon
// ============================================================================

export interface FaceIconProps {
  value: FaceRatingValue;
  /** Icon size in px (default 16) */
  size?: number;
  /** Additional class names */
  className?: string;
  /** Show the label text beside the icon */
  showLabel?: boolean;
}

/**
 * Single face icon for a given FaceRatingValue.
 * Colour-coded: green (Happy), amber (Neutral), red (Unhappy).
 */
export function FaceIcon({
  value,
  size = 16,
  className = '',
  showLabel = false,
}: FaceIconProps) {
  const {Icon, colorClass, label} = FACE_CONFIG[value];
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Icon size={size} className={colorClass} aria-label={label} />
      {showLabel && (
        <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
      )}
    </span>
  );
}

// ============================================================================
// FaceRatingSummary
// ============================================================================

export interface FaceRatingSummaryProps {
  /**
   * Per-face counts — key is the FaceRatingValue (1 | 2 | 3).
   * Pass 0 for a face that has no reviews yet.
   */
  counts: Partial<Record<FaceRatingValue, number>>;
  /** Optional total review count shown as "(n reviews)" */
  totalCount?: number | null;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * Aggregate face rating display: all 3 faces shown in a row,
 * each with a count badge beneath it.
 *
 * Example:
 *   😊 2   😐 1   😞 0
 */
export function FaceRatingSummary({
  counts,
  totalCount,
  className = '',
}: FaceRatingSummaryProps) {
  const faces: FaceRatingValue[] = [1, 2, 3];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {faces.map((face) => {
        const {Icon, colorClass, bgClass, label} = FACE_CONFIG[face];
        const count = counts[face] ?? 0;
        return (
          <span
            key={face}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${bgClass} ${colorClass}`}
            aria-label={`${label}: ${count}`}
          >
            <Icon size={16} aria-hidden />
            <span>{count}</span>
          </span>
        );
      })}
      {totalCount != null && totalCount > 0 && (
        <span className="text-sm text-text-muted">({totalCount} reviews)</span>
      )}
    </div>
  );
}
