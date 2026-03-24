'use client';

import {List} from 'lucide-react';
import {ContactCard} from './ContactCard';
import {AddContactCard} from './AddContactCard';
import type {AddressBookContact} from '~/lib/address-book';

interface ContactListProps {
  contacts: AddressBookContact[];
  sectionLabel: string;
  onAdd: () => void;
  onEdit: (contact: AddressBookContact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactList({
  contacts,
  sectionLabel,
  onAdd,
  onEdit,
  onDelete,
}: ContactListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <List size={16} className="text-gray-400" />
        <span className="text-[16px] font-medium leading-6 text-gray-700">
          {sectionLabel}
        </span>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        <AddContactCard onAdd={onAdd} />
      </div>
    </div>
  );
}
