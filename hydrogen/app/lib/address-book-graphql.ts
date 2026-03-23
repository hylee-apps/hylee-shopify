// ============================================================================
// Address Book — GraphQL queries, mutations, and Customer Account API helpers
// ============================================================================

import {parseAddressBook, serializeAddressBook} from './address-book';
import type {AddressBook} from './address-book';

// ── GraphQL Queries ────────────────────────────────────────────────────────

export const ADDRESS_BOOK_QUERY = `#graphql
  query CustomerAddressBook {
    customer {
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

export const METAFIELDS_SET_MUTATION = `#graphql
  mutation CustomerMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

// ── Types ──────────────────────────────────────────────────────────────────

interface CustomerAccountContext {
  customerAccount: {
    query: (
      query: string,
      options?: {variables?: Record<string, unknown>},
    ) => Promise<{
      data: Record<string, unknown>;
    }>;
    mutate: (
      mutation: string,
      options?: {variables?: Record<string, unknown>},
    ) => Promise<{
      data: Record<string, unknown>;
    }>;
  };
}

interface AddressBookQueryData {
  customer: {
    id: string;
    addressBook: {id: string; value: string} | null;
    surveyCompleted: {value: string} | null;
  };
}

interface MetafieldsSetData {
  metafieldsSet: {
    metafields: Array<{id: string; key: string; value: string}>;
    userErrors: Array<{field: string[]; message: string}>;
  };
}

// ── Native Shopify Addresses ──────────────────────────────────────────────

export const CUSTOMER_ADDRESSES_QUERY = `#graphql
  query ShippingCustomerAddresses {
    customer {
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          zoneCode
          zip
          territoryCode
          phoneNumber
        }
      }
    }
  }
` as const;

interface CustomerAddressNode {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zoneCode?: string | null;
  zip?: string | null;
  territoryCode?: string | null;
  phoneNumber?: string | null;
}

interface CustomerAddressesData {
  customer: {
    addresses: {
      nodes: CustomerAddressNode[];
    };
  };
}

export async function readCustomerAddresses(
  context: CustomerAccountContext,
): Promise<CustomerAddressNode[]> {
  const {data} = await context.customerAccount.query(CUSTOMER_ADDRESSES_QUERY);
  const typed = data as unknown as CustomerAddressesData;
  return typed.customer?.addresses?.nodes ?? [];
}

// ── Helpers ────────────────────────────────────────────────────────────────

export async function readAddressBook(
  context: CustomerAccountContext,
): Promise<{book: AddressBook; customerId: string; surveyCompleted: boolean}> {
  const {data} = await context.customerAccount.query(ADDRESS_BOOK_QUERY);
  const typed = data as unknown as AddressBookQueryData;
  const customer = typed.customer;

  return {
    book: parseAddressBook(customer.addressBook?.value ?? null),
    customerId: customer.id,
    surveyCompleted: customer.surveyCompleted?.value === 'true',
  };
}

export async function writeAddressBook(
  context: CustomerAccountContext,
  customerId: string,
  book: AddressBook,
): Promise<void> {
  const {data} = await context.customerAccount.mutate(METAFIELDS_SET_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: customerId,
          namespace: 'custom',
          key: 'address_book',
          type: 'json',
          value: serializeAddressBook(book),
        },
      ],
    },
  });

  const typed = data as unknown as MetafieldsSetData;
  const errors = typed.metafieldsSet?.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(
      `Failed to write address book: ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}

export async function setSurveyCompleted(
  context: CustomerAccountContext,
  customerId: string,
): Promise<void> {
  const {data} = await context.customerAccount.mutate(METAFIELDS_SET_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: customerId,
          namespace: 'custom',
          key: 'survey_completed',
          type: 'boolean',
          value: 'true',
        },
      ],
    },
  });

  const typed = data as unknown as MetafieldsSetData;
  const errors = typed.metafieldsSet?.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(
      `Failed to set survey completed: ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}
