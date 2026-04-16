'use client';

import type {ComponentType} from 'react';
import {Home, Users, Heart, Briefcase, MapPin} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import type {AddressCategory} from '~/lib/address-book';
import type {LucideProps} from 'lucide-react';

const CATEGORY_TABS: {
  value: AddressCategory;
  icon: ComponentType<LucideProps>;
}[] = [
  {value: 'home', icon: Home},
  {value: 'family', icon: Users},
  {value: 'friends', icon: Heart},
  {value: 'work', icon: Briefcase},
  {value: 'other', icon: MapPin},
];

interface CategoryBarProps {
  activeCategory: AddressCategory;
  onCategoryChange: (category: AddressCategory) => void;
}

export function CategoryBar({
  activeCategory,
  onCategoryChange,
}: CategoryBarProps) {
  const {t} = useTranslation();
  return (
    <div className="flex items-center overflow-x-auto rounded-lg border-2 border-[#a8d5a0] bg-white px-4.5 py-2.5">
      {CATEGORY_TABS.map(({value, icon: Icon}) => {
        const isActive = activeCategory === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onCategoryChange(value)}
            className={`flex shrink-0 items-center gap-2 rounded px-4 py-3 transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} />
            <span className="whitespace-nowrap text-[16px] font-medium leading-6">
              {t(`addressBook.categories.${value}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
