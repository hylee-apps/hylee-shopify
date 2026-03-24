'use client';

import type {ComponentType} from 'react';
import {Plus} from 'lucide-react';
import type {LucideProps} from 'lucide-react';

interface SubsectionHeaderProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
}

export function SubsectionHeader({
  icon: Icon,
  title,
  description,
  addLabel,
  onAdd,
}: SubsectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b-2 border-primary pb-4.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-semibold leading-[30px] text-gray-900">
            {title}
          </h2>
          <p className="text-[13px] leading-[19.5px] text-gray-500">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-4 rounded-lg bg-[#4fd1a8] px-4 py-2 transition-opacity hover:opacity-90"
      >
        <Plus size={14} className="text-white" />
        <span className="text-sm font-medium text-white">{addLabel}</span>
      </button>
    </div>
  );
}
