/**
 * Display Components - Hydrogen Design System
 *
 * Migrated from theme/snippets/ Liquid components
 * Enhanced with Radix UI primitives and shadcn/ui patterns
 */

// Card component
export {Card, type CardProps, type CardVariant, type CardSize} from './Card';

// Badge component
export {
  Badge,
  type BadgeProps,
  type BadgeVariant,
  type BadgeSize,
} from './Badge';

// Pill component
export {Pill, type PillProps, type PillVariant, type PillSize} from './Pill';

// Icon component
export {Icon, type IconProps, type IconName} from './Icon';

// Skeleton component
export {Skeleton, type SkeletonProps, type SkeletonType} from './Skeleton';

// Alert component
export {Alert, type AlertProps, type AlertType} from './Alert';

// Toast component (Radix)
export {
  Toast,
  ToastViewport,
  ToastProvider,
  toastVariants,
  type ToastProps,
  type ToastVariant,
  type ToasterProps,
} from './Toast';

// Tooltip component (Radix)
export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  type TooltipProps,
} from './Tooltip';
