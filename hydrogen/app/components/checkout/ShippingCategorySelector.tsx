'use client';

import {useState, useEffect} from 'react';
import {Home, Users, Heart, Briefcase, MoreHorizontal} from 'lucide-react';
import {Card} from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {cn} from '~/lib/utils';
import {
  ADDRESS_CATEGORIES,
  getContactsByCategory,
  generateContactLabel,
  getPrimaryAddress,
} from '~/lib/address-book';
import type {
  AddressBook,
  AddressCategory,
  AddressBookContact,
} from '~/lib/address-book';
import type {ShippingAddress} from '~/lib/checkout';
import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

const CATEGORY_ICONS: Record<AddressCategory, ComponentType<LucideProps>> = {
  home: Home,
  family: Users,
  friends: Heart,
  work: Briefcase,
  other: MoreHorizontal,
};

interface ShippingCategorySelectorProps {
  book: AddressBook | null;
  defaultCategory?: string | null;
  defaultContactId?: string | null;
  onAddressFill?: (address: ShippingAddress) => void;
}

export function ShippingCategorySelector({
  book,
  defaultCategory,
  defaultContactId,
  onAddressFill,
}: ShippingCategorySelectorProps) {
  const [category, setCategory] = useState<AddressCategory | null>(
    (defaultCategory as AddressCategory) ?? null,
  );
  const [selectedContactId, setSelectedContactId] = useState<string>(
    defaultContactId ?? '',
  );

  const contacts =
    category && book ? getContactsByCategory(book, category) : [];

  // When a contact is selected, auto-fill the shipping form
  useEffect(() => {
    if (!selectedContactId || !book || !onAddressFill) return;

    const contact = book.contacts.find((c) => c.id === selectedContactId);
    if (!contact) return;

    const addr = getPrimaryAddress(contact);
    if (!addr) return;

    const primaryPhone =
      contact.phones.find((p) => p.primary) ?? contact.phones[0];
    const primaryEmail =
      contact.emails.find((e) => e.primary) ?? contact.emails[0];

    onAddressFill({
      firstName: contact.firstName,
      lastName: contact.lastName,
      address1: addr.address1,
      address2: addr.address2 ?? '',
      city: addr.city,
      zip: addr.zip,
      state: addr.state,
      phone: primaryPhone?.number ?? '',
      email: primaryEmail?.email ?? '',
    });
  }, [selectedContactId, book, onAddressFill]);

  return (
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">
          Who is this shipment for?
        </h2>
      </div>

      <div className="flex flex-col gap-5 px-6 py-6">
        {/* Category buttons */}
        <div className="flex flex-wrap gap-2">
          {ADDRESS_CATEGORIES.map(({value, label}) => {
            const Icon = CATEGORY_ICONS[value];
            const isActive = category === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCategory(value);
                  setSelectedContactId('');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-secondary bg-secondary/5 text-secondary'
                    : 'border-border text-[#4b5563] hover:border-secondary/40',
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="shippingCategory" value={category ?? ''} />
        <input
          type="hidden"
          name="shippingRecipientLabel"
          value={
            selectedContactId && book
              ? (generateContactLabel(
                  book.contacts.find((c) => c.id === selectedContactId)!,
                ) ?? '')
              : ''
          }
        />
        <input
          type="hidden"
          name="shippingContactId"
          value={selectedContactId}
        />

        {/* Contact selector (logged-in users with saved contacts) */}
        {category && contacts.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">
              Select a saved contact
            </label>
            <Select
              value={selectedContactId}
              onValueChange={setSelectedContactId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a recipient or enter manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">New recipient</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {generateContactLabel(contact)} — {contact.firstName}{' '}
                    {contact.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {category && contacts.length === 0 && book && (
          <p className="text-sm text-[#6b7280]">
            No saved contacts in this category. Enter the address manually
            below.
          </p>
        )}
      </div>
    </Card>
  );
}
