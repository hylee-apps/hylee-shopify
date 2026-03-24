'use client';

import {FAMILY_SUBCATEGORIES} from '~/lib/address-book';
import type {FamilySubcategory, FamilyRelationship} from '~/lib/address-book';

interface SubcategoryBarProps {
  activeSubcategory: FamilySubcategory;
  onSubcategoryChange: (subcategory: FamilySubcategory) => void;
}

export function SubcategoryBar({
  activeSubcategory,
  onSubcategoryChange,
}: SubcategoryBarProps) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-gray-200 pt-4 pb-4.25">
      {FAMILY_SUBCATEGORIES.map(({value, label}) => {
        const isActive = activeSubcategory === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSubcategoryChange(value)}
            className={`shrink-0 whitespace-nowrap rounded px-3 py-2 text-[15px] leading-[22.5px] transition-colors ${
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

interface RelationshipBarProps {
  relationships: {value: FamilyRelationship; label: string}[];
  activeRelationship: FamilyRelationship | undefined;
  onRelationshipChange: (relationship: FamilyRelationship) => void;
}

export function RelationshipBar({
  relationships,
  activeRelationship,
  onRelationshipChange,
}: RelationshipBarProps) {
  if (relationships.length <= 1) return null;

  return (
    <div className="flex h-14.75 items-start justify-center gap-4">
      {relationships.map(({value, label}) => {
        const isActive = activeRelationship === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onRelationshipChange(value)}
            className={`flex flex-1 items-center justify-center rounded-lg border-2 p-4.5 text-center text-[15px] font-medium leading-[22.5px] transition-colors ${
              isActive
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-transparent text-gray-800 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
