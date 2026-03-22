import type {AddressCategory} from '~/lib/address-book';

const CATEGORY_COLORS: Record<AddressCategory, {bg: string; text: string}> = {
  home: {bg: 'bg-green-100', text: 'text-green-800'},
  family: {bg: 'bg-blue-100', text: 'text-blue-800'},
  friends: {bg: 'bg-purple-100', text: 'text-purple-800'},
  work: {bg: 'bg-amber-100', text: 'text-amber-800'},
  other: {bg: 'bg-surface', text: 'text-text'},
};

interface RecipientBadgeProps {
  category: string;
  label: string;
}

export function RecipientBadge({category, label}: RecipientBadgeProps) {
  const colors =
    CATEGORY_COLORS[category as AddressCategory] ?? CATEGORY_COLORS.other;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      For {label}
    </span>
  );
}
