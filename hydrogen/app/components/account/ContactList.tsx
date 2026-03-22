'use client';

import {Plus, MapPin} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {ContactCard} from './ContactCard';
import type {AddressBookContact} from '~/lib/address-book';

interface ContactListProps {
  contacts: AddressBookContact[];
  categoryLabel: string;
  onAdd: () => void;
  onEdit: (contact: AddressBookContact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactList({
  contacts,
  categoryLabel,
  onAdd,
  onEdit,
  onDelete,
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <MapPin size={48} className="mb-3 text-text-muted" />
        <p className="mb-4 text-text-muted">
          No contacts yet. Add one to get started.
        </p>
        <Button variant="outline" onClick={onAdd}>
          <Plus size={16} className="mr-1" />
          Add {categoryLabel}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="mt-4">
        <Button variant="outline" onClick={onAdd}>
          <Plus size={16} className="mr-1" />
          Add {categoryLabel}
        </Button>
      </div>
    </div>
  );
}
