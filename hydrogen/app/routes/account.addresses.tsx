import type {Route} from './+types/account.addresses';
import {redirect, useActionData, useNavigation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import {Button} from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Users,
  UserPlus,
  Baby,
  Heart,
  Crown,
  Home,
  Briefcase,
  MapPin,
  User,
} from 'lucide-react';

import {CategoryBar} from '~/components/account/CategoryTabs';
import {
  SubcategoryBar,
  RelationshipBar,
} from '~/components/account/FamilySubTabs';
import {ContactList} from '~/components/account/ContactList';
import {ContactFormDialog} from '~/components/account/ContactFormDialog';
import {SubsectionHeader} from '~/components/account/SubsectionHeader';
import {StatsBar} from '~/components/account/StatsBar';
import type {StatConfig} from '~/components/account/StatsBar';

import {
  readAddressBook,
  writeAddressBook,
  readCustomerAddresses,
  createShopifyAddress,
  updateShopifyAddress,
  deleteShopifyAddress,
  setDefaultShopifyAddress,
} from '~/lib/address-book-graphql';
import {
  getContactsByCategory,
  getContactsBySubcategory,
  setPrimaryAddress,
  FAMILY_SUBCATEGORIES,
  ADDRESS_CATEGORIES,
} from '~/lib/address-book';
import type {
  AddressBookContact,
  AddressCategory,
  ContactAddress,
  FamilySubcategory,
  FamilyRelationship,
  OtherSubcategory,
} from '~/lib/address-book';
import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Address Book',
    description: 'Manage your contacts and shipping addresses.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  // Fetch both address book metafield and native addresses via Storefront API.
  // Re-throw Response objects (redirects) but catch other errors gracefully.
  let book, customerId, shopifyAddresses, defaultAddressId;
  try {
    [{book, customerId}, {addresses: shopifyAddresses, defaultAddressId}] =
      await Promise.all([
        readAddressBook(context),
        readCustomerAddresses(context),
      ]);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Failed to load address book data:', error);
    return redirect('/account/login');
  }

  // Sync: auto-create home contacts for Shopify addresses not yet in the book.
  // Wrapped in try/catch so Admin API failures (e.g. missing env vars) don't
  // crash the entire page — the address book still loads, just without the sync.
  try {
    const homeContacts = getContactsByCategory(book, 'home');
    const trackedShopifyIds = new Set(
      homeContacts.flatMap((c) =>
        c.addresses.map((a) => a.shopifyAddressId).filter(Boolean),
      ),
    );

    let bookChanged = false;
    for (const addr of shopifyAddresses) {
      if (!trackedShopifyIds.has(addr.id)) {
        book.contacts.push({
          id: crypto.randomUUID(),
          category: 'home',
          firstName: addr.firstName ?? '',
          lastName: addr.lastName ?? '',
          addresses: [
            {
              id: crypto.randomUUID(),
              primary: addr.id === defaultAddressId,
              shopifyAddressId: addr.id,
              address1: addr.address1 ?? '',
              address2: addr.address2 ?? '',
              city: addr.city ?? '',
              state: addr.provinceCode ?? '',
              zip: addr.zip ?? '',
              country: addr.countryCodeV2 ?? 'US',
            },
          ],
          phones: addr.phone
            ? [{id: crypto.randomUUID(), primary: true, number: addr.phone}]
            : [],
          emails: [],
        });
        bookChanged = true;
      }
    }

    if (bookChanged) {
      await writeAddressBook(context, customerId, book);
    }
  } catch (error) {
    // Log but don't crash — sync is best-effort
    console.error('Address book sync failed:', error);
  }

  return {book, customerId};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  switch (intent) {
    // ── New contact-based intents ─────────────────────────────────────────

    case 'createContact': {
      const {book, customerId} = await readAddressBook(context);
      const contact = extractContactFromForm(formData);

      // If home category, dual-write to Shopify native addresses
      if (contact.category === 'home' && contact.addresses.length > 0) {
        const primaryAddr =
          contact.addresses.find((a) => a.primary) ?? contact.addresses[0];
        const {errors, addressId} = await createShopifyAddress(
          context,
          toShopifyAddress(primaryAddr, contact),
        );
        if (errors?.length) {
          return {errors, intent};
        }
        if (addressId) {
          primaryAddr.shopifyAddressId = addressId;
        }
      }

      book.contacts.push(contact);
      await writeAddressBook(context, customerId, book);
      return {success: true, intent};
    }

    case 'updateContact': {
      const {book, customerId} = await readAddressBook(context);
      const contactId = formData.get('contactId') as string;
      const updated = extractContactFromForm(formData);
      updated.id = contactId;

      const idx = book.contacts.findIndex((c) => c.id === contactId);
      if (idx === -1) {
        return {
          errors: [{field: 'contactId', message: 'Contact not found'}],
          intent,
        };
      }

      // If home category, dual-write primary address to Shopify
      if (updated.category === 'home') {
        const primaryAddr =
          updated.addresses.find((a) => a.primary) ?? updated.addresses[0];
        if (primaryAddr?.shopifyAddressId) {
          const {errors} = await updateShopifyAddress(
            context,
            primaryAddr.shopifyAddressId,
            toShopifyAddress(primaryAddr, updated),
          );
          if (errors?.length) {
            return {errors, intent};
          }
        } else if (primaryAddr) {
          const {addressId} = await createShopifyAddress(
            context,
            toShopifyAddress(primaryAddr, updated),
          );
          if (addressId) {
            primaryAddr.shopifyAddressId = addressId;
          }
        }
      }

      book.contacts[idx] = updated;
      await writeAddressBook(context, customerId, book);
      return {success: true, intent};
    }

    case 'deleteContact': {
      const {book, customerId} = await readAddressBook(context);
      const contactId = formData.get('contactId') as string;
      const contact = book.contacts.find((c) => c.id === contactId);

      if (!contact) {
        return {
          errors: [{field: 'contactId', message: 'Contact not found'}],
          intent,
        };
      }

      // If home, also delete Shopify native addresses
      if (contact.category === 'home') {
        for (const addr of contact.addresses) {
          if (addr.shopifyAddressId) {
            await deleteShopifyAddress(context, addr.shopifyAddressId);
          }
        }
      }

      book.contacts = book.contacts.filter((c) => c.id !== contactId);
      await writeAddressBook(context, customerId, book);
      return {success: true, intent};
    }

    case 'setPrimary': {
      const {book, customerId} = await readAddressBook(context);
      const contactId = formData.get('contactId') as string;
      const addressId = formData.get('addressId') as string;

      const idx = book.contacts.findIndex((c) => c.id === contactId);
      if (idx === -1) {
        return {
          errors: [{field: 'contactId', message: 'Contact not found'}],
          intent,
        };
      }

      book.contacts[idx] = setPrimaryAddress(book.contacts[idx], addressId);

      // If home, also set default in Shopify
      const newPrimary = book.contacts[idx].addresses.find((a) => a.primary);
      if (
        book.contacts[idx].category === 'home' &&
        newPrimary?.shopifyAddressId
      ) {
        await setDefaultShopifyAddress(context, newPrimary.shopifyAddressId);
      }

      await writeAddressBook(context, customerId, book);
      return {success: true, intent};
    }

    // ── Legacy intents (backward compat) ──────────────────────────────────

    case 'create': {
      const address = extractShopifyAddressFromForm(formData);
      const {errors, addressId} = await createShopifyAddress(context, address);
      if (errors?.length) {
        return {errors, intent};
      }
      if (formData.get('isDefault') === 'on' && addressId) {
        await setDefaultShopifyAddress(context, addressId);
      }
      return {success: true, intent};
    }

    case 'update': {
      const existingAddressId = formData.get('addressId') as string;
      const address = extractShopifyAddressFromForm(formData);
      const {errors} = await updateShopifyAddress(
        context,
        existingAddressId,
        address,
      );
      if (errors?.length) {
        return {errors, intent};
      }
      if (formData.get('isDefault') === 'on') {
        await setDefaultShopifyAddress(context, existingAddressId);
      }
      return {success: true, intent};
    }

    case 'delete': {
      const existingAddressId = formData.get('addressId') as string;
      const {errors} = await deleteShopifyAddress(context, existingAddressId);
      if (errors?.length) {
        return {errors, intent};
      }
      return {success: true, intent};
    }

    case 'setDefault': {
      const existingAddressId = formData.get('addressId') as string;
      const {errors} = await setDefaultShopifyAddress(
        context,
        existingAddressId,
      );
      if (errors?.length) {
        return {errors, intent};
      }
      return {success: true, intent};
    }

    default:
      return {errors: [{field: 'intent', message: 'Unknown action'}]};
  }
}

