'use client';

import {Pencil, Trash2} from 'lucide-react';
import {
  generateContactLabel,
  getPrimaryAddress,
  getPrimaryPhone,
  getPrimaryEmail,
} from '~/lib/address-book';
import type {AddressBookContact, ContactAddress} from '~/lib/address-book';

interface ContactCardProps {
  contact: AddressBookContact;
  onEdit: (contact: AddressBookContact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactCard({contact, onEdit, onDelete}: ContactCardProps) {
  const label = generateContactLabel(contact);
  const primaryAddress = getPrimaryAddress(contact);
  const primaryPhone = getPrimaryPhone(contact);
  const primaryEmail = getPrimaryEmail(contact);
  const hasMultipleAddresses = contact.addresses.length > 1;
  const hasMultiplePhones = contact.phones.length > 1;
  const hasMultipleEmails = contact.emails.length > 1;

  return (
    <div className="overflow-clip rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 pt-4 pb-4.25">
        <span className="text-[16px] font-semibold leading-6 text-gray-900">
          {label}
        </span>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => onEdit(contact)}
            className="flex size-8 items-center justify-center rounded-lg bg-[#4fd1a8] transition-opacity hover:opacity-90"
          >
            <Pencil size={13} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(contact.id)}
            className="flex size-8 items-center justify-center rounded-lg bg-red-100 transition-opacity hover:opacity-80"
          >
            <Trash2 size={13} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-4 p-5">
        {/* Address Row */}
        {primaryAddress && (
          <InfoRow
            label="Address"
            value={formatAddress(primaryAddress)}
            sideLabel={hasMultipleAddresses ? 'Other Address' : undefined}
            hasBorder
          />
        )}

        {/* Phone Row */}
        {primaryPhone && (
          <InfoRow
            label="Phone"
            value={primaryPhone.number}
            sideLabel={hasMultiplePhones ? 'Other Numbers' : undefined}
            hasBorder={!!primaryEmail}
          />
        )}

        {/* Email Row */}
        {primaryEmail && (
          <InfoRow
            label="Email"
            value={primaryEmail.email}
            sideLabel={hasMultipleEmails ? 'Other Email' : undefined}
            hasBorder={false}
          />
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  sideLabel?: string;
  hasBorder: boolean;
}

function InfoRow({label, value, sideLabel, hasBorder}: InfoRowProps) {
  return (
    <div
      className={`flex items-start justify-between ${hasBorder ? 'border-b border-gray-100 pb-4' : ''}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-normal uppercase leading-[18px] tracking-[0.5px] text-gray-500">
          {label}
        </span>
        <span className="whitespace-pre-line text-sm font-normal leading-[22.4px] text-gray-700">
          {value}
        </span>
      </div>
      {sideLabel && (
        <span className="shrink-0 pl-4 text-[11px] font-normal uppercase leading-[16.5px] tracking-[0.5px] text-right text-gray-400">
          {sideLabel}
        </span>
      )}
    </div>
  );
}

function formatAddress(addr: ContactAddress): string {
  const line1 = addr.address1;
  const line2 = addr.address2 ? `${addr.address2}\n` : '';
  const cityLine = `${addr.city}, ${addr.state} ${addr.zip}`;
  return line2 ? `${line1}\n${line2}${cityLine}` : `${line1}\n${cityLine}`;
}
