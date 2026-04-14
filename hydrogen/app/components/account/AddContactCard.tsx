'use client';

import {Plus} from 'lucide-react';
import {useTranslation} from 'react-i18next';

interface AddContactCardProps {
  onAdd: () => void;
}

export function AddContactCard({onAdd}: AddContactCardProps) {
  const {t} = useTranslation('common');

  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 shadow-sm transition-colors hover:border-[#4fd1a8]"
    >
      <div className="mb-3 flex size-15 items-center justify-center rounded-full bg-white shadow-sm">
        <Plus size={24} className="text-[#4fd1a8]" />
      </div>
      <h3 className="mb-1 text-[16px] font-medium leading-6 text-gray-700">
        {t('addContactCard.heading')}
      </h3>
      <p className="text-sm leading-[21px] text-gray-500">
        {t('addContactCard.body')}
      </p>
    </button>
  );
}