// ============================================================================
// Form Extraction Helpers
// ============================================================================

function extractContactFromForm(formData: FormData): AddressBookContact {
  const category = (formData.get('category') as string) || 'home';
  const subcategory = formData.get('subcategory') as string | null;
  const relationship = formData.get('relationship') as string | null;

  // Parse dynamic address rows
  const addresses: ContactAddress[] = [];
  let addrIdx = 0;
  while (formData.has(`addresses[${addrIdx}].id`)) {
    addresses.push({
      id: formData.get(`addresses[${addrIdx}].id`) as string,
      primary: formData.get(`addresses[${addrIdx}].primary`) === 'true',
      shopifyAddressId:
        (formData.get(`addresses[${addrIdx}].shopifyAddressId`) as string) ||
        undefined,
      address1: formData.get(`addresses[${addrIdx}].address1`) as string,
      address2:
        (formData.get(`addresses[${addrIdx}].address2`) as string) || undefined,
      city: formData.get(`addresses[${addrIdx}].city`) as string,
      state: formData.get(`addresses[${addrIdx}].state`) as string,
      zip: formData.get(`addresses[${addrIdx}].zip`) as string,
      country:
        (formData.get(`addresses[${addrIdx}].country`) as string) || 'US',
    });
    addrIdx++;
  }

  // Parse phone rows
  const phones: {id: string; primary: boolean; number: string}[] = [];
  let phoneIdx = 0;
  while (formData.has(`phones[${phoneIdx}].id`)) {
    const number = formData.get(`phones[${phoneIdx}].number`) as string;
    if (number) {
      phones.push({
        id: formData.get(`phones[${phoneIdx}].id`) as string,
        primary: formData.get(`phones[${phoneIdx}].primary`) === 'true',
        number,
      });
    }
    phoneIdx++;
  }

  // Parse email rows
  const emails: {id: string; primary: boolean; email: string}[] = [];
  let emailIdx = 0;
  while (formData.has(`emails[${emailIdx}].id`)) {
    const email = formData.get(`emails[${emailIdx}].email`) as string;
    if (email) {
      emails.push({
        id: formData.get(`emails[${emailIdx}].id`) as string,
        primary: formData.get(`emails[${emailIdx}].primary`) === 'true',
        email,
      });
    }
    emailIdx++;
  }

  return {
    id: crypto.randomUUID(),
    category: category as AddressCategory,
    subcategory: subcategory
      ? (subcategory as FamilySubcategory | OtherSubcategory)
      : undefined,
    relationship: relationship ? (relationship as any) : undefined,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    addresses,
    phones,
    emails,
  };
}

