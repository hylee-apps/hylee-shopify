'use client';

import {Form} from 'react-router';
import {MapPin, Phone, Mail, Star, Pencil, Trash2} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
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
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const primaryAddress = getPrimaryAddress(contact);
  const primaryPhone = getPrimaryPhone(contact);
  const primaryEmail = getPrimaryEmail(contact);
  const additionalAddresses = contact.addresses.filter((a) => !a.primary);

  return (
    <div className="rounded-lg border border-border p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-medium text-dark">{label}</h3>
          {label !== fullName && fullName && (
            <p className="text-sm text-text-muted">{fullName}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(contact)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-muted hover:text-red-600"
            onClick={() => onDelete(contact.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Primary address */}
      {primaryAddress && (
        <div className="mb-2 flex items-start gap-2 text-sm text-text">
          <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
          <span>{formatAddress(primaryAddress)}</span>
        </div>
      )}

      {/* Phone */}
      {primaryPhone && (
        <div className="mb-2 flex items-center gap-2 text-sm text-text">
          <Phone size={14} className="shrink-0 text-text-muted" />
          <span>{primaryPhone.number}</span>
        </div>
      )}

      {/* Email */}
      {primaryEmail && (
        <div className="mb-2 flex items-center gap-2 text-sm text-text">
          <Mail size={14} className="shrink-0 text-text-muted" />
          <span>{primaryEmail.email}</span>
        </div>
      )}

      {/* Additional addresses */}
      {additionalAddresses.length > 0 && (
        <Accordion type="single" collapsible className="mt-3">
          <AccordionItem value="addresses" className="border-none">
            <AccordionTrigger className="py-2 text-sm text-text-muted hover:text-primary">
              {additionalAddresses.length} more address
              {additionalAddresses.length > 1 ? 'es' : ''}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {additionalAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between text-sm text-text"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-text-muted"
                      />
                      <span>{formatAddress(addr)}</span>
                    </div>
                    <Form method="post">
                      <input type="hidden" name="intent" value="setPrimary" />
                      <input
                        type="hidden"
                        name="contactId"
                        value={contact.id}
                      />
                      <input type="hidden" name="addressId" value={addr.id} />
                      <button
                        type="submit"
                        className="ml-2 shrink-0 text-text-muted hover:text-primary"
                        title="Set as primary"
                      >
                        <Star size={14} />
                      </button>
                    </Form>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

function formatAddress(addr: ContactAddress): string {
  const parts = [addr.address1];
  if (addr.address2) parts.push(addr.address2);
  parts.push(`${addr.city}, ${addr.state} ${addr.zip}`);
  if (addr.country && addr.country !== 'US') parts.push(addr.country);
  return parts.join(', ');
}
