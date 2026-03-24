'use client';

import type {ComponentType} from 'react';
import {Home, Users, Heart, Briefcase, MapPin} from 'lucide-react';
import type {AddressCategory} from '~/lib/address-book';
import type {LucideProps} from 'lucide-react';

const CATEGORY_TABS: {
  value: AddressCategory;
  label: string;
  icon: ComponentType<LucideProps>;
}[] = [
  {value: 'home', label: 'Home', icon: Home},
  {value: 'family', label: 'Family', icon: Users},
  {value: 'friends', label: 'Friends', icon: Heart},
  {value: 'work', label: 'Work', icon: Briefcase},
  {value: 'other', label: 'Other', icon: MapPin},
];

interface CategoryBarProps {
  activeCategory: AddressCategory;
  onCategoryChange: (category: AddressCategory) => void;
}

export function CategoryBar({
  activeCategory,
  onCategoryChange,
}: CategoryBarProps) {
  return (
    <div className="flex items-center overflow-x-auto rounded-lg border-2 border-[#a8d5a0] bg-white px-4.5 py-2.5">
      {CATEGORY_TABS.map(({value, label, icon: Icon}) => {
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
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
