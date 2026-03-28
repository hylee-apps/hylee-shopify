import {CircleCheck, QrCode} from 'lucide-react';
import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ShippingOption {
  id: string;
  icon: ComponentType<LucideProps>;
  title: string;
  price: string;
  priceFree: boolean;
  priceAmount: number;
  description: string;
  features: string[];
  showQrPreview?: boolean;
}

interface ShippingOptionCardProps {
  option: ShippingOption;
  selected: boolean;
  onSelect: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ShippingOptionCard({
  option,
  selected,
  onSelect,
}: ShippingOptionCardProps) {
  const {icon: Icon, title, price, priceFree, description, features} = option;
  const showQr = selected && option.showQrPreview;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-[16px] rounded-[12px] border-2 p-[22px] text-left transition-colors ${
        selected
          ? 'border-return-accent bg-[rgba(38,153,166,0.05)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]'
          : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
      }`}
      data-testid={`shipping-option-${option.id}`}
    >
      {/* Radio Button */}
      <div
        className={`flex size-[24px] shrink-0 items-center justify-center rounded-[12px] border-2 ${
          selected
            ? 'border-return-accent bg-return-accent'
            : 'border-[#d1d5db] bg-transparent'
        }`}
        data-testid={`shipping-radio-${option.id}`}
      >
        {selected && <div className="size-[10px] rounded-[5px] bg-white" />}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <Icon size={16} className="shrink-0 text-return-accent" />
            <span className="text-[16px] font-semibold leading-[24px] text-[#111827]">
              {title}
            </span>
          </div>
          <span
            className={`text-[16px] font-bold leading-[24px] ${
              priceFree ? 'text-primary' : 'text-return-accent'
            }`}
          >
            {price}
          </span>
        </div>

        {/* Description */}
        <p className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-[16px] gap-y-[4px] pt-[4px]">
          {features.map((feature) => (
            <span key={feature} className="flex items-center gap-[8px]">
              <CircleCheck size={13} className="shrink-0 text-primary" />
              <span className="text-[13px] font-normal leading-[19.5px] text-[#4b5563]">
                {feature}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* QR Code Preview (only for selected drop-off) */}
      {showQr && (
        <div className="ml-[16px] flex size-[120px] shrink-0 items-center justify-center rounded-[8px] border-2 border-[#e5e7eb] bg-white">
          <QrCode size={80} className="text-[#d1d5db]" />
        </div>
      )}
    </button>
  );
}
