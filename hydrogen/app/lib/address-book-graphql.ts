// ============================================================================
// Address Book — GraphQL queries, mutations, and Storefront API helpers
// ============================================================================

import {parseAddressBook, serializeAddressBook} from './address-book';
import type {AddressBook} from './address-book';
import {getCustomerAccessToken} from './customer-auth';
import {setCustomerMetafields} from './admin-api';

// ── GraphQL Queries (Storefront API) ─────────────────────────────────────────

export const ADDRESS_BOOK_QUERY = `#graphql
  query CustomerAddressBook($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      addressBook: metafield(namespace: "custom", key: "address_book") {
        id
        value
      }
      surveyCompleted: metafield(namespace: "custom", key: "survey_completed") {
        value
      }
    }
  }
` as const;

export const CUSTOMER_ADDRESSES_QUERY = `#graphql
  query ShippingCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          provinceCode
          country
          countryCodeV2
          zip
          phone
          formatted
        }
      }
    }
  }
` as const;

// ── Storefront API Address Mutations ─────────────────────────────────────────

const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const SET_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

// ── Types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StorefrontLike = {
  query: (...args: any[]) => Promise<any>;
  mutate: (...args: any[]) => Promise<any>;
};

interface SessionLike {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  unset: (key: string) => void;
}

interface StorefrontContext {
  storefront: StorefrontLike;
  session: SessionLike;
  env: {
    ADMIN_APP_CLIENT_ID?: string;
    ADMIN_APP_CLIENT_SECRET?: string;
    PUBLIC_STORE_DOMAIN: string;
    [key: string]: string | undefined;
  };
}

// Legacy context type for backward compat — routes can pass either
interface LegacyContext {
  customerAccount: {
    query: (...args: any[]) => Promise<{data: Record<string, unknown>}>;
    mutate: (...args: any[]) => Promise<{data: Record<string, unknown>}>;
  };
}

// Accept either new Storefront context or legacy context
type AnyContext =
  | StorefrontContext
  | LegacyContext
  | (StorefrontContext & LegacyContext);

interface AddressBookQueryData {
  customer: {
    id: string;
    addressBook: {id: string; value: string} | null;
    surveyCompleted: {value: string} | null;
  };
}

export interface CustomerAddressNode {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  country?: string | null;
  countryCodeV2?: string | null;
  zip?: string | null;
  phone?: string | null;
  formatted?: string[];
}

interface CustomerAddressesData {
  customer: {
    defaultAddress: {id: string} | null;
    addresses: {
      nodes: CustomerAddressNode[];
    };
  };
}

// ── Helper: get access token from context ────────────────────────────────────

function getToken(context: AnyContext): string {
  if ('session' in context) {
    const token = getCustomerAccessToken(context.session);
    if (!token) {
      throw new Response(null, {
        status: 302,
        headers: {Location: '/account/login'},
      });
    }
    return token;
  }
  throw new Response(null, {
    status: 302,
    headers: {Location: '/account/login'},
  });
}

function getStorefront(context: AnyContext): StorefrontLike {
  if ('storefront' in context) return context.storefront;
  throw new Error('No storefront client in context');
}

function getEnv(context: AnyContext): StorefrontContext['env'] {
  if ('env' in context) return (context as StorefrontContext).env;
  throw new Error('No env available in context');
}

// ── Address Book Read/Write ──────────────────────────────────────────────────

export async function readAddressBook(
  context: AnyContext,
): Promise<{book: AddressBook; customerId: string; surveyCompleted: boolean}> {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const data = await storefront.query(ADDRESS_BOOK_QUERY, {
    variables: {customerAccessToken: token},
  });
  const customer = (data as AddressBookQueryData).customer;

  if (!customer) {
    return {
      book: parseAddressBook(null),
      customerId: '',
      surveyCompleted: false,
    };
  }

  return {
    book: parseAddressBook(customer.addressBook?.value ?? null),
    customerId: customer.id,
    surveyCompleted: customer.surveyCompleted?.value === 'true',
  };
}

