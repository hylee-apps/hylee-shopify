import React, {useState, useId, useCallback} from 'react';

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
 * Tabs component - migrated from theme/snippets/tabs.liquid
 *
 * A tabbed interface for organizing content into sections.
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
  activeTab: controlledActiveTab,
  onChange,
  className,
}: TabsProps) {
  const baseId = useId();
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(
    defaultTab || tabs[0]?.key || '',
  );

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;

  const handleTabChange = useCallback(
    (key: string) => {
      if (!isControlled) {
        setUncontrolledActiveTab(key);
      }
      onChange?.(key);
    },
    [isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const currentEnabledIndex = enabledTabs.findIndex(
        (t) => t.key === tabs[currentIndex].key,
      );

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          nextIndex =
            currentEnabledIndex > 0
              ? currentEnabledIndex - 1
              : enabledTabs.length - 1;
          break;
        case 'ArrowRight':
          nextIndex =
            currentEnabledIndex < enabledTabs.length - 1
              ? currentEnabledIndex + 1
              : 0;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextTab = enabledTabs[nextIndex];
        handleTabChange(nextTab.key);

        // Focus the next tab button
        const nextButton = document.getElementById(
          `${baseId}-tab-${nextTab.key}`,
        );
        nextButton?.focus();
      }
    },
    [tabs, baseId, handleTabChange],
  );

  const baseClasses = ['tabs', className].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      {/* Tab List */}
      <div
        className="tabs-list flex border-b border-slate-200"
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab;
          const tabId = `${baseId}-tab-${tab.key}`;
          const panelId = `${baseId}-panel-${tab.key}`;

          return (
            <button
              key={tab.key}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
                tab.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const tabId = `${baseId}-tab-${tab.key}`;
        const panelId = `${baseId}-panel-${tab.key}`;

        return (
          <div
            key={tab.key}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            tabIndex={0}
            className="tabs-panel pt-4"
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
