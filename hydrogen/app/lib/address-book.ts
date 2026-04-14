// ============================================================================
// Address Book — Types, constants, helpers, and validation schemas
// ============================================================================

import {z} from 'zod';

// ── Types ──────────────────────────────────────────────────────────────────

export type AddressCategory = 'home' | 'family' | 'friends' | 'work' | 'other';

export type FamilySubcategory =
  | 'parents'
  | 'siblings'
  | 'children'
  | 'aunts_uncles'
  | 'cousins'
  | 'grandparents';

export type OtherSubcategory =
  | 'hotel'
  | 'po_box'
  | 'amazon_dropbox'
  | 'campground';

export type FamilyRelationship =
  | 'mother'
  | 'father'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'aunt'
  | 'uncle'
  | 'grandmother'
  | 'grandfather'
  | 'cousin';

export interface ContactPhone {
  id: string;
  primary: boolean;
  number: string;
}

export interface ContactEmail {
  id: string;
  primary: boolean;
  email: string;
}

export interface ContactAddress {
  id: string;
  primary: boolean;
  shopifyAddressId?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AddressBookContact {
  id: string;
  category: AddressCategory;
  subcategory?: FamilySubcategory | OtherSubcategory;
  relationship?: FamilyRelationship;
  firstName: string;
  lastName: string;
  addresses: ContactAddress[];
  phones: ContactPhone[];
  emails: ContactEmail[];
}

export interface AddressBook {
  version: 1;
  contacts: AddressBookContact[];
  /**
   * Tombstone of Shopify address IDs that were explicitly deleted by the user.
   * The loader sync skips these IDs so it never recreates a contact from an
   * address the user removed. Entries are pruned once the ID disappears from
   * Shopify's address list (confirming the deletion went through).
   */
  deletedShopifyIds?: string[];
  surveyResponse?: {
    source: 'social_media' | 'search' | 'referral' | 'other';
    platform?: string;
    referrerPhone?: string;
    answeredAt: string;
  };
}

// ── Constants ──────────────────────────────────────────────────────────────

export const ADDRESS_CATEGORIES: {value: AddressCategory; label: string}[] = [
  {value: 'home', label: 'Home'},
  {value: 'family', label: 'Family'},
  {value: 'friends', label: 'Friends'},
  {value: 'work', label: 'Work'},
  {value: 'other', label: 'Other'},
];

export const FAMILY_SUBCATEGORIES: {
  value: FamilySubcategory;
  label: string;
  relationships: {value: FamilyRelationship; label: string}[];
}[] = [
  {
    value: 'parents',
    label: 'Parents',
    relationships: [
      {value: 'mother', label: 'Mom'},
      {value: 'father', label: 'Dad'},
    ],
  },
  {
    value: 'siblings',
    label: 'Siblings',
    relationships: [
      {value: 'brother', label: 'Brother'},
      {value: 'sister', label: 'Sister'},
    ],
  },
  {
    value: 'children',
    label: 'Children',
    relationships: [
      {value: 'son', label: 'Son'},
      {value: 'daughter', label: 'Daughter'},
    ],
  },
  {
    value: 'aunts_uncles',
    label: 'Aunts/Uncles',
    relationships: [
      {value: 'aunt', label: 'Aunt'},
      {value: 'uncle', label: 'Uncle'},
    ],
  },
  {
    value: 'cousins',
    label: 'Cousins',
    relationships: [{value: 'cousin', label: 'Cousin'}],
  },
  {
    value: 'grandparents',
    label: 'Grandparents',
    relationships: [
      {value: 'grandmother', label: 'Grandmother'},
      {value: 'grandfather', label: 'Grandfather'},
    ],
  },
];

export const OTHER_SUBCATEGORIES: {
  value: OtherSubcategory;
  label: string;
}[] = [
  {value: 'hotel', label: 'Hotel'},
  {value: 'po_box', label: 'PO Box'},
  {value: 'amazon_dropbox', label: 'Amazon Dropbox'},
  {value: 'campground', label: 'Campground'},
];

// ── Relationship Label Map ─────────────────────────────────────────────────

const RELATIONSHIP_LABELS: Record<FamilyRelationship, string> = {
  mother: 'Mom',
  father: 'Dad',
  brother: 'Brother',
  sister: 'Sister',
  son: 'Son',
  daughter: 'Daughter',
  aunt: 'Aunt',
  uncle: 'Uncle',
  grandmother: 'Grandmother',
  grandfather: 'Grandfather',
  cousin: 'Cousin',
};

const OTHER_SUBCATEGORY_LABELS: Record<OtherSubcategory, string> = {
  hotel: 'Hotel',
  po_box: 'PO Box',
  amazon_dropbox: 'Amazon Dropbox',
  campground: 'Campground',
};

// ── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_BOOK: AddressBook = {version: 1, contacts: []};

export function parseAddressBook(value: string | null): AddressBook {
  if (!value) return {...EMPTY_BOOK, contacts: []};
  try {
    const parsed = JSON.parse(value) as AddressBook;
    if (!parsed.contacts || !Array.isArray(parsed.contacts)) {
      return {...EMPTY_BOOK, contacts: []};
    }
    return parsed;
  } catch {
    return {...EMPTY_BOOK, contacts: []};
  }
}

export function serializeAddressBook(book: AddressBook): string {
  return JSON.stringify(book);
}

export function getContactsByCategory(
  book: AddressBook,
  category: AddressCategory,
): AddressBookContact[] {
  return book.contacts.filter((c) => c.category === category);
}

export function getContactsBySubcategory(
  book: AddressBook,
  category: AddressCategory,
  subcategory: FamilySubcategory | OtherSubcategory,
): AddressBookContact[] {
  return book.contacts.filter(
    (c) => c.category === category && c.subcategory === subcategory,
  );
}

export function generateContactLabel(contact: AddressBookContact): string {
  if (contact.category === 'other' && contact.subcategory) {
    return (
      OTHER_SUBCATEGORY_LABELS[contact.subcategory as OtherSubcategory] ??
      contact.firstName
    );
  }

  if (contact.relationship) {
    const label = RELATIONSHIP_LABELS[contact.relationship];
    // For relationships that can have multiple people (brother, sister, cousin,
    // aunt, uncle), append the first name to disambiguate.
    const multipleAllowed: FamilyRelationship[] = [
      'brother',
      'sister',
      'son',
      'daughter',
      'cousin',
      'aunt',
      'uncle',
    ];
    if (multipleAllowed.includes(contact.relationship)) {
      return `${label} — ${contact.firstName}`;
    }
    return label;
  }

  return `${contact.firstName} ${contact.lastName}`.trim();
}

export function setPrimaryAddress(
  contact: AddressBookContact,
  addressId: string,
): AddressBookContact {
  return {
    ...contact,
    addresses: contact.addresses.map((a) => ({
      ...a,
      primary: a.id === addressId,
    })),
  };
}

export function getPrimaryAddress(
  contact: AddressBookContact,
): ContactAddress | undefined {
  return contact.addresses.find((a) => a.primary) ?? contact.addresses[0];
}

export function getPrimaryPhone(
  contact: AddressBookContact,
): ContactPhone | undefined {
  return contact.phones.find((p) => p.primary) ?? contact.phones[0];
}

export function getPrimaryEmail(
  contact: AddressBookContact,
): ContactEmail | undefined {
  return contact.emails.find((e) => e.primary) ?? contact.emails[0];
}

// ── Zod Schemas ────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  id: z.string(),
  primary: z.boolean(),
  shopifyAddressId: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const PhoneSchema = z.object({
  id: z.string(),
  primary: z.boolean(),
  number: z.string().min(1, 'Phone number is required'),
});

export const EmailSchema = z.object({
  id: z.string(),
  primary: z.boolean(),
  email: z.string().email('Invalid email address'),
});

export const ContactFormSchema = z.object({
  category: z.enum(['home', 'family', 'friends', 'work', 'other']),
  subcategory: z
    .enum([
      'parents',
      'siblings',
      'children',
      'aunts_uncles',
      'cousins',
      'grandparents',
      'hotel',
      'po_box',
      'amazon_dropbox',
      'campground',
    ])
    .optional(),
  relationship: z
    .enum([
      'mother',
      'father',
      'brother',
      'sister',
      'son',
      'daughter',
      'aunt',
      'uncle',
      'grandmother',
      'grandfather',
      'cousin',
    ])
    .optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  addresses: z.array(AddressSchema).min(1, 'At least one address is required'),
  phones: z.array(PhoneSchema),
  emails: z.array(EmailSchema),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

export const SurveyResponseSchema = z.object({
  source: z.enum(['social_media', 'search', 'referral', 'other']),
  platform: z.string().optional(),
  referrerPhone: z.string().optional(),
});

export type SurveyFormData = z.infer<typeof SurveyResponseSchema>;
