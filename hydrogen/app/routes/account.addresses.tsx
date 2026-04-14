import type {Route} from './+types/account.addresses';
import {redirect, useActionData, useNavigation, Form} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
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

  // ── Compute untracked Shopify addresses (read-only; the loader never writes)
  //
  // Writing the book inside the loader races with action writes (createContact,
  // updateContact) under Admin API eventual consistency: a stale read overwrites
  // the action's write, replacing the user's real contact with a bare
  // name+address entry on every page refresh.
  //
  // Instead we identify Shopify addresses that have no corresponding home
  // contact and pass them to the component. The component triggers a one-time
  // `importShopifyAddresses` action (via useFetcher) which reads the freshest
  // book state before writing — avoiding the write-write race entirely.
  const tombstone = new Set(book.deletedShopifyIds ?? []);
  const trackedShopifyIds = new Set(
    getContactsByCategory(book, 'home').flatMap((c) =>
      c.addresses.map((a) => a.shopifyAddressId).filter(Boolean),
    ),
  );
  const untrackedAddresses = shopifyAddresses.filter(
    (addr) => !tombstone.has(addr.id) && !trackedShopifyIds.has(addr.id),
  );

  return {book, customerId, untrackedAddresses};
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
      // Redirect (like deleteContact) so the loader re-runs after a navigation
      // delay, giving the Admin API metafield write more time to propagate to
      // the Storefront API before the sync reads it back.
      return redirect('/account/addresses');
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

      const existing = book.contacts[idx];

      // If home category, dual-write address changes to Shopify
      if (updated.category === 'home') {
        // Delete any Shopify addresses that were removed from the contact.
        // Tombstone each ID before attempting deletion so the sync never
        // recreates the contact — even if the Shopify delete is still in flight.
        const updatedAddressIds = new Set(updated.addresses.map((a) => a.id));
        const tombstone = new Set(book.deletedShopifyIds ?? []);
        for (const addr of existing.addresses) {
          if (!updatedAddressIds.has(addr.id) && addr.shopifyAddressId) {
            tombstone.add(addr.shopifyAddressId);
            await deleteShopifyAddress(context, addr.shopifyAddressId);
          }
        }
        book.deletedShopifyIds = [...tombstone];

        // Update or create the primary address in Shopify
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

    case 'bulkDeleteContacts': {
      const {book, customerId} = await readAddressBook(context);
      const contactIdsRaw = formData.get('contactIds') as string;
      let contactIds: string[] = [];
      try {
        contactIds = JSON.parse(contactIdsRaw) as string[];
      } catch {
        return {
          errors: [{field: 'contactIds', message: 'Invalid contact IDs'}],
        };
      }

      const tombstone = new Set(book.deletedShopifyIds ?? []);
      for (const contactId of contactIds) {
        const contact = book.contacts.find((c) => c.id === contactId);
        if (!contact) continue;
        if (contact.category === 'home') {
          for (const addr of contact.addresses) {
            if (addr.shopifyAddressId) {
              tombstone.add(addr.shopifyAddressId);
              await deleteShopifyAddress(context, addr.shopifyAddressId);
            }
          }
        }
      }
      book.deletedShopifyIds = [...tombstone];
      book.contacts = book.contacts.filter((c) => !contactIds.includes(c.id));
      await writeAddressBook(context, customerId, book);
      return redirect('/account/addresses');
    }

    case 'importShopifyAddresses': {
      // One-time bootstrap: import Shopify native addresses that have no
      // corresponding home contact in the book.  This runs as an action (not in
      // the loader) so there is no write-write race with createContact.  We read
      // the freshest book state right here before writing, which picks up any
      // contacts written by recent createContact calls.
      const {book, customerId} = await readAddressBook(context);
      const {addresses: shopifyAddresses, defaultAddressId} =
        await readCustomerAddresses(context);

      const tombstone = new Set(book.deletedShopifyIds ?? []);
      const trackedShopifyIds = new Set(
        getContactsByCategory(book, 'home').flatMap((c) =>
          c.addresses.map((a) => a.shopifyAddressId).filter(Boolean),
        ),
      );

      let added = 0;
      for (const addr of shopifyAddresses) {
        if (tombstone.has(addr.id)) continue;
        if (trackedShopifyIds.has(addr.id)) continue;

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
        added++;
      }

      if (added > 0) {
        await writeAddressBook(context, customerId, book);
      }
      // Return JSON (not redirect) so the fetcher does NOT trigger a full
      // navigation. A redirect would remount the component, reset
      // importTriggeredRef, and restart the import cycle before the Admin API
      // write has propagated — causing infinite duplicate creation.
      // Loader revalidation still fires automatically, updating the UI once the
      // write is visible, without any remount.
      return {success: true, intent, added};
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

      // If home, also delete Shopify native addresses.
      // Tombstone each ID first so the loader sync never recreates the contact,
      // even if Shopify deletion is delayed or fails.
      if (contact.category === 'home') {
        const tombstone = new Set(book.deletedShopifyIds ?? []);
        for (const addr of contact.addresses) {
          if (addr.shopifyAddressId) {
            tombstone.add(addr.shopifyAddressId);
            await deleteShopifyAddress(context, addr.shopifyAddressId);
          }
        }
        book.deletedShopifyIds = [...tombstone];
      }

      book.contacts = book.contacts.filter((c) => c.id !== contactId);
      await writeAddressBook(context, customerId, book);
      // Redirect instead of returning JSON so the page fully remounts after
      // deletion. This closes the dialog via component reset (deleteContactId
      // defaults to null), avoids any actionData/useEffect race, and lets the
      // loader re-run after a navigation delay — giving Shopify's API more time
      // to propagate the metafield write before the next read.
      return redirect('/account/addresses');
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

// Descriptions are now resolved via i18n in the component.

const CATEGORY_ICONS: Record<AddressCategory, ComponentType<LucideProps>> = {
  home: Home,
  family: Users,
  friends: Heart,
  work: Briefcase,
  other: MapPin,
};

// Category descriptions are now resolved via i18n in the component.

function buildFamilyStats(
  contacts: AddressBookContact[],
  subcategory: FamilySubcategory,
  t: (key: string) => string,
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
    const subLabel = t(`addressBook.subcategories.${subcategory}`);
    return [
      {
        icon: User,
        iconBgClass: 'bg-primary/10',
        iconColorClass: 'text-primary',
        label: `${t(`addressBook.relationships.${rels[0].value}`)}s`,
        value: count1,
      },
      {
        icon: User,
        iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
        iconColorClass: 'text-[#f2b05e]',
        label: `${t(`addressBook.relationships.${rels[1].value}`)}s`,
        value: count2,
      },
      {
        icon: Users,
        iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
        iconColorClass: 'text-[#4fd1a8]',
        label: `Total ${subLabel}`,
        value: contacts.length,
      },
    ];
  }

  // Single relationship type (e.g., Cousins)
  const subLabel = t(`addressBook.subcategories.${subcategory}`);
  return [
    {
      icon: User,
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      label: rels[0]?.value
        ? t(`addressBook.relationships.${rels[0].value}`)
        : t('contactList.selectionCount').split(' ')[0],
      value: contacts.length,
    },
    {
      icon: MapPin,
      iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
      iconColorClass: 'text-[#f2b05e]',
      label: t('contactCard.address'),
      value: contacts.filter((c) => c.addresses.length > 0).length,
    },
    {
      icon: Users,
      iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
      iconColorClass: 'text-[#4fd1a8]',
      label: `Total ${subLabel}`,
      value: contacts.length,
    },
  ];
}

function buildCategoryStats(
  contacts: AddressBookContact[],
  category: AddressCategory,
  t: (key: string) => string,
): [StatConfig, StatConfig, StatConfig] {
  const catLabel = t(`addressBook.categories.${category}`);
  return [
    {
      icon: User,
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
      label: catLabel,
      value: contacts.length,
    },
    {
      icon: MapPin,
      iconBgClass: 'bg-[rgba(242,176,94,0.1)]',
      iconColorClass: 'text-[#f2b05e]',
      label: t('contactCard.address'),
      value: contacts.reduce((sum, c) => sum + c.addresses.length, 0),
    },
    {
      icon: Users,
      iconBgClass: 'bg-[rgba(79,209,168,0.1)]',
      iconColorClass: 'text-[#4fd1a8]',
      label: `Total ${catLabel}`,
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
  const {t} = useTranslation('common');

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

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Auto-close the edit dialog on successful update.
  // (createContact now redirects, so it closes via component remount.)
  useEffect(() => {
    if (actionData?.success && actionData.intent === 'updateContact') {
      setFormOpen(false);
      setEditContact(null);
    }
  }, [actionData]);

  // Close dialogs as soon as the submission is in-flight.
  // This lets Radix unmount the portal cleanly before React Router's redirect
  // tears down the component tree — avoids the "removeChild" DOM error.
  useEffect(() => {
    if (navigation.state !== 'submitting') return;
    const intent = navigation.formData?.get('intent');
    if (intent === 'createContact') {
      setFormOpen(false);
      setEditContact(null);
    } else if (intent === 'deleteContact') {
      setDeleteContactId(null);
    } else if (intent === 'bulkDeleteContacts') {
      setBulkDeleteOpen(false);
      setSelectionMode(false);
      setSelectedContactIds(new Set());
    }
  }, [navigation.state, navigation.formData]);

  function handleToggleSelect(contactId: string) {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  }

  function handleEnterSelectionMode() {
    setSelectionMode(true);
    setSelectedContactIds(new Set());
  }

  function handleExitSelectionMode() {
    setSelectionMode(false);
    setSelectedContactIds(new Set());
  }

  function handleCategoryChange(category: AddressCategory) {
    setActiveCategory(category);
    setActiveSubcategory('parents');
    setActiveRelationship(undefined);
    setSelectionMode(false);
    setSelectedContactIds(new Set());
  }

  function handleSubcategoryChange(subcategory: FamilySubcategory) {
    setActiveSubcategory(subcategory);
    setActiveRelationship(undefined);
    setSelectionMode(false);
    setSelectedContactIds(new Set());
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
    const subLabel = t(`addressBook.subcategories.${activeSubcategory}`);
    sectionLabel = t('addresses.sectionLabel', {label: subLabel});
    sectionIcon = SUBCATEGORY_ICONS[activeSubcategory] ?? Users;
    sectionDescription = t(
      `addressBook.subcategoryDescriptions.${activeSubcategory}`,
    );
    addLabel = t('addresses.addLabel', {label: subLabel});
    stats = buildFamilyStats(displayContacts, activeSubcategory, t);
  } else {
    displayContacts = getContactsByCategory(book, activeCategory);
    const catLabel = t(`addressBook.categories.${activeCategory}`);
    sectionLabel = t('addresses.sectionLabel', {label: catLabel});
    sectionIcon = CATEGORY_ICONS[activeCategory] ?? MapPin;
    sectionDescription = t(
      `addressBook.categoryDescriptions.${activeCategory}`,
    );
    addLabel = t('addresses.addLabel', {label: catLabel});
    stats = buildCategoryStats(displayContacts, activeCategory, t);
  }

  function handleSelectAll() {
    const allSelected = displayContacts.every((c) =>
      selectedContactIds.has(c.id),
    );
    setSelectedContactIds(
      allSelected ? new Set() : new Set(displayContacts.map((c) => c.id)),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-light leading-10.5 text-gray-900 sm:text-[28px]">
          {t('addresses.pageTitle')}
        </h1>
        <p className="text-[15px] leading-[22.5px] text-gray-600">
          {t('addresses.pageSubtitle')}
        </p>
      </div>

      {/* Success Message (updateContact only — create/delete use redirect) */}
      {actionData?.success && actionData.intent === 'updateContact' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {t('addresses.contactUpdated')}
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
            ? t(`addressBook.subcategories.${activeSubcategory}`)
            : t(`addressBook.categories.${activeCategory}`)
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

      {/* Bulk Action Bar — visible only in selection mode with ≥1 contact selected */}
      {selectionMode && selectedContactIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="text-sm font-medium text-red-700">
            {t('addresses.bulkActionBar.selected', {
              count: selectedContactIds.size,
            })}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            {t('addresses.bulkActionBar.deleteSelected')}
          </Button>
        </div>
      )}

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
        selectionMode={selectionMode}
        selectedIds={selectedContactIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onEnterSelectionMode={handleEnterSelectionMode}
        onExitSelectionMode={handleExitSelectionMode}
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
            <DialogTitle>{t('addresses.deleteDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text">
              {t('addresses.deleteDialog.body')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteContactId(null)}
              >
                {t('addresses.deleteDialog.cancel')}
              </Button>
              <Form method="post">
                <input type="hidden" name="intent" value="deleteContact" />
                <input
                  type="hidden"
                  name="contactId"
                  value={deleteContactId ?? ''}
                />
                <Button type="submit" variant="destructive" size="sm">
                  {t('addresses.deleteDialog.confirm')}
                </Button>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('addresses.bulkDeleteDialog.title', {
                count: selectedContactIds.size,
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text">
              {t('addresses.bulkDeleteDialog.body', {
                label:
                  selectedContactIds.size === 1
                    ? t('addresses.bulkDeleteDialog.bodyThis')
                    : t('addresses.bulkDeleteDialog.bodyThese', {
                        count: selectedContactIds.size,
                      }),
              })}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteOpen(false)}
              >
                {t('addresses.bulkDeleteDialog.cancel')}
              </Button>
              <Form method="post">
                <input type="hidden" name="intent" value="bulkDeleteContacts" />
                <input
                  type="hidden"
                  name="contactIds"
                  value={JSON.stringify([...selectedContactIds])}
                />
                <Button type="submit" variant="destructive" size="sm">
                  {t('addresses.bulkDeleteDialog.confirm', {
                    count: selectedContactIds.size,
                  })}
                </Button>
              </Form>
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
