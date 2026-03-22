// ============================================================================
// Checkout utilities — GraphQL mutations, types, and helpers
// ============================================================================

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  state: string;
  phone: string;
  email: string;
}

export type ShippingMethodId = 'standard' | 'expedited' | 'next-day';

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    label: 'Standard Shipping',
    description: '5-7 business days',
    price: 5.99,
  },
  {
    id: 'expedited',
    label: 'Expedited Shipping',
    description: '2-3 business days',
    price: 12.99,
  },
  {
    id: 'next-day',
    label: 'Next Day Delivery',
    description: 'Next business day',
    price: 24.99,
  },
];

export type PaymentMethodType = 'credit' | 'shopify' | 'apple' | 'google';

// ── Cart Attribute Keys ────────────────────────────────────────────────────

export const CHECKOUT_ATTR = {
  SHIPPING_ADDRESS: 'checkout_shipping_address',
  SHIPPING_METHOD: 'checkout_shipping_method',
  SHIPPING_COST: 'checkout_shipping_cost',
  DELIVERY_INSTRUCTIONS: 'checkout_delivery_instructions',
  PAYMENT_METHOD: 'checkout_payment_method',
  SHIPPING_CATEGORY: 'checkout_shipping_category',
  SHIPPING_RECIPIENT_LABEL: 'checkout_shipping_recipient',
  SHIPPING_CONTACT_ID: 'checkout_shipping_contact_id',
} as const;

// ── GraphQL Mutations ──────────────────────────────────────────────────────

export const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_ATTRIBUTES_UPDATE = `#graphql
  mutation CartAttributesUpdate(
    $cartId: ID!
    $attributes: [AttributeInput!]!
  ) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        id
        attributes {
          key
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Read checkout-related attributes from the cart object.
 */
export function getCheckoutAttributes(cart: {
  attributes?: Array<{key: string; value?: string | null | undefined}>;
}) {
  const attrs = cart.attributes ?? [];
  const get = (key: string): string | undefined =>
    attrs.find((a) => a.key === key)?.value ?? undefined;

  const addressJson = get(CHECKOUT_ATTR.SHIPPING_ADDRESS);
  const shippingAddress: ShippingAddress | null = addressJson
    ? (JSON.parse(addressJson) as ShippingAddress)
    : null;

  const shippingMethodId = get(CHECKOUT_ATTR.SHIPPING_METHOD) as
    | ShippingMethodId
    | undefined;
  const shippingMethod = SHIPPING_METHODS.find(
    (m) => m.id === shippingMethodId,
  );

  const shippingCost = get(CHECKOUT_ATTR.SHIPPING_COST);
  const deliveryInstructions = get(CHECKOUT_ATTR.DELIVERY_INSTRUCTIONS);
  const paymentMethod = get(CHECKOUT_ATTR.PAYMENT_METHOD) as
    | PaymentMethodType
    | undefined;

  const shippingCategory = get(CHECKOUT_ATTR.SHIPPING_CATEGORY) ?? null;
  const shippingRecipientLabel =
    get(CHECKOUT_ATTR.SHIPPING_RECIPIENT_LABEL) ?? null;
  const shippingContactId = get(CHECKOUT_ATTR.SHIPPING_CONTACT_ID) ?? null;

  return {
    shippingAddress,
    shippingMethod: shippingMethod ?? null,
    shippingCost: shippingCost ? parseFloat(shippingCost) : null,
    deliveryInstructions: deliveryInstructions ?? '',
    paymentMethod: paymentMethod ?? null,
    shippingCategory,
    shippingRecipientLabel,
    shippingContactId,
  };
}

/**
 * Build the attributes array for a cartAttributesUpdate mutation.
 * Only includes keys that have changed (non-undefined values).
 */
export function buildCartAttributes(
  updates: Partial<Record<string, string | undefined>>,
): Array<{key: string; value: string}> {
  return Object.entries(updates)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([key, value]) => ({key, value}));
}

// ── Validation ─────────────────────────────────────────────────────────────

export interface ValidationErrors {
  [field: string]: string;
}

export function validateShippingAddress(
  address: Partial<ShippingAddress>,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!address.firstName?.trim()) errors.firstName = 'First name is required';
  if (!address.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!address.address1?.trim()) errors.address1 = 'Address is required';
  if (!address.city?.trim()) errors.city = 'City is required';
  if (!address.zip?.trim()) errors.zip = 'ZIP code is required';
  if (!address.state?.trim()) errors.state = 'State is required';
  if (!address.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
}

// ── Format helpers ─────────────────────────────────────────────────────────

export function formatMoney(money: {
  amount: string;
  currencyCode: string;
}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

export function formatShippingMethodLabel(method: ShippingMethod): string {
  return `${method.label} (${method.description}) - $${method.price.toFixed(2)}`;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  credit: 'Credit / Debit Card',
  shopify: 'Shop Pay',
  apple: 'Apple Pay',
  google: 'Google Pay',
};