export async function writeAddressBook(
  context: AnyContext,
  customerId: string,
  book: AddressBook,
): Promise<void> {
  const env = getEnv(context);
  await setCustomerMetafields(env, customerId, [
    {
      namespace: 'custom',
      key: 'address_book',
      value: serializeAddressBook(book),
      type: 'json',
    },
  ]);
}

export async function setSurveyCompleted(
  context: AnyContext,
  customerId: string,
): Promise<void> {
  const env = getEnv(context);
  await setCustomerMetafields(env, customerId, [
    {
      namespace: 'custom',
      key: 'survey_completed',
      value: 'true',
      type: 'boolean',
    },
  ]);
}

// ── Native Shopify Addresses ────────────────────────────────────────────────

export interface SavedShippingAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  provinceCode?: string | null;
  zip?: string | null;
  countryCodeV2?: string | null;
  phone?: string | null;
}

export async function readCustomerAddresses(context: AnyContext): Promise<{
  addresses: CustomerAddressNode[];
  defaultAddressId: string | null;
}> {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const data = await storefront.query(CUSTOMER_ADDRESSES_QUERY, {
    variables: {customerAccessToken: token},
  });
  const typed = data as CustomerAddressesData;

  return {
    addresses: typed.customer?.addresses?.nodes ?? [],
    defaultAddressId: typed.customer?.defaultAddress?.id ?? null,
  };
}

// ── Address Mutations (Storefront API) ───────────────────────────────────────

export async function createShopifyAddress(
  context: AnyContext,
  address: Record<string, string | undefined>,
) {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const result = await storefront.mutate(CREATE_ADDRESS_MUTATION, {
    variables: {customerAccessToken: token, address},
  });
  const {customerAddressCreate} = result as {
    customerAddressCreate: {
      customerAddress: {id: string} | null;
      customerUserErrors: Array<{
        code: string;
        field: string[];
        message: string;
      }>;
    };
  };

  const errors = customerAddressCreate?.customerUserErrors;
  if (errors?.length) {
    return {errors, addressId: null};
  }
  return {
    errors: null,
    addressId: customerAddressCreate?.customerAddress?.id ?? null,
  };
}

export async function updateShopifyAddress(
  context: AnyContext,
  addressId: string,
  address: Record<string, string | undefined>,
) {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const result = await storefront.mutate(UPDATE_ADDRESS_MUTATION, {
    variables: {customerAccessToken: token, id: addressId, address},
  });
  const {customerAddressUpdate} = result as {
    customerAddressUpdate: {
      customerAddress: {id: string} | null;
      customerUserErrors: Array<{
        code: string;
        field: string[];
        message: string;
      }>;
    };
  };

  return {errors: customerAddressUpdate?.customerUserErrors ?? null};
}

export async function deleteShopifyAddress(
  context: AnyContext,
  addressId: string,
) {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const result = await storefront.mutate(DELETE_ADDRESS_MUTATION, {
    variables: {customerAccessToken: token, id: addressId},
  });
  const {customerAddressDelete} = result as {
    customerAddressDelete: {
      deletedCustomerAddressId: string | null;
      customerUserErrors: Array<{
        code: string;
        field: string[];
        message: string;
      }>;
    };
  };

  return {errors: customerAddressDelete?.customerUserErrors ?? null};
}

export async function setDefaultShopifyAddress(
  context: AnyContext,
  addressId: string,
) {
  const storefront = getStorefront(context);
  const token = getToken(context);

  const result = await storefront.mutate(SET_DEFAULT_ADDRESS_MUTATION, {
    variables: {customerAccessToken: token, addressId},
  });
  const {customerDefaultAddressUpdate} = result as {
    customerDefaultAddressUpdate: {
      customer: {id: string} | null;
      customerUserErrors: Array<{
        code: string;
        field: string[];
        message: string;
      }>;
    };
  };

  return {errors: customerDefaultAddressUpdate?.customerUserErrors ?? null};
}
