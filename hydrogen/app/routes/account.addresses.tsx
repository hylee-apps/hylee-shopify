import type {Route} from './+types/account.addresses';
import {redirect, Form, useActionData, useNavigation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';
import {
  Breadcrumb,
  Icon,
  Button,
  Input,
  Label,
  Select,
  Checkbox,
  Modal,
} from '~/components';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Your Addresses',
    description: 'Manage your shipping addresses.',
  });
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const ADDRESSES_QUERY = `#graphql
  query CustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          name
          firstName
          lastName
          company
          address1
          address2
          city
          provinceCode
          zip
          countryCodeV2
          phone
          formatted
        }
      }
    }
  }
` as const;

const CREATE_ADDRESS_MUTATION = `#graphql
  mutation CreateAddress($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation DeleteAddress($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
` as const;

const SET_DEFAULT_MUTATION = `#graphql
  mutation SetDefaultAddress($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        defaultAddress {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  const {data} = await context.customerAccount.query(ADDRESSES_QUERY);
  const defaultAddressId = data.customer?.defaultAddress?.id ?? null;

  return {
    addresses: data.customer?.addresses.nodes ?? [],
    defaultAddressId,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const address = extractAddressFromForm(formData);
      const {data} = await context.customerAccount.mutate(
        CREATE_ADDRESS_MUTATION,
        {variables: {address}},
      );
      const errors = data?.customerAddressCreate?.userErrors;
      if (errors?.length) {
        return {errors, intent};
      }

      // Set as default if requested
      if (formData.get('isDefault') === 'on') {
        const id = data?.customerAddressCreate?.customerAddress?.id;
        if (id) {
          await context.customerAccount.mutate(SET_DEFAULT_MUTATION, {
            variables: {addressId: id},
          });
        }
      }
      return {success: true, intent};
    }

    case 'update': {
      const addressId = formData.get('addressId') as string;
      const address = extractAddressFromForm(formData);
      const {data} = await context.customerAccount.mutate(
        UPDATE_ADDRESS_MUTATION,
        {variables: {addressId, address}},
      );
      const errors = data?.customerAddressUpdate?.userErrors;
      if (errors?.length) {
        return {errors, intent};
      }
      if (formData.get('isDefault') === 'on') {
        await context.customerAccount.mutate(SET_DEFAULT_MUTATION, {
          variables: {addressId},
        });
      }
      return {success: true, intent};
    }

    case 'delete': {
      const addressId = formData.get('addressId') as string;
      const {data} = await context.customerAccount.mutate(
        DELETE_ADDRESS_MUTATION,
        {variables: {addressId}},
      );
      const errors = data?.customerAddressDelete?.userErrors;
      if (errors?.length) {
        return {errors, intent};
      }
      return {success: true, intent};
    }

    case 'setDefault': {
      const addressId = formData.get('addressId') as string;
      const {data} = await context.customerAccount.mutate(
        SET_DEFAULT_MUTATION,
        {variables: {addressId}},
      );
      const errors = data?.customerDefaultAddressUpdate?.userErrors;
      if (errors?.length) {
        return {errors, intent};
      }
      return {success: true, intent};
    }

    default:
      return {errors: [{field: 'intent', message: 'Unknown action'}]};
  }
}

function extractAddressFromForm(formData: FormData) {
  return {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    company: (formData.get('company') as string) || undefined,
    address1: formData.get('address1') as string,
    address2: (formData.get('address2') as string) || undefined,
    city: formData.get('city') as string,
    provinceCode: (formData.get('provinceCode') as string) || undefined,
    zip: formData.get('zip') as string,
    countryCode: formData.get('countryCode') as string,
    phone: (formData.get('phone') as string) || undefined,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function AddressesPage({loaderData}: Route.ComponentProps) {
  const {addresses, defaultAddressId} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAddress, setEditAddress] = useState<any | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting';

  const breadcrumbs = [
    {label: 'Home', url: '/'},
    {label: 'Account', url: '/account'},
    {label: 'Addresses'},
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Your Addresses</h1>
          <p className="mt-1 text-text-muted">
            {addresses.length} address
            {addresses.length !== 1 ? 'es' : ''} saved
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Icon name="plus" size={16} className="mr-1" />
          Add Address
        </Button>
      </div>

      {/* Success Message */}
      {actionData?.success && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Address{' '}
          {actionData.intent === 'create'
            ? 'added'
            : actionData.intent === 'delete'
              ? 'removed'
              : 'updated'}{' '}
          successfully.
        </div>
      )}

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address: any) => (
            <AddressCard
              key={address.id}
              address={address}
              isDefault={address.id === defaultAddressId}
              onEdit={() => setEditAddress(address)}
              onDelete={() => setDeleteAddressId(address.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Icon name="map-pin" size={64} className="mb-4 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-dark">
            No addresses yet
          </h2>
          <p className="mb-6 text-text-muted">
            Add a shipping address to speed up checkout.
          </p>
          <Button onClick={() => setShowAddModal(true)}>Add Address</Button>
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Address"
        size="large"
      >
        <AddressForm
          intent="create"
          isSubmitting={isSubmitting}
          onCancel={() => setShowAddModal(false)}
          errors={
            actionData?.intent === 'create' ? actionData?.errors : undefined
          }
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        open={!!editAddress}
        onClose={() => setEditAddress(null)}
        title="Edit Address"
        size="large"
      >
        {editAddress && (
          <AddressForm
            intent="update"
            address={editAddress}
            isSubmitting={isSubmitting}
            onCancel={() => setEditAddress(null)}
            errors={
              actionData?.intent === 'update' ? actionData?.errors : undefined
            }
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteAddressId}
        onClose={() => setDeleteAddressId(null)}
        title="Delete Address"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-sm text-text">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteAddressId(null)}
            >
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input
                type="hidden"
                name="addressId"
                value={deleteAddressId ?? ''}
              />
              <Button type="submit" variant="destructive" size="sm">
                Delete
              </Button>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// AddressCard Component
// ============================================================================

function AddressCard({
  address,
  isDefault,
  onEdit,
  onDelete,
}: {
  address: any;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="font-medium text-dark">{address.name}</p>
        {isDefault && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Default
          </span>
        )}
      </div>
      <div className="mb-4 space-y-0.5 text-sm text-text">
        {address.formatted?.map((line: string, idx: number) => (
          <p key={idx}>{line}</p>
        ))}
        {address.phone && <p className="mt-1">{address.phone}</p>}
      </div>
      <div className="flex items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit
        </button>
        {!isDefault && (
          <>
            <Form method="post" className="inline">
              <input type="hidden" name="intent" value="setDefault" />
              <input type="hidden" name="addressId" value={address.id} />
              <button
                type="submit"
                className="text-sm text-text-muted hover:text-primary"
              >
                Set as Default
              </button>
            </Form>
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-text-muted hover:text-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AddressForm Component
// ============================================================================

function AddressForm({
  intent,
  address,
  isSubmitting,
  onCancel,
  errors,
}: {
  intent: 'create' | 'update';
  address?: any;
  isSubmitting: boolean;
  onCancel: () => void;
  errors?: Array<{field: string; message: string}>;
}) {
  return (
    <Form method="post" className="space-y-4">
      <input type="hidden" name="intent" value={intent} />
      {address?.id && (
        <input type="hidden" name="addressId" value={address.id} />
      )}

      {errors && errors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errors.map((e, i) => (
            <p key={i}>{e.message}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={address?.firstName ?? ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={address?.lastName ?? ''}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          defaultValue={address?.company ?? ''}
        />
      </div>

      <div>
        <Label htmlFor="address1">Address</Label>
        <Input
          id="address1"
          name="address1"
          defaultValue={address?.address1 ?? ''}
          required
        />
      </div>

      <div>
        <Label htmlFor="address2">Apartment, suite, etc. (Optional)</Label>
        <Input
          id="address2"
          name="address2"
          defaultValue={address?.address2 ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={address?.city ?? ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="countryCode">Country</Label>
          <Select
            id="countryCode"
            name="countryCode"
            defaultValue={address?.countryCodeV2 ?? 'US'}
            options={[
              {label: 'United States', value: 'US'},
              {label: 'Canada', value: 'CA'},
              {label: 'United Kingdom', value: 'GB'},
              {label: 'Australia', value: 'AU'},
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provinceCode">State / Province</Label>
          <Input
            id="provinceCode"
            name="provinceCode"
            defaultValue={address?.provinceCode ?? ''}
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP / Postal Code</Label>
          <Input
            id="zip"
            name="zip"
            defaultValue={address?.zip ?? ''}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ''}
        />
      </div>

      <Checkbox
        id="isDefault"
        name="isDefault"
        label="Set as default address"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : intent === 'create'
              ? 'Add Address'
              : 'Save Changes'}
        </Button>
      </div>
    </Form>
  );
}
