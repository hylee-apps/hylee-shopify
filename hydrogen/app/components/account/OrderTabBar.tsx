import {ShoppingBag, RotateCcw, Truck} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export type OrderTab = 'orders' | 'buy-again' | 'on-the-way-out';

interface OrderTabBarProps {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
}

const TABS: {key: OrderTab; labelKey: string; icon: typeof ShoppingBag}[] = [
  {key: 'orders', labelKey: 'orders.tabs.orders', icon: ShoppingBag},
  {key: 'buy-again', labelKey: 'orders.tabs.buyAgain', icon: RotateCcw},
  {key: 'on-the-way-out', labelKey: 'orders.tabs.onTheWayOut', icon: Truck},
];

export function OrderTabBar({activeTab, onTabChange}: OrderTabBarProps) {
  const {t} = useTranslation();
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
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
