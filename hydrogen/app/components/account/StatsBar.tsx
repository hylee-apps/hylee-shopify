'use client';

import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

interface StatCardProps {
  icon: ComponentType<LucideProps>;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  value: number;
}

function StatCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 bg-white p-4.25">
      <div
        className={`flex size-9 items-center justify-center rounded-lg ${iconBgClass}`}
      >
        <Icon size={16} className={iconColorClass} />
      </div>
      <div>
        <div className="text-xs font-normal uppercase leading-[18px] tracking-[0.5px] text-gray-500">
          {label}
        </div>
        <div className="text-lg font-semibold leading-[27px] text-gray-900">
          {value}
        </div>
      </div>
    </div>
  );
}

export interface StatConfig {
  icon: ComponentType<LucideProps>;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  value: number;
}

interface StatsBarProps {
  stats: [StatConfig, StatConfig, StatConfig];
}

export function StatsBar({stats}: StatsBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
