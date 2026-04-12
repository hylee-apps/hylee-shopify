import {useCallback, useState} from 'react';
import {getSeoMeta} from '@shopify/hydrogen';
import {
  Link,
  redirect,
  useLoaderData,
  useActionData,
  useFetcher,
  Form,
} from 'react-router';
import {Card} from '~/components/ui/card';
import {cn} from '~/lib/utils';
import {CheckoutProgress} from '~/components/checkout/CheckoutProgress';
import {OrderSummary} from '~/components/checkout/OrderSummary';
import {ShippingCategorySelector} from '~/components/checkout/ShippingCategorySelector';
import {
  SHIPPING_METHODS,
  CHECKOUT_ATTR,
  CART_BUYER_IDENTITY_UPDATE,
  CART_ATTRIBUTES_UPDATE,
  buildCartAttributes,
  getCheckoutAttributes,
  validateShippingAddress,
  type ShippingAddress,
  type ValidationErrors,
} from '~/lib/checkout';
import {
  readAddressBook,
  readCustomerAddresses,
} from '~/lib/address-book-graphql';
import type {AddressBook} from '~/lib/address-book';
import type {SavedShippingAddress} from '~/components/checkout/ShippingCategorySelector';
import type {Route} from './+types/checkout.shipping';

// ============================================================================
// Route Meta
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return getSeoMeta({
    title: 'Shipping — Checkout',
    description: 'Enter your shipping address and select a shipping method.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();

  if (!cart || (cart.totalQuantity ?? 0) === 0) {
    throw redirect('/cart');
  }

  // Read any previously stored shipping data from cart attributes
  const checkoutData = getCheckoutAttributes(cart);

  // Optionally fetch address book + native addresses for logged-in users
  let addressBook: AddressBook | null = null;
  let savedAddresses: SavedShippingAddress[] = [];
  try {
    const {isCustomerLoggedIn: checkLoggedIn} =
      await import('~/lib/customer-auth');
    const isLoggedIn = checkLoggedIn(context.session);
    if (isLoggedIn) {
      const [bookResult, addressesResult] = await Promise.all([
        readAddressBook(context).catch(() => null),
        readCustomerAddresses(context).catch(() => ({
          addresses: [] as SavedShippingAddress[],
          defaultAddressId: null,
        })),
      ]);
      addressBook = bookResult?.book ?? null;
      savedAddresses = addressesResult.addresses as SavedShippingAddress[];
    }
  } catch {
    // Guest checkout — no address book or saved addresses
  }

  return {
    cart,
    savedAddress: checkoutData.shippingAddress,
    savedDeliveryInstructions: checkoutData.deliveryInstructions,
    savedShippingCategory: checkoutData.shippingCategory,
    savedContactId: checkoutData.shippingContactId,
    addressBook,
    savedAddresses,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const cart = await context.cart.get();
  if (!cart?.id) throw redirect('/cart');

  const formData = await request.formData();

  // Auto-save intent: persist selected address without validation or redirect,
  // so navigating to an earlier step and returning doesn't lose the filled data.
  if (formData.get('intent') === 'autosave') {
    const addressJson = formData.get('addressJson') as string | null;
    const deliveryInstructions = formData.get('deliveryInstructions') as
      | string
      | null;
    // Preserve all existing cart attributes so we don't clobber payment_method etc.
    const existingAttrs = Object.fromEntries(
      (cart.attributes ?? []).map(
        (a) => [a.key, a.value ?? undefined] as [string, string | undefined],
      ),
    );
    await context.storefront.mutate(CART_ATTRIBUTES_UPDATE, {
      variables: {
        cartId: cart.id,
        attributes: buildCartAttributes({
          ...existingAttrs,
          ...(addressJson
            ? {[CHECKOUT_ATTR.SHIPPING_ADDRESS]: addressJson}
            : {}),
          ...(deliveryInstructions !== null
            ? {[CHECKOUT_ATTR.DELIVERY_INSTRUCTIONS]: deliveryInstructions}
            : {}),
        }),
      },
    });
    return {};
  }

  // Parse address fields
  const address: ShippingAddress = {
    firstName: (formData.get('firstName') as string) ?? '',
    lastName: (formData.get('lastName') as string) ?? '',
    address1: (formData.get('address1') as string) ?? '',
    address2: (formData.get('address2') as string) ?? '',
    city: (formData.get('city') as string) ?? '',
    zip: (formData.get('zip') as string) ?? '',
    state: (formData.get('state') as string) ?? '',
    phone: (formData.get('phone') as string) ?? '',
    email: (formData.get('email') as string) ?? '',
  };

  const shippingMethodId =
    (formData.get('shippingMethod') as string) ?? 'standard';
  const deliveryInstructions =
    (formData.get('deliveryInstructions') as string) ?? '';
  const shippingCategory = (formData.get('shippingCategory') as string) || '';
  const shippingRecipientLabel =
    (formData.get('shippingRecipientLabel') as string) || '';
  const shippingContactId = (formData.get('shippingContactId') as string) || '';

  // Validate
  const errors = validateShippingAddress(address);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      {errors, address, shippingMethodId, deliveryInstructions},
      {status: 400},
    );
  }

  const selectedMethod = SHIPPING_METHODS.find(
    (m) => m.id === shippingMethodId,
  );

  // Update buyer identity (email, phone, country)
  await context.storefront.mutate(CART_BUYER_IDENTITY_UPDATE, {
    variables: {
      cartId: cart.id,
      buyerIdentity: {
        email: address.email,
        phone: address.phone || undefined,
        countryCode: 'US',
      },
    },
  });

  // Store checkout data in cart attributes
  await context.storefront.mutate(CART_ATTRIBUTES_UPDATE, {
    variables: {
      cartId: cart.id,
      attributes: buildCartAttributes({
        [CHECKOUT_ATTR.SHIPPING_ADDRESS]: JSON.stringify(address),
        [CHECKOUT_ATTR.SHIPPING_METHOD]: shippingMethodId,
        [CHECKOUT_ATTR.SHIPPING_COST]: selectedMethod
          ? String(selectedMethod.price)
          : '5.99',
        [CHECKOUT_ATTR.DELIVERY_INSTRUCTIONS]: deliveryInstructions,
        [CHECKOUT_ATTR.SHIPPING_CATEGORY]: shippingCategory || undefined,
        [CHECKOUT_ATTR.SHIPPING_RECIPIENT_LABEL]:
          shippingRecipientLabel || undefined,
        [CHECKOUT_ATTR.SHIPPING_CONTACT_ID]: shippingContactId || undefined,
      }),
    },
  });

  // Store delivery instructions in cart note as well
  if (deliveryInstructions) {
    await context.cart.updateNote(deliveryInstructions);
  }

  throw redirect('/checkout/review');
}

