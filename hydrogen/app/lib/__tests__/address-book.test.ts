import {describe, it, expect} from 'vitest';
import {
  parseAddressBook,
  serializeAddressBook,
  getContactsByCategory,
  getContactsBySubcategory,
  generateContactLabel,
  setPrimaryAddress,
  getPrimaryAddress,
  getPrimaryPhone,
  getPrimaryEmail,
  ContactFormSchema,
  SurveyResponseSchema,
} from '../address-book';
import type {AddressBook, AddressBookContact} from '../address-book';

// ── Fixtures ───────────────────────────────────────────────────────────────

function makeContact(
  overrides: Partial<AddressBookContact> = {},
): AddressBookContact {
  return {
    id: 'contact-1',
    category: 'home',
    firstName: 'John',
    lastName: 'Doe',
    addresses: [
      {
        id: 'addr-1',
        primary: true,
        address1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
      },
    ],
    phones: [{id: 'phone-1', primary: true, number: '555-0100'}],
    emails: [{id: 'email-1', primary: true, email: 'john@example.com'}],
    ...overrides,
  };
}

function makeBook(contacts: AddressBookContact[] = []): AddressBook {
  return {version: 1, contacts};
}

// ── parseAddressBook ───────────────────────────────────────────────────────

describe('parseAddressBook', () => {
  it('returns empty book for null', () => {
    const book = parseAddressBook(null);
    expect(book).toEqual({version: 1, contacts: []});
  });

  it('returns empty book for empty string', () => {
    const book = parseAddressBook('');
    expect(book).toEqual({version: 1, contacts: []});
  });

  it('returns empty book for invalid JSON', () => {
    const book = parseAddressBook('{bad json');
    expect(book).toEqual({version: 1, contacts: []});
  });

  it('returns empty book for JSON without contacts array', () => {
    const book = parseAddressBook('{"version": 1}');
    expect(book).toEqual({version: 1, contacts: []});
  });

  it('parses valid address book JSON', () => {
    const contact = makeContact();
    const json = JSON.stringify(makeBook([contact]));
    const book = parseAddressBook(json);
    expect(book.contacts).toHaveLength(1);
    expect(book.contacts[0].firstName).toBe('John');
  });

  it('preserves survey response data', () => {
    const data: AddressBook = {
      version: 1,
      contacts: [],
      surveyResponse: {
        source: 'social_media',
        platform: 'instagram',
        answeredAt: '2026-03-22T00:00:00Z',
      },
    };
    const book = parseAddressBook(JSON.stringify(data));
    expect(book.surveyResponse?.source).toBe('social_media');
    expect(book.surveyResponse?.platform).toBe('instagram');
  });
});

// ── serializeAddressBook ───────────────────────────────────────────────────

describe('serializeAddressBook', () => {
  it('serializes to valid JSON', () => {
    const book = makeBook([makeContact()]);
    const json = serializeAddressBook(book);
    const parsed = JSON.parse(json) as AddressBook;
    expect(parsed.version).toBe(1);
    expect(parsed.contacts).toHaveLength(1);
  });

  it('roundtrips correctly', () => {
    const book = makeBook([makeContact({firstName: 'Jane'})]);
    const roundtripped = parseAddressBook(serializeAddressBook(book));
    expect(roundtripped.contacts[0].firstName).toBe('Jane');
  });
});

// ── getContactsByCategory ──────────────────────────────────────────────────

describe('getContactsByCategory', () => {
  it('filters contacts by category', () => {
    const book = makeBook([
      makeContact({id: '1', category: 'home'}),
      makeContact({id: '2', category: 'family', subcategory: 'parents'}),
      makeContact({id: '3', category: 'home'}),
      makeContact({id: '4', category: 'work'}),
    ]);

    expect(getContactsByCategory(book, 'home')).toHaveLength(2);
    expect(getContactsByCategory(book, 'family')).toHaveLength(1);
    expect(getContactsByCategory(book, 'work')).toHaveLength(1);
    expect(getContactsByCategory(book, 'friends')).toHaveLength(0);
  });
});

// ── getContactsBySubcategory ───────────────────────────────────────────────