function extractShopifyAddressFromForm(formData: FormData) {
  return {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    company: (formData.get('company') as string) || undefined,
    address1: formData.get('address1') as string,
    address2: (formData.get('address2') as string) || undefined,
    city: formData.get('city') as string,
    province: (formData.get('zoneCode') as string) || undefined,
    zip: formData.get('zip') as string,
    country: formData.get('territoryCode') as string,
    phone: (formData.get('phoneNumber') as string) || undefined,
  };
}

function toShopifyAddress(addr: ContactAddress, contact: AddressBookContact) {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    address1: addr.address1,
    address2: addr.address2 || undefined,
    city: addr.city,
    province: addr.state || undefined,
    zip: addr.zip,
    country: addr.country || 'US',
  };
}

// ============================================================================
// Subsection Config
// ============================================================================

const SUBCATEGORY_ICONS: Record<
  FamilySubcategory,
  ComponentType<LucideProps>
> = {
  parents: Users,
  siblings: UserPlus,
  children: Baby,
  aunts_uncles: Heart,
  cousins: User,
  grandparents: Crown,
};

const SUBCATEGORY_DESCRIPTIONS: Record<FamilySubcategory, string> = {
  parents: "Manage your parents' information and addresses",
  siblings: "Manage your siblings' information and addresses",
  children: "Manage your children's information and addresses",
  aunts_uncles: "Manage your aunts and uncles' information and addresses",
  cousins: "Manage your cousins' information and addresses",
  grandparents: "Manage your grandparents' information and addresses",
};

const CATEGORY_ICONS: Record<AddressCategory, ComponentType<LucideProps>> = {
  home: Home,
  family: Users,
  friends: Heart,
  work: Briefcase,
  other: MapPin,
};

