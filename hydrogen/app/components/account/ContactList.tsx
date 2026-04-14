'use client';

import {List} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {ContactCard} from './ContactCard';
import {AddContactCard} from './AddContactCard';
import type {AddressBookContact} from '~/lib/address-book';

interface ContactListProps {
  contacts: AddressBookContact[];
  sectionLabel: string;
  onAdd: () => void;
  onEdit: (contact: AddressBookContact) => void;
  onDelete: (contactId: string) => void;
  // Selection mode
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onEnterSelectionMode?: () => void;
  onExitSelectionMode?: () => void;
}

export function ContactList({
  contacts,
  sectionLabel,
  onAdd,
  onEdit,
  onDelete,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEnterSelectionMode,
  onExitSelectionMode,
}: ContactListProps) {
  const {t} = useTranslation('common');
  const allSelected =
    contacts.length > 0 && contacts.every((c) => selectedIds?.has(c.id));
  const someSelected =
    !allSelected && contacts.some((c) => selectedIds?.has(c.id));
  const selectedCount = selectedIds?.size ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectionMode && (
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={onSelectAll}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-primary"
              aria-label={t('contactList.selectAll')}
            />
          )}
          <List size={16} className="text-gray-400" />
          <span className="text-[16px] font-medium leading-6 text-gray-700">
            {sectionLabel}
          </span>
          {selectionMode && (
            <span className="text-[13px] text-gray-400">
              {t('contactList.selectionCount', {
                selectedCount,
                total: contacts.length,
              })}
            </span>
          )}
        </div>

        {contacts.length > 0 && (
          <div>
            {selectionMode ? (
              <button
                type="button"
                onClick={onExitSelectionMode}
                className="text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('contactList.cancel')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEnterSelectionMode}
                className="text-[13px] font-medium text-secondary hover:text-primary transition-colors"
                title={t('contactList.selectTitle')}
              >
                {t('contactList.select')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            selected={
              selectionMode
                ? (selectedIds?.has(contact.id) ?? false)
                : undefined
            }
            onToggleSelect={selectionMode ? onToggleSelect : undefined}
          />
        ))}
        <AddContactCard onAdd={onAdd} />
      </div>
    </div>
  );
}
