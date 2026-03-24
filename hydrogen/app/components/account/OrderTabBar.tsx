import {ShoppingBag, RotateCcw, Truck} from 'lucide-react';

export type OrderTab = 'orders' | 'buy-again' | 'on-the-way-out';

interface OrderTabBarProps {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
}

const TABS: {key: OrderTab; label: string; icon: typeof ShoppingBag}[] = [
  {key: 'orders', label: 'Orders', icon: ShoppingBag},
  {key: 'buy-again', label: 'Buy Again', icon: RotateCcw},
  {key: 'on-the-way-out', label: 'On the Way Out', icon: Truck},
];

export function OrderTabBar({activeTab, onTabChange}: OrderTabBarProps) {
  return (
    <div className="flex w-full items-start overflow-x-auto border-b border-[#e5e7eb] bg-white">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex shrink-0 items-center gap-[8px] border-b-[3px] px-[24px] pb-[19px] pt-[16px] transition-colors ${
              isActive
                ? 'border-[#f2b05e] text-[#40283c]'
                : 'border-transparent text-[#4b5563] hover:text-[#40283c]'
            }`}
          >
            <tab.icon
              size={14}
              className={isActive ? 'text-[#40283c]' : 'text-[#4b5563]'}
            />
            <span className="whitespace-nowrap text-[15px] leading-[22.5px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
