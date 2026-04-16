'use client';

import {Form} from 'react-router';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Plus, Trash2} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  ADDRESS_CATEGORIES,
  FAMILY_SUBCATEGORIES,
  OTHER_SUBCATEGORIES,
} from '~/lib/address-book';
import type {
  AddressBookContact,
  AddressCategory,
  FamilySubcategory,
  OtherSubcategory,
} from '~/lib/address-book';

// ── US States ────────────────────────────────────────────────────────────────

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
] as const;

// ── Props ────────────────────────────────────────────────────────────────────

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: AddressBookContact | null;
  defaultCategory?: AddressCategory;
  defaultSubcategory?: FamilySubcategory | OtherSubcategory;
  isSubmitting: boolean;
  errors?: Array<{field: string; message: string}>;
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  defaultCategory,
  defaultSubcategory,
  isSubmitting,
  errors,
}: ContactFormDialogProps) {
  const {t} = useTranslation();
  const isEdit = !!contact;
  const intent = isEdit ? 'updateContact' : 'createContact';

  const [category, setCategory] = useState<AddressCategory>(
    contact?.category ?? defaultCategory ?? 'home',
  );
  const [subcategory, setSubcategory] = useState<string>(
    contact?.subcategory ?? defaultSubcategory ?? '',
  );
  const [relationship, setRelationship] = useState<string>(
    contact?.relationship ?? '',
  );

  // Dynamic address rows
  const [addresses, setAddresses] = useState(
    contact?.addresses ?? [
      {
        id: crypto.randomUUID(),
        primary: true,
        address1: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
    ],
  );

  // Dynamic phone rows
  const [phones, setPhones] = useState(contact?.phones ?? []);

  // Dynamic email rows
  const [emails, setEmails] = useState(contact?.emails ?? []);

  const familySub = FAMILY_SUBCATEGORIES.find((s) => s.value === subcategory);
  const showSubcategory = category === 'family' || category === 'other';
  const showRelationship = category === 'family' && familySub;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('contactForm.titleEdit') : t('contactForm.titleAdd')}
          </DialogTitle>
        </DialogHeader>

        <Form method="post" className="space-y-5">
          <input type="hidden" name="intent" value={intent} />
          {contact?.id && (
            <input type="hidden" name="contactId" value={contact.id} />
          )}

          {errors && errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errors.map((e, i) => (
                <p key={i}>{e.message}</p>
              ))}
            </div>
          )}

          {/* Category */}
          <div>
            <Label>{t('contactForm.category')}</Label>
            <Select
              name="category"
              value={category}
              onValueChange={(val) => {
                setCategory(val as AddressCategory);
                setSubcategory('');
                setRelationship('');
              }}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADDRESS_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {showSubcategory && (
            <div>
              <Label>
                {category === 'family'
                  ? t('contactForm.subcategoryFamily')
                  : t('contactForm.subcategoryOther')}
              </Label>
              <Select
                name="subcategory"
                value={subcategory}
                onValueChange={(val) => {
                  setSubcategory(val);
                  setRelationship('');
                }}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue
                    placeholder={t('contactForm.subcategoryPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(category === 'family'
                    ? FAMILY_SUBCATEGORIES
                    : OTHER_SUBCATEGORIES
                  ).map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Relationship (Family only) */}
          {showRelationship && familySub && (
            <div>
              <Label>{t('contactForm.relationship')}</Label>
              <RadioGroup
                name="relationship"
                value={relationship}
                onValueChange={setRelationship}
                className="mt-1.5 flex gap-4"
              >
                {familySub.relationships.map((r) => (
                  <div key={r.value} className="flex items-center gap-2">
                    <RadioGroupItem value={r.value} id={`rel-${r.value}`} />
                    <Label
                      htmlFor={`rel-${r.value}`}
                      className="cursor-pointer"
                    >
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cf-firstName">{t('contactForm.firstName')}</Label>
              <Input
                id="cf-firstName"
                name="firstName"
                defaultValue={contact?.firstName ?? ''}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cf-lastName">{t('contactForm.lastName')}</Label>
              <Input
                id="cf-lastName"
                name="lastName"
                defaultValue={contact?.lastName ?? ''}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Addresses */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-dark">
              {t('contactForm.addresses.legend')}
            </legend>
            {addresses.map((addr, idx) => (
              <div
                key={addr.id}
                className="rounded-md border border-border p-4 space-y-3"
              >
                <input
                  type="hidden"
                  name={`addresses[${idx}].id`}
                  value={addr.id}
                />
                <input
                  type="hidden"
                  name={`addresses[${idx}].primary`}
                  value={addr.primary ? 'true' : 'false'}
                />
                {addr.shopifyAddressId && (
                  <input
                    type="hidden"
                    name={`addresses[${idx}].shopifyAddressId`}
                    value={addr.shopifyAddressId}
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">
                    {addr.primary
                      ? t('contactForm.addresses.primaryLabel')
                      : t('contactForm.addresses.indexLabel', {
                          number: idx + 1,
                        })}
                  </span>
                  {addresses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setAddresses((prev) =>
                          prev.filter((a) => a.id !== addr.id),
                        )
                      }
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`addr1-${addr.id}`}>
                    {t('contactForm.addresses.streetAddress')}
                  </Label>
                  <Input
                    id={`addr1-${addr.id}`}
                    name={`addresses[${idx}].address1`}
                    defaultValue={addr.address1}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`addr2-${addr.id}`}>
                    {t('contactForm.addresses.apt')}
                  </Label>
                  <Input
                    id={`addr2-${addr.id}`}
                    name={`addresses[${idx}].address2`}
                    defaultValue={addr.address2 ?? ''}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`city-${addr.id}`}>
                      {t('contactForm.addresses.city')}
                    </Label>
                    <Input
                      id={`city-${addr.id}`}
                      name={`addresses[${idx}].city`}
                      defaultValue={addr.city}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`state-${addr.id}`}>
                      {t('contactForm.addresses.state')}
                    </Label>
                    <Select
                      name={`addresses[${idx}].state`}
                      defaultValue={addr.state || undefined}
                    >
                      <SelectTrigger
                        id={`state-${addr.id}`}
                        className="mt-1 w-full"
                      >
                        <SelectValue
                          placeholder={t(
                            'contactForm.addresses.statePlaceholder',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`zip-${addr.id}`}>
                      {t('contactForm.addresses.zip')}
                    </Label>
                    <Input
                      id={`zip-${addr.id}`}
                      name={`addresses[${idx}].zip`}
                      defaultValue={addr.zip}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`country-${addr.id}`}>
                      {t('contactForm.addresses.country')}
                    </Label>
                    <Select
                      name={`addresses[${idx}].country`}
                      defaultValue={addr.country || 'US'}
                    >
                      <SelectTrigger
                        id={`country-${addr.id}`}
                        className="mt-1 w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">
                          {t('contactForm.addresses.countryUS')}
                        </SelectItem>
                        <SelectItem value="CA">
                          {t('contactForm.addresses.countryCA')}
                        </SelectItem>
                        <SelectItem value="GB">
                          {t('contactForm.addresses.countryGB')}
                        </SelectItem>
                        <SelectItem value="AU">
                          {t('contactForm.addresses.countryAU')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setAddresses((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    primary: false,
                    address1: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'US',
                  },
                ])
              }
            >
              <Plus size={14} className="mr-1" />
              {t('contactForm.addresses.addAnother')}
            </Button>
          </fieldset>

          {/* Phones */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-dark">
              {t('contactForm.phones.legend')}
            </legend>
            {phones.map((phone, idx) => (
              <div key={phone.id} className="flex items-end gap-2">
                <input
                  type="hidden"
                  name={`phones[${idx}].id`}
                  value={phone.id}
                />
                <input
                  type="hidden"
                  name={`phones[${idx}].primary`}
                  value={phone.primary ? 'true' : 'false'}
                />
                <div className="flex-1">
                  <Label htmlFor={`phone-${phone.id}`}>
                    {phone.primary
                      ? t('contactForm.phones.labelPrimary')
                      : t('contactForm.phones.label')}
                  </Label>
                  <Input
                    id={`phone-${phone.id}`}
                    name={`phones[${idx}].number`}
                    type="tel"
                    defaultValue={phone.number}
                    placeholder={t('contactForm.phones.placeholder')}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() =>
                    setPhones((prev) => prev.filter((p) => p.id !== phone.id))
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPhones((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    primary: prev.length === 0,
                    number: '',
                  },
                ])
              }
            >
              <Plus size={14} className="mr-1" />
              {t('contactForm.phones.add')}
            </Button>
          </fieldset>

          {/* Emails */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-dark">
              {t('contactForm.emails.legend')}
            </legend>
            {emails.map((email, idx) => (
              <div key={email.id} className="flex items-end gap-2">
                <input
                  type="hidden"
                  name={`emails[${idx}].id`}
                  value={email.id}
                />
                <input
                  type="hidden"
                  name={`emails[${idx}].primary`}
                  value={email.primary ? 'true' : 'false'}
                />
                <div className="flex-1">
                  <Label htmlFor={`email-${email.id}`}>
                    {email.primary
                      ? t('contactForm.emails.labelPrimary')
                      : t('contactForm.emails.label')}
                  </Label>
                  <Input
                    id={`email-${email.id}`}
                    name={`emails[${idx}].email`}
                    type="email"
                    defaultValue={email.email}
                    placeholder={t('contactForm.emails.placeholder')}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() =>
                    setEmails((prev) => prev.filter((e) => e.id !== email.id))
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setEmails((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    primary: prev.length === 0,
                    email: '',
                  },
                ])
              }
            >
              <Plus size={14} className="mr-1" />
              {t('contactForm.emails.add')}
            </Button>
          </fieldset>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              {t('contactForm.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('contactForm.submitting')
                : isEdit
                  ? t('contactForm.submitEdit')
                  : t('contactForm.submitAdd')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
