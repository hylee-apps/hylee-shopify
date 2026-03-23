import type {Route} from './+types/account.addresses';
import {redirect, useActionData, useNavigation, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {Button} from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {Plus} from 'lucide-react';

import {CategoryTabs} from '~/components/account/CategoryTabs';
import {FamilySubTabs} from '~/components/account/FamilySubTabs';
import {ContactList} from '~/components/account/ContactList';
import {ContactFormDialog} from '~/components/account/ContactFormDialog';

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
} from '~/lib/address-book';
import type {
  AddressBookContact,
  AddressCategory,
  ContactAddress,
  FamilySubcategory,
  OtherSubcategory,
} from '~/lib/address-book';

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

  // Fetch both address book metafield and native addresses via Storefront API
  const [{book, customerId}, {addresses: shopifyAddresses, defaultAddressId}] =
    await Promise.all([
      readAddressBook(context),
      readCustomerAddresses(context),
    ]);

  // Sync: auto-create home contacts for Shopify addresses not yet in the book
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
// Main Component
// ============================================================================

export default function AddressBookPage({loaderData}: Route.ComponentProps) {
  const {book} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<AddressBookContact | null>(
    null,
  );
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [addCategory, setAddCategory] = useState<AddressCategory>('home');
  const [addSubcategory, setAddSubcategory] = useState<
    FamilySubcategory | OtherSubcategory | undefined
  >(undefined);

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

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/account">Account</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Address Book</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Address Book</h1>
          <p className="mt-1 text-text-muted">
            {book.contacts.length} contact
            {book.contacts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Button onClick={() => handleAdd('home')}>
          <Plus size={16} className="mr-1" />
          Add Contact
        </Button>
      </div>

      {/* Success Message */}
      {actionData?.success && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Contact{' '}
          {actionData.intent === 'createContact'
            ? 'added'
            : actionData.intent === 'deleteContact'
              ? 'removed'
              : 'updated'}{' '}
          successfully.
        </div>
      )}

      {/* Tabbed Category View */}
      <CategoryTabs book={book}>
        {(category) => {
          if (category === 'family') {
            return (
              <FamilySubTabs book={book}>
                {(subcategory) => (
                  <ContactList
                    contacts={getContactsBySubcategory(
                      book,
                      'family',
                      subcategory,
                    )}
                    categoryLabel={
                      FAMILY_SUBCATEGORIES.find((s) => s.value === subcategory)
                        ?.label ?? subcategory
                    }
                    onAdd={() => handleAdd('family', subcategory)}
                    onEdit={handleEdit}
                    onDelete={setDeleteContactId}
                  />
                )}
              </FamilySubTabs>
            );
          }

          if (category === 'other') {
            const otherContacts = getContactsByCategory(book, 'other');
            return (
              <ContactList
                contacts={otherContacts}
                categoryLabel="Other"
                onAdd={() => handleAdd('other')}
                onEdit={handleEdit}
                onDelete={setDeleteContactId}
              />
            );
          }

          return (
            <ContactList
              contacts={getContactsByCategory(book, category)}
              categoryLabel={
                category.charAt(0).toUpperCase() + category.slice(1)
              }
              onAdd={() => handleAdd(category)}
              onEdit={handleEdit}
              onDelete={setDeleteContactId}
            />
          );
        }}
      </CategoryTabs>

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
