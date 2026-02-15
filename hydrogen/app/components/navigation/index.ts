/**
 * Navigation Components - Hydrogen Design System
 *
 * Migrated from theme/snippets/ Liquid components
 * Enhanced with Radix UI primitives and shadcn/ui patterns
 */

// Breadcrumb component
export {
  Breadcrumb,
  type BreadcrumbProps,
  type BreadcrumbItem,
  type BreadcrumbVariant,
} from './Breadcrumb';

// Pagination component
export {Pagination, type PaginationProps} from './Pagination';

// Tabs component (Radix)
export {Tabs, type TabsProps, type TabItem} from './Tabs';

// Accordion component (Radix)
export {
  Accordion,
  AccordionItem,
  type AccordionProps,
  type AccordionItemProps,
} from './Accordion';

// Modal component (Radix Dialog)
export {Modal, type ModalProps, type ModalSize} from './Modal';

// PredictiveSearch component
export {PredictiveSearch, type PredictiveSearchProps} from './PredictiveSearch';

// DropdownMenu component (Radix)
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './DropdownMenu';

// Sheet / Drawer component (Radix Dialog)
export {Sheet, sheetVariants, type SheetProps, type SheetSide} from './Sheet';
