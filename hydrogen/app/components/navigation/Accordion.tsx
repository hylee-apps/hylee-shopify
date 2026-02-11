import React, {useState, useId, useCallback} from 'react';
import {Icon} from '../display/Icon';

export interface AccordionItemProps {
  /** Unique key/id for the item */
  id: string;
  /** Accordion header title */
  title: React.ReactNode;
  /** Accordion content */
  children: React.ReactNode;
  /** Initially open state */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Show chevron icon */
  showIcon?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AccordionItem component
 *
 * A single expandable accordion panel.
 *
 * @example
 * <AccordionItem id="faq-1" title="How does shipping work?">
 *   <p>We ship within 2-3 business days...</p>
 * </AccordionItem>
 */
export function AccordionItem({
  id,
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  showIcon = true,
  disabled = false,
  className,
}: AccordionItemProps) {
  const baseId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerId = `${baseId}-trigger-${id}`;
  const contentId = `${baseId}-content-${id}`;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newOpen = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isOpen, isControlled, disabled, onOpenChange]);

  const baseClasses = [
    'accordion-item border-b border-slate-200 last:border-b-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={baseClasses}>
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        onClick={handleToggle}
        className={[
          'flex w-full items-center justify-between py-4 text-left text-sm font-medium text-slate-900 transition-colors',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:text-primary cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="accordion-title">{title}</span>
        {showIcon && (
          <Icon
            name="chevron-down"
            size={20}
            className={`shrink-0 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className={`accordion-content overflow-hidden transition-all duration-200 ${
          isOpen ? 'pb-4' : ''
        }`}
      >
        <div className="text-sm text-slate-600">{children}</div>
      </div>
    </div>
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
 * Accordion component - migrated from theme/snippets/accordion.liquid
 *
 * A container for expandable accordion items.
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
  openKeys: controlledOpenKeys,
  onOpenKeysChange,
  className,
  children,
}: AccordionProps) {
  const [uncontrolledOpenKeys, setUncontrolledOpenKeys] =
    useState(defaultOpenKeys);

  const isControlled = controlledOpenKeys !== undefined;
  const openKeys = isControlled ? controlledOpenKeys : uncontrolledOpenKeys;

  const handleItemOpenChange = useCallback(
    (itemId: string, isOpen: boolean) => {
      let newOpenKeys: string[];

      if (isOpen) {
        if (multiple) {
          newOpenKeys = [...openKeys, itemId];
        } else {
          newOpenKeys = [itemId];
        }
      } else {
        newOpenKeys = openKeys.filter((key) => key !== itemId);
      }

      if (!isControlled) {
        setUncontrolledOpenKeys(newOpenKeys);
      }
      onOpenKeysChange?.(newOpenKeys);
    },
    [multiple, openKeys, isControlled, onOpenKeysChange],
  );

  const baseClasses = [
    'accordion border border-slate-200 rounded-xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Clone children and inject open state
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<AccordionItemProps>(child)) {
      const itemId = child.props.id;
      return React.cloneElement(child, {
        open: openKeys.includes(itemId),
        onOpenChange: (isOpen: boolean) => handleItemOpenChange(itemId, isOpen),
      });
    }
    return child;
  });

  return <div className={baseClasses}>{enhancedChildren}</div>;
}

export default Accordion;