// ============================================================================
// Shipping Address Card
// ============================================================================

function ShippingAddressCard({
  defaultValues,
  errors,
}: {
  defaultValues?: Partial<ShippingAddress> | null;
  errors?: ValidationErrors;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-[21px]">
        <h2 className="text-lg font-bold text-[#111827]">Shipping Address</h2>
      </div>

      <div className="flex flex-col gap-5 px-6 py-6">
        {/* First Name / Last Name */}
        <div className="flex gap-4">
          <FormField
            label="First Name"
            name="firstName"
            placeholder="John"
            defaultValue={defaultValues?.firstName}
            error={errors?.firstName}
          />
          <FormField
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            defaultValue={defaultValues?.lastName}
            error={errors?.lastName}
          />
        </div>

        {/* Address — Address1 and Address2 share one label (Figma groups them) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="address1"
            className="text-sm font-medium text-[#374151]"
          >
            Address
          </label>
          <input
            id="address1"
            type="text"
            name="address1"
            placeholder="123 Main Street"
            defaultValue={defaultValues?.address1 ?? ''}
            className={cn(
              'h-[44px] w-full rounded-[8px] border bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary',
              errors?.address1 ? 'border-red-400' : 'border-[#d1d5db]',
            )}
          />
          {errors?.address1 && (
            <span className="text-xs text-red-500">{errors.address1}</span>
          )}
          <input
            type="text"
            name="address2"
            placeholder="Apt, suite, unit (optional)"
            defaultValue={defaultValues?.address2 ?? ''}
            className="h-[44px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>

        {/* City / ZIP Code */}
        <div className="flex gap-4">
          <FormField
            label="City"
            name="city"
            placeholder="New York"
            defaultValue={defaultValues?.city}
            error={errors?.city}
          />
          <FormField
            label="ZIP Code"
            name="zip"
            placeholder="10001"
            defaultValue={defaultValues?.zip}
            error={errors?.zip}
          />
        </div>

        {/* State / Phone */}
        <div className="flex gap-4">
          <FormField
            label="State"
            name="state"
            placeholder="NY"
            defaultValue={defaultValues?.state}
            error={errors?.state}
          />
          <FormField
            label="Phone"
            name="phone"
            placeholder="(555) 123-4567"
            type="tel"
            defaultValue={defaultValues?.phone}
            error={errors?.phone}
          />
        </div>

        {/* Email */}
        <FormField
          label="Email"
          name="email"
          placeholder="john.doe@example.com"
          type="email"
          defaultValue={defaultValues?.email}
          error={errors?.email}
        />
      </div>
    </Card>
  );
}

// ============================================================================
// Shipping Method Card
// ============================================================================

