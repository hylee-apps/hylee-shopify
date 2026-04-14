'use client';

import {useState, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
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
import type {AddressBook, AddressCategory} from '~/lib/address-book';
import type {ShippingAddress} from '~/lib/checkout';
import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

/** Native Shopify address from the Customer Account API (Storefront API shape) */
export interface SavedShippingAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  /** State/province code — `provinceCode` from the Storefront API */
  provinceCode?: string | null;
  zip?: string | null;
  /** Customer's phone associated with this address */
  phone?: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<AddressCategory, ComponentType<LucideProps>> = {
  home: Home,
  family: Users,
  friends: Heart,
  work: Briefcase,
  other: MoreHorizontal,
};

// ── Component ────────────────────────────────────────────────────────────────

interface ShippingCategorySelectorProps {
  book: AddressBook | null;
  /** Native Shopify addresses for logged-in users (shown under Home category) */
  savedAddresses?: SavedShippingAddress[];
  defaultCategory?: string | null;
  defaultContactId?: string | null;
  onAddressFill?: (address: ShippingAddress) => void;
}

export function ShippingCategorySelector({
  book,
  savedAddresses = [],
  defaultCategory,
  defaultContactId,
  onAddressFill,
}: ShippingCategorySelectorProps) {
  const {t} = useTranslation('common');
  const [category, setCategory] = useState<AddressCategory | null>(
    (defaultCategory as AddressCategory) ?? null,
  );
  const [selectedId, setSelectedId] = useState<string>(defaultContactId ?? '');

  // Merge address book contacts with native Shopify addresses for the dropdown
  const bookContacts =
    category && book ? getContactsByCategory(book, category) : [];

  // Build a unified list of dropdown items for the selected category
  const dropdownItems = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      source: 'book' | 'shopify';
    }> = [];

    // Address book contacts for this category
    for (const contact of bookContacts) {
      items.push({
        id: contact.id,
        label: `${contact.firstName} ${contact.lastName}`,
        source: 'book',
      });
    }

    // Native Shopify addresses shown under "Home" category (since they have no category)
    if (category === 'home') {
      for (const addr of savedAddresses) {
        // Skip if this Shopify address is already represented in the address book
        const alreadyInBook = bookContacts.some(
          (c) => c.firstName === addr.firstName && c.lastName === addr.lastName,
        );
        if (alreadyInBook) continue;

        const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ');
        if (!name) continue;

        items.push({
          id: `shopify:${addr.id}`,
          label: name,
          source: 'shopify',
        });
      }
    }

    return items;
  }, [bookContacts, savedAddresses, category]);

  // When a selection is made, auto-fill the shipping form
  useEffect(() => {
    if (!selectedId || selectedId === '__new__' || !onAddressFill) return;

    // Check if it's a native Shopify address
    if (selectedId.startsWith('shopify:')) {
      const shopifyId = selectedId.replace('shopify:', '');
      const addr = savedAddresses.find((a) => a.id === shopifyId);
      if (!addr) return;

      onAddressFill({
        firstName: addr.firstName ?? '',
        lastName: addr.lastName ?? '',
        address1: addr.address1 ?? '',
        address2: addr.address2 ?? '',
        city: addr.city ?? '',
        zip: addr.zip ?? '',
        state: addr.provinceCode ?? '',
        phone: addr.phone ?? '',
        email: '',
      });
      return;
    }

    // Address book contact
    if (!book) return;
    const contact = book.contacts.find((c) => c.id === selectedId);
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
  }, [selectedId, book, savedAddresses, onAddressFill]);

  // Derive recipient label for hidden input
  const recipientLabel = useMemo(() => {
    if (!selectedId || selectedId === '__new__') return '';
    if (selectedId.startsWith('shopify:')) {
      const shopifyId = selectedId.replace('shopify:', '');
      const addr = savedAddresses.find((a) => a.id === shopifyId);
      return addr
        ? [addr.firstName, addr.lastName].filter(Boolean).join(' ')
        : '';
    }
    if (book) {
      const contact = book.contacts.find((c) => c.id === selectedId);
      return contact ? (generateContactLabel(contact) ?? '') : '';
    }
    return '';
  }, [selectedId, book, savedAddresses]);

  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 pt-5 pb-[21px]">
        <h2 className="text-lg font-bold text-[#111827]">
          {t('shippingSelector.title')}
        </h2>
      </div>

      <div className="flex flex-col gap-5 px-6 py-6">
        {/* Category buttons */}
        <div className="flex flex-wrap gap-2">
          {ADDRESS_CATEGORIES.map(({value}) => {
            const Icon = CATEGORY_ICONS[value];
            const isActive = category === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCategory(value);
                  setSelectedId('');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-secondary bg-secondary/5 text-secondary'
                    : 'border-border text-[#4b5563] hover:border-secondary/40',
                )}
              >
                <Icon size={16} />
                {t(`addressBook.categories.${value}`)}
              </button>
            );
          })}
        </div>

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="shippingCategory" value={category ?? ''} />
        <input
          type="hidden"
          name="shippingRecipientLabel"
          value={recipientLabel}
        />
        <input
          type="hidden"
          name="shippingContactId"
          value={selectedId === '__new__' ? '' : selectedId}
        />

        {/* Contact/address selector (logged-in users with saved data) */}
        {category && dropdownItems.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">
              {t('shippingSelector.savedAddress.label')}
            </label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('shippingSelector.savedAddress.placeholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__new__">
                  {t('shippingSelector.savedAddress.newRecipient')}
                </SelectItem>
                {dropdownItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {category &&
          dropdownItems.length === 0 &&
          (book || savedAddresses.length > 0) && (
            <p className="text-sm text-[#6b7280]">
              {t('shippingSelector.noSavedAddresses')}
            </p>
          )}
      </div>
    </Card>
  );
}
