import {ShoppingBag, Truck, RotateCcw} from 'lucide-react';

interface OrderStatsCardsProps {
  totalOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
}

const STAT_CARDS = [
  {
    key: 'orders',
    label: 'Orders',
    icon: ShoppingBag,
    iconBg: 'bg-[rgba(59,130,246,0.1)]',
    iconColor: 'text-[#3b82f6]',
  },
  {
    key: 'inTransit',
    label: 'On The Way Out',
    icon: Truck,
    iconBg: 'bg-[rgba(245,158,11,0.1)]',
    iconColor: 'text-[#f59e0b]',
  },
  {
    key: 'delivered',
    label: 'Re-Purchase',
    icon: RotateCcw,
    iconBg: 'bg-[rgba(16,185,129,0.1)]',
    iconColor: 'text-[#10b981]',
  },
] as const;

export function OrderStatsCards({
  totalOrders,
  inTransitOrders,
  deliveredOrders,
}: OrderStatsCardsProps) {
  const values: Record<string, number> = {
    orders: totalOrders,
    inTransit: inTransitOrders,
    delivered: deliveredOrders,
  };

  return (
    <div className="flex flex-col gap-[24px] pb-[16px] sm:flex-row">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className="flex flex-1 items-center gap-[16px] rounded-[12px] bg-white px-[32px] pb-[32px] pt-[31px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
        >
          <div
            className={`flex size-[56px] shrink-0 items-center justify-center rounded-[12px] ${card.iconBg}`}
          >
            <card.icon size={24} className={card.iconColor} />
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[28px] font-bold leading-[44.8px] text-[#1f2937]">
              {values[card.key]}
            </span>
            <span className="text-[14px] leading-[22.4px] text-[#6b7280]">
              {card.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
