import {useState} from 'react';
import {getSeoMeta} from '@shopify/hydrogen';
import {Link, redirect, useLoaderData, useActionData, Form} from 'react-router';
import {Card} from '~/components/ui/card';
import {cn} from '~/lib/utils';
import {CheckoutProgress} from '~/components/checkout/CheckoutProgress';
import {OrderSummary} from '~/components/checkout/OrderSummary';
import {
  SHIPPING_METHODS,
  CHECKOUT_ATTR,
  CART_BUYER_IDENTITY_UPDATE,
  CART_ATTRIBUTES_UPDATE,
  buildCartAttributes,
  getCheckoutAttributes,
  validateShippingAddress,
  formatMoney,
  type ShippingMethodId,
  type ShippingAddress,
  type ValidationErrors,
} from '~/lib/checkout';
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

  return {
    cart,
    savedAddress: checkoutData.shippingAddress,
    savedMethodId: checkoutData.shippingMethod?.id ?? 'standard',
    savedDeliveryInstructions: checkoutData.deliveryInstructions,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const cart = await context.cart.get();
  if (!cart?.id) throw redirect('/cart');

  const formData = await request.formData();

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
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
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

        {/* Address */}
        <FormField
          label="Address"
          name="address1"
          placeholder="123 Main Street"
          defaultValue={defaultValues?.address1}
          error={errors?.address1}
        />

        {/* Apt / Suite */}
        <div>
          <input
            type="text"
            name="address2"
            placeholder="Apt, suite, unit (optional)"
            defaultValue={defaultValues?.address2 ?? ''}
            className="h-[44px] w-full rounded-lg border border-[#d1d5db] bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
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

function ShippingMethodCard({
  selected,
  onSelect,
}: {
  selected: ShippingMethodId;
  onSelect: (id: ShippingMethodId) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">Shipping Method</h2>
      </div>

      <div className="flex flex-col gap-3 p-6">
        {SHIPPING_METHODS.map((method) => {
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border-2 p-[18px] text-left transition-colors',
                isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-border hover:border-secondary/40',
              )}
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold text-[#111827]">
                  {method.label}
                </span>
                <span className="text-sm text-[#6b7280]">
                  {method.description}
                </span>
              </div>
              <span className="text-base font-semibold text-[#111827]">
                ${method.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Delivery Preferences Card
// ============================================================================

function DeliveryPreferencesCard({defaultValue}: {defaultValue?: string}) {
  return (
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 py-5">
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
            className="w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-[17px] py-[13px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
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
          'h-[44px] w-full rounded-lg border bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary',
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
  const {cart, savedAddress, savedMethodId, savedDeliveryInstructions} =
    useLoaderData<typeof loader>();
  const actionData = useActionData<{
    errors?: ValidationErrors;
    address?: Partial<ShippingAddress>;
    shippingMethodId?: string;
    deliveryInstructions?: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState<ShippingMethodId>(
    (actionData?.shippingMethodId as ShippingMethodId) ??
      savedMethodId ??
      'standard',
  );

  // Use action data for form repopulation on error, or saved data from cart
  const formDefaults = actionData?.address ?? savedAddress;
  const shippingCost = SHIPPING_METHODS.find((m) => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <CheckoutProgress currentStep="shipping" />

      <Form method="post" className="mx-auto max-w-[1443px] px-6 py-8">
        {/* Hidden field for shipping method */}
        <input type="hidden" name="shippingMethod" value={selectedMethod} />

        <div className="flex items-start gap-8">
          {/* Left: Main content */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <ShippingAddressCard
              defaultValues={formDefaults}
              errors={actionData?.errors}
            />
            {/* <ShippingMethodCard
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            /> */}
            <DeliveryPreferencesCard
              defaultValue={
                actionData?.deliveryInstructions ?? savedDeliveryInstructions
              }
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