function ShippingMethodCard() {
  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 pt-5 pb-[21px]">
        <h2 className="text-lg font-bold text-[#111827]">Shipping Method</h2>
      </div>
      <div className="flex flex-col gap-3 px-[24px] pt-[24px] pb-[36px]">
        {/* Standard is the only option — simplified per Mar 15 production decision */}
        <div className="flex items-center justify-between rounded-[8px] border-2 border-secondary bg-secondary/5 p-[18px]">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-medium text-[#1f2937]">
              Standard Shipping
            </span>
            <span className="text-[13px] text-[#6b7280]">
              5-7 business days
            </span>
          </div>
          <span className="text-base font-semibold text-[#111827]">$5.99</span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Delivery Preferences Card
// ============================================================================

function DeliveryPreferencesCard({
  defaultValue,
  onBlurSave,
}: {
  defaultValue?: string;
  onBlurSave?: (value: string) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 pt-5 pb-[21px]">
        <h2 className="text-lg font-bold text-[#111827]">
          Delivery Preferences
        </h2>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#374151]">
            Delivery Instructions (Optional)
          </label>
          <textarea
            name="deliveryInstructions"
            placeholder="Leave at front door, call upon arrival, etc."
            defaultValue={defaultValue ?? ''}
            rows={3}
            className="w-full resize-none rounded-[8px] border border-[#d1d5db] bg-white px-[17px] pt-[13px] pb-[49px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            onBlur={(e) => onBlurSave?.(e.currentTarget.value)}
          />
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Form Field
// ============================================================================

function FormField({
  label,
  name,
  placeholder,
  type = 'text',
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-[#374151]">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={cn(
          'h-[44px] w-full rounded-[8px] border bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary',
          error ? 'border-red-400' : 'border-[#d1d5db]',
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function CheckoutShippingPage() {
  const {
    cart,
    savedAddress,
    savedDeliveryInstructions,
    savedShippingCategory,
    savedContactId,
    addressBook,
    savedAddresses,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    errors?: ValidationErrors;
    address?: Partial<ShippingAddress>;
    deliveryInstructions?: string;
  }>();

  // Track form key to force re-render when address is auto-filled
  const [formKey, setFormKey] = useState(0);
  const [filledAddress, setFilledAddress] = useState<ShippingAddress | null>(
    null,
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    savedDeliveryInstructions ?? '',
  );
  const autosaveFetcher = useFetcher();

  const handleAddressFill = useCallback(
    (address: ShippingAddress) => {
      setFilledAddress(address);
      setFormKey((k) => k + 1);
      // Persist to cart attributes immediately so the address survives navigation
      // to an earlier step without submitting the form.
      autosaveFetcher.submit(
        {
          intent: 'autosave',
          addressJson: JSON.stringify(address),
          deliveryInstructions,
        },
        {method: 'post'},
      );
    },
    [autosaveFetcher, deliveryInstructions],
  );

  const handleDeliveryInstructionsBlur = useCallback(
    (value: string) => {
      setDeliveryInstructions(value);
      autosaveFetcher.submit(
        {
          intent: 'autosave',
          deliveryInstructions: value,
        },
        {method: 'post'},
      );
    },
    [autosaveFetcher],
  );

  // Use action data for form repopulation on error, or filled address, or saved data from cart
  const formDefaults = actionData?.address ?? filledAddress ?? savedAddress;
  const shippingCost = SHIPPING_METHODS[0];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <CheckoutProgress currentStep="shipping" />

      <Form method="post" className="mx-auto max-w-[1443px] px-6 py-8">
        {/* Hidden field for shipping method — standard only */}
        <input type="hidden" name="shippingMethod" value="standard" />

        <div className="grid grid-cols-[1fr_400px] items-start gap-8">
          {/* Left: Main content */}
          <div className="flex flex-col gap-6">
            <ShippingCategorySelector
              book={addressBook}
              savedAddresses={savedAddresses}
              defaultCategory={savedShippingCategory}
              defaultContactId={savedContactId}
              onAddressFill={handleAddressFill}
            />
            <ShippingAddressCard
              key={formKey}
              defaultValues={formDefaults}
              errors={actionData?.errors}
            />
            <ShippingMethodCard />
            <DeliveryPreferencesCard
              defaultValue={
                actionData?.deliveryInstructions ?? savedDeliveryInstructions
              }
              onBlurSave={handleDeliveryInstructionsBlur}
            />
          </div>

          {/* Right: Order Summary */}
          <OrderSummary
            cart={cart as any}
            showProductItems
            shippingDisplay={
              shippingCost ? `$${shippingCost.price.toFixed(2)}` : null
            }
            cta={{
              label: 'Continue to Review',
              href: '#',
              isSubmit: true,
              icon: 'arrow',
            }}
            back={{
              label: 'Return to Payment',
              href: '/checkout/payment',
            }}
          />
        </div>
      </Form>
    </div>
  );
}