const CATEGORY_DESCRIPTIONS: Record<AddressCategory, string> = {
  home: 'Manage your home addresses and contacts',
  family: 'Manage your family contacts and addresses',
  friends: 'Manage your friends and their addresses',
  work: 'Manage your work contacts and addresses',
  other: 'Manage other addresses and contacts',
};

function buildFamilyStats(
  contacts: AddressBookContact[],
  subcategory: FamilySubcategory,
): [StatConfig, StatConfig, StatConfig] {
  const sub = FAMILY_SUBCATEGORIES.find((s) => s.value === subcategory);
  const rels = sub?.relationships ?? [];

  if (rels.length >= 2) {
    const count1 = contacts.filter(
      (c) => c.relationship === rels[0].value,
    ).length;
    const count2 = contacts.filter(
      (c) => c.relationship === rels[1].value,
    ).length;
    return [
      {
        icon: User,
        iconBgClass: 'bg-primary/10',
        iconColorClass: 'text-primary',
        label: `${rels[0].label}s`,
        value: count1,
      },
      {
        icon: User,
        iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
        iconColorClass: 'text-[#f2b05e]',
        label: `${rels[1].label}s`,
        value: count2,
      },
      {
        icon: Users,
        iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
        iconColorClass: 'text-[#4fd1a8]',
        label: `Total ${sub?.label ?? ''}`,
        value: contacts.length,
      },
    ];
  }

  // Single relationship type (e.g., Cousins)
  return [
    {
      icon: User,
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      label: rels[0]?.label ?? 'Contacts',
      value: contacts.length,
    },
    {
      icon: MapPin,
      iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
      iconColorClass: 'text-[#f2b05e]',
      label: 'With Address',
      value: contacts.filter((c) => c.addresses.length > 0).length,
    },
    {
      icon: Users,
      iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
      iconColorClass: 'text-[#4fd1a8]',
      label: `Total ${sub?.label ?? ''}`,
      value: contacts.length,
    },
  ];
}

function buildCategoryStats(
  contacts: AddressBookContact[],
  category: AddressCategory,
): [StatConfig, StatConfig, StatConfig] {
  const label =
    ADDRESS_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return [
    {
      icon: User,
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      label: 'Contacts',
      value: contacts.length,
    },
    {
      icon: MapPin,
      iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
      iconColorClass: 'text-[#f2b05e]',
      label: 'Addresses',
      value: contacts.reduce((sum, c) => sum + c.addresses.length, 0),
    },
    {
      icon: Users,
      iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
      iconColorClass: 'text-[#4fd1a8]',
      label: `Total ${label}`,
      value: contacts.length,
    },
  ];
}

// ============================================================================
// Main Component
// ============================================================================

