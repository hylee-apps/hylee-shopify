import {Package} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface PreviewItem {
  id: string;
  title: string;
  image: {url: string; altText?: string | null} | null;
}

interface SelectedItemsPreviewProps {
  items: PreviewItem[];
  totalValue: string;
}

// ============================================================================
// Component
// ============================================================================

export function SelectedItemsPreview({
  items,
  totalValue,
}: SelectedItemsPreviewProps) {
  return (
    <div
      className="flex flex-col gap-[16px]"
      data-testid="selected-items-preview"
    >
      {/* Thumbnails */}
      <div className="flex flex-wrap gap-x-[12px] gap-y-[12px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex size-[50px] items-center justify-center overflow-hidden rounded-[8px] bg-[#f3f4f6]"
            data-testid={`preview-thumb-${item.id}`}
          >
            {item.image ? (
              <img
                src={item.image.url}
                alt={item.image.altText ?? item.title}
                className="size-[50px] rounded-[8px] object-cover"
              />
            ) : (
              <Package size={20} className="text-[#9ca3af]" />
            )}
          </div>
        ))}
      </div>

      {/* Summary text */}
      <p className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
        {items.length} items &bull; Total value: {totalValue}
      </p>
    </div>
  );
}
