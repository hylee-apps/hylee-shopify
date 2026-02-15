import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {Icon} from '../display/Icon';
import {cn} from '~/lib/utils';

export interface AccordionItemProps {
  /** Unique key/id for the item */
  id: string;
  /** Accordion header title */
  title: React.ReactNode;
  /** Accordion content */
  children: React.ReactNode;
  /** @deprecated Managed by parent Accordion via Radix */
  defaultOpen?: boolean;
  /** @deprecated Managed by parent Accordion via Radix */
  open?: boolean;
  /** @deprecated Managed by parent Accordion via Radix */
  onOpenChange?: (open: boolean) => void;
  /** Show chevron icon */
  showIcon?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AccordionItem component — powered by Radix Accordion.
 *
 * Must be a child of `<Accordion>`. Open/close state is managed by the parent.
 *
 * @example
 * <Accordion>
 *   <AccordionItem id="faq-1" title="How does shipping work?">
 *     <p>We ship within 2-3 business days...</p>
 *   </AccordionItem>
 * </Accordion>
 */
export function AccordionItem({
  id,
  title,
  children,
  showIcon = true,
  disabled = false,
  className,
}: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={id}
      disabled={disabled}
      className={cn(
        'accordion-item border-b border-slate-200 last:border-b-0',
        className,
      )}
    >
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            'flex w-full items-center justify-between py-4 text-left text-sm font-medium text-slate-900 transition-colors',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-primary cursor-pointer',
            '[&[data-state=open]>svg]:rotate-180',
          )}
        >
          <span className="accordion-title">{title}</span>
          {showIcon && (
            <Icon
              name="chevron-down"
              size={20}
              className="shrink-0 text-slate-500 transition-transform duration-200"
            />
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="accordion-content overflow-hidden text-sm text-slate-600 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export interface AccordionProps {
  /** Allow multiple items to be open */
  multiple?: boolean;
  /** Default open item keys */
  defaultOpenKeys?: string[];
  /** Controlled open item keys */
  openKeys?: string[];
  /** Callback when open keys change */
  onOpenKeysChange?: (keys: string[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Accordion items (AccordionItem components) */
  children: React.ReactNode;
}

/**
 * Accordion component — powered by Radix Accordion for accessible
 * keyboard navigation, ARIA attributes, and animated expand/collapse.
 *
 * @example
 * <Accordion>
 *   <AccordionItem id="1" title="Question 1">
 *     Answer 1
 *   </AccordionItem>
 *   <AccordionItem id="2" title="Question 2">
 *     Answer 2
 *   </AccordionItem>
 * </Accordion>
 *
 * @example
 * // Allow multiple open
 * <Accordion multiple defaultOpenKeys={['1']}>
 *   ...
 * </Accordion>
 */
export function Accordion({
  multiple = false,
  defaultOpenKeys = [],
  openKeys,
  onOpenKeysChange,
  className,
  children,
}: AccordionProps) {
  const baseClassName = cn(
    'accordion border border-slate-200 rounded-xl',
    className,
  );

  // Radix uses discriminated-union props depending on type
  if (multiple) {
    return (
      <AccordionPrimitive.Root
        type="multiple"
        value={openKeys}
        defaultValue={defaultOpenKeys}
        onValueChange={onOpenKeysChange}
        className={baseClassName}
      >
        {children}
      </AccordionPrimitive.Root>
    );
  }

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={openKeys?.[0]}
      defaultValue={defaultOpenKeys[0]}
      onValueChange={(value) => onOpenKeysChange?.(value ? [value] : [])}
      className={baseClassName}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

export default Accordion;
