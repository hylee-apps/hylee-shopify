import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {cn} from '~/lib/utils';

export interface TabItem {
  /** Unique tab key/id */
  key: string;
  /** Tab label */
  label: React.ReactNode;
  /** Tab content */
  content: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Initially active tab key */
  defaultTab?: string;
  /** Controlled active tab key */
  activeTab?: string;
  /** Callback when tab changes */
  onChange?: (key: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tabs component — powered by Radix Tabs for accessible
 * keyboard navigation (Arrow, Home, End), ARIA attributes,
 * and focus management out of the box.
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { key: 'description', label: 'Description', content: <p>Product info</p> },
 *     { key: 'reviews', label: 'Reviews', content: <p>Customer reviews</p> },
 *   ]}
 * />
 *
 * @example
 * // Controlled
 * <Tabs
 *   tabs={tabItems}
 *   activeTab={selectedTab}
 *   onChange={setSelectedTab}
 * />
 */
export function Tabs({
  tabs,
  defaultTab,
  activeTab,
  onChange,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      value={activeTab}
      defaultValue={defaultTab || tabs[0]?.key || ''}
      onValueChange={onChange}
      className={cn('tabs', className)}
    >
      {/* Tab List */}
      <TabsPrimitive.List className="tabs-list flex border-b border-slate-200">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.key}
            value={tab.key}
            disabled={tab.disabled}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              'data-[state=active]:border-primary data-[state=active]:text-primary',
              'data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-600',
              'data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:border-slate-300',
              tab.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
            )}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.key}
          value={tab.key}
          className="tabs-panel pt-4"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

export default Tabs;