export default function AddressBookPage({loaderData}: Route.ComponentProps) {
  const {book} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Controlled state for navigation
  const [activeCategory, setActiveCategory] = useState<AddressCategory>('home');
  const [activeSubcategory, setActiveSubcategory] =
    useState<FamilySubcategory>('parents');
  const [activeRelationship, setActiveRelationship] = useState<
    FamilyRelationship | undefined
  >(undefined);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<AddressBookContact | null>(
    null,
  );
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [addCategory, setAddCategory] = useState<AddressCategory>('home');
  const [addSubcategory, setAddSubcategory] = useState<
    FamilySubcategory | OtherSubcategory | undefined
  >(undefined);

  function handleCategoryChange(category: AddressCategory) {
    setActiveCategory(category);
    setActiveSubcategory('parents');
    setActiveRelationship(undefined);
  }

  function handleSubcategoryChange(subcategory: FamilySubcategory) {
    setActiveSubcategory(subcategory);
    setActiveRelationship(undefined);
  }

  function handleAdd(
    category: AddressCategory,
    subcategory?: FamilySubcategory | OtherSubcategory,
  ) {
    setEditContact(null);
    setAddCategory(category);
    setAddSubcategory(subcategory);
    setFormOpen(true);
  }

  function handleEdit(contact: AddressBookContact) {
    setEditContact(contact);
    setAddCategory(contact.category);
    setAddSubcategory(
      contact.subcategory as FamilySubcategory | OtherSubcategory | undefined,
    );
    setFormOpen(true);
  }

  // Derive current subcategory config
  const currentSubConfig = FAMILY_SUBCATEGORIES.find(
    (s) => s.value === activeSubcategory,
  );
  const relationships = currentSubConfig?.relationships ?? [];

  // Derive contacts for the current view
  let displayContacts: AddressBookContact[];
  let sectionLabel: string;
  let sectionIcon: ComponentType<LucideProps>;
  let sectionDescription: string;
  let addLabel: string;
  let stats: [StatConfig, StatConfig, StatConfig];

  if (activeCategory === 'family') {
    displayContacts = getContactsBySubcategory(
      book,
      'family',
      activeSubcategory,
    );
    sectionLabel = `${currentSubConfig?.label ?? activeSubcategory} Contacts`;
    sectionIcon = SUBCATEGORY_ICONS[activeSubcategory] ?? Users;
    sectionDescription = SUBCATEGORY_DESCRIPTIONS[activeSubcategory] ?? '';
    addLabel = `Add ${currentSubConfig?.label?.replace(/s$/, '') ?? 'Contact'}`;
    stats = buildFamilyStats(displayContacts, activeSubcategory);
  } else {
    displayContacts = getContactsByCategory(book, activeCategory);
    const catLabel =
      ADDRESS_CATEGORIES.find((c) => c.value === activeCategory)?.label ??
      activeCategory;
    sectionLabel = `${catLabel} Contacts`;
    sectionIcon = CATEGORY_ICONS[activeCategory] ?? MapPin;
    sectionDescription = CATEGORY_DESCRIPTIONS[activeCategory] ?? '';
    addLabel = `Add ${catLabel}`;
    stats = buildCategoryStats(displayContacts, activeCategory);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-light leading-10.5 text-gray-900 sm:text-[28px]">
          Address Book
        </h1>
        <p className="text-[15px] leading-[22.5px] text-gray-600">
          Manage your contacts and addresses
        </p>
      </div>

      {/* Success Message */}
      {actionData?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Contact{' '}
          {actionData.intent === 'createContact'
            ? 'added'
            : actionData.intent === 'deleteContact'
              ? 'removed'
              : 'updated'}{' '}
          successfully.
        </div>
      )}

      {/* Category Bar */}
      <CategoryBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Subcategory Bar (Family only) */}
      {activeCategory === 'family' && (
        <SubcategoryBar
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={handleSubcategoryChange}
        />
      )}

      {/* Relationship Bar (when subcategory has multiple relationships) */}
      {activeCategory === 'family' && relationships.length > 1 && (
        <RelationshipBar
          relationships={relationships}
          activeRelationship={activeRelationship}
          onRelationshipChange={setActiveRelationship}
        />
      )}

      {/* Subsection Header */}
      <SubsectionHeader
        icon={sectionIcon}
        title={
          activeCategory === 'family'
            ? (currentSubConfig?.label ?? activeSubcategory)
            : (ADDRESS_CATEGORIES.find((c) => c.value === activeCategory)
                ?.label ?? activeCategory)
        }
        description={sectionDescription}
        addLabel={addLabel}
        onAdd={() =>
          handleAdd(
            activeCategory,
            activeCategory === 'family' ? activeSubcategory : undefined,
          )
        }
      />

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Contact List */}
      <ContactList
        contacts={displayContacts}
        sectionLabel={sectionLabel}
        onAdd={() =>
          handleAdd(
            activeCategory,
            activeCategory === 'family' ? activeSubcategory : undefined,
          )
        }
        onEdit={handleEdit}
        onDelete={setDeleteContactId}
      />

      {/* Add / Edit Contact Dialog */}
      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editContact}
        defaultCategory={addCategory}
        defaultSubcategory={addSubcategory}
        isSubmitting={isSubmitting}
        errors={
          actionData?.intent === 'createContact' ||
          actionData?.intent === 'updateContact'
            ? (actionData?.errors as any)
            : undefined
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteContactId}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text">
              Are you sure you want to delete this contact and all their
              addresses? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteContactId(null)}
              >
                Cancel
              </Button>
              <form method="post">
                <input type="hidden" name="intent" value="deleteContact" />
                <input
                  type="hidden"
                  name="contactId"
                  value={deleteContactId ?? ''}
                />
                <Button type="submit" variant="destructive" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-10.5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5.5 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-17 animate-pulse rounded-lg border-2 border-gray-200 bg-gray-50" />
      <div className="flex gap-4">
        <div className="h-19.75 flex-1 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
        <div className="h-19.75 flex-1 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
        <div className="h-19.75 flex-1 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-70 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
        <div className="h-70 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
      </div>
    </div>
  );
}