describe('getContactsBySubcategory', () => {
  it('filters by category and subcategory', () => {
    const book = makeBook([
      makeContact({
        id: '1',
        category: 'family',
        subcategory: 'parents',
        relationship: 'mother',
      }),
      makeContact({
        id: '2',
        category: 'family',
        subcategory: 'siblings',
        relationship: 'brother',
      }),
      makeContact({
        id: '3',
        category: 'family',
        subcategory: 'parents',
        relationship: 'father',
      }),
    ]);

    const parents = getContactsBySubcategory(book, 'family', 'parents');
    expect(parents).toHaveLength(2);
    expect(parents.map((c) => c.relationship)).toEqual(['mother', 'father']);
  });

  it('returns empty for unmatched subcategory', () => {
    const book = makeBook([
      makeContact({id: '1', category: 'family', subcategory: 'parents'}),
    ]);
    expect(getContactsBySubcategory(book, 'family', 'cousins')).toHaveLength(0);
  });
});

// ── generateContactLabel ───────────────────────────────────────────────────

describe('generateContactLabel', () => {
  it('returns "Mom" for mother relationship', () => {
    const contact = makeContact({
      category: 'family',
      subcategory: 'parents',
      relationship: 'mother',
    });
    expect(generateContactLabel(contact)).toBe('Mom');
  });

  it('returns "Dad" for father relationship', () => {
    const contact = makeContact({
      category: 'family',
      subcategory: 'parents',
      relationship: 'father',
    });
    expect(generateContactLabel(contact)).toBe('Dad');
  });

  it('appends first name for multi-person relationships', () => {
    const contact = makeContact({
      category: 'family',
      subcategory: 'siblings',
      relationship: 'brother',
      firstName: 'Marcus',
    });
    expect(generateContactLabel(contact)).toBe('Brother — Marcus');
  });

  it('appends first name for sister', () => {
    const contact = makeContact({
      category: 'family',
      subcategory: 'siblings',
      relationship: 'sister',
      firstName: 'Sarah',
    });
    expect(generateContactLabel(contact)).toBe('Sister — Sarah');
  });

  it('appends first name for cousin', () => {
    const contact = makeContact({
      category: 'family',
      subcategory: 'cousins',
      relationship: 'cousin',
      firstName: 'Alex',
    });
    expect(generateContactLabel(contact)).toBe('Cousin — Alex');
  });

  it('returns subcategory label for other category', () => {
    const contact = makeContact({
      category: 'other',
      subcategory: 'hotel',
      firstName: 'Marriott',
    });
    expect(generateContactLabel(contact)).toBe('Hotel');
  });

  it('returns "PO Box" for po_box subcategory', () => {
    const contact = makeContact({
      category: 'other',
      subcategory: 'po_box',
    });
    expect(generateContactLabel(contact)).toBe('PO Box');
  });

  it('returns full name when no relationship set', () => {
    const contact = makeContact({
      category: 'friends',
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(generateContactLabel(contact)).toBe('Jane Smith');
  });

  it('returns full name for home category', () => {
    const contact = makeContact({
      category: 'home',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(generateContactLabel(contact)).toBe('John Doe');
  });
});

// ── setPrimaryAddress ──────────────────────────────────────────────────────

describe('setPrimaryAddress', () => {
  it('sets the specified address as primary and others as not', () => {
    const contact = makeContact({
      addresses: [
        {
          id: 'addr-1',
          primary: true,
          address1: '123 Main',
          city: 'A',
          state: 'IL',
          zip: '00000',
          country: 'US',
        },
        {
          id: 'addr-2',
          primary: false,
          address1: '456 Oak',
          city: 'B',
          state: 'IL',
          zip: '00001',
          country: 'US',
        },
      ],
    });

    const updated = setPrimaryAddress(contact, 'addr-2');
    expect(updated.addresses[0].primary).toBe(false);
    expect(updated.addresses[1].primary).toBe(true);
  });

  it('does not mutate the original contact', () => {
    const contact = makeContact();
    const updated = setPrimaryAddress(contact, 'addr-999');
    expect(updated).not.toBe(contact);
    expect(contact.addresses[0].primary).toBe(true);
  });
});

// ── getPrimary* helpers ────────────────────────────────────────────────────

describe('getPrimaryAddress', () => {
  it('returns the address marked primary', () => {
    const contact = makeContact({
      addresses: [
        {
          id: 'a1',
          primary: false,
          address1: '1',
          city: 'A',
          state: 'IL',
          zip: '0',
          country: 'US',
        },
        {
          id: 'a2',
          primary: true,
          address1: '2',
          city: 'B',
          state: 'IL',
          zip: '0',
          country: 'US',
        },
      ],
    });
    expect(getPrimaryAddress(contact)?.id).toBe('a2');
  });

  it('falls back to first address if none marked primary', () => {
    const contact = makeContact({
      addresses: [
        {
          id: 'a1',
          primary: false,
          address1: '1',
          city: 'A',
          state: 'IL',
          zip: '0',
          country: 'US',
        },
      ],
    });
    expect(getPrimaryAddress(contact)?.id).toBe('a1');
  });

  it('returns undefined for empty addresses', () => {
    const contact = makeContact({addresses: []});
    expect(getPrimaryAddress(contact)).toBeUndefined();
  });
});

describe('getPrimaryPhone', () => {
  it('returns phone marked primary', () => {
    const contact = makeContact({
      phones: [
        {id: 'p1', primary: false, number: '111'},
        {id: 'p2', primary: true, number: '222'},
      ],
    });
    expect(getPrimaryPhone(contact)?.number).toBe('222');
  });
});

describe('getPrimaryEmail', () => {
  it('returns email marked primary', () => {
    const contact = makeContact({
      emails: [
        {id: 'e1', primary: false, email: 'a@a.com'},
        {id: 'e2', primary: true, email: 'b@b.com'},
      ],
    });
    expect(getPrimaryEmail(contact)?.email).toBe('b@b.com');
  });
});

// ── Zod Schemas ────────────────────────────────────────────────────────────

describe('ContactFormSchema', () => {
  it('validates a minimal valid contact', () => {
    const result = ContactFormSchema.safeParse({
      category: 'home',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [
        {
          id: 'a1',
          primary: true,
          address1: '123 Main',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
          country: 'US',
        },
      ],
      phones: [],
      emails: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing firstName', () => {
    const result = ContactFormSchema.safeParse({
      category: 'home',
      firstName: '',
      lastName: 'Doe',
      addresses: [
        {
          id: 'a1',
          primary: true,
          address1: '123 Main',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
          country: 'US',
        },
      ],
      phones: [],
      emails: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty addresses array', () => {
    const result = ContactFormSchema.safeParse({
      category: 'home',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [],
      phones: [],
      emails: [],
    });
    expect(result.success).toBe(false);
  });

  it('validates family contact with subcategory and relationship', () => {
    const result = ContactFormSchema.safeParse({
      category: 'family',
      subcategory: 'siblings',
      relationship: 'brother',
      firstName: 'Marcus',
      lastName: 'Jones',
      addresses: [
        {
          id: 'a1',
          primary: true,
          address1: '456 Oak',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'US',
        },
      ],
      phones: [{id: 'p1', primary: true, number: '555-0100'}],
      emails: [{id: 'e1', primary: true, email: 'marcus@example.com'}],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email in emails array', () => {
    const result = ContactFormSchema.safeParse({
      category: 'home',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [
        {
          id: 'a1',
          primary: true,
          address1: '123 Main',
          city: 'X',
          state: 'IL',
          zip: '0',
          country: 'US',
        },
      ],
      phones: [],
      emails: [{id: 'e1', primary: true, email: 'not-an-email'}],
    });
    expect(result.success).toBe(false);
  });
});

describe('SurveyResponseSchema', () => {
  it('validates social media with platform', () => {
    const result = SurveyResponseSchema.safeParse({
      source: 'social_media',
      platform: 'instagram',
    });
    expect(result.success).toBe(true);
  });

  it('validates referral with phone', () => {
    const result = SurveyResponseSchema.safeParse({
      source: 'referral',
      referrerPhone: '555-0100',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid source', () => {
    const result = SurveyResponseSchema.safeParse({
      source: 'billboard',
    });
    expect(result.success).toBe(false);
  });
});
