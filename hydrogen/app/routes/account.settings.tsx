import type {Route} from './+types/account.settings';
import {
  redirect,
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {
  isCustomerLoggedIn,
  getCustomerAccessToken,
  loginCustomer,
} from '~/lib/customer-auth';
import {getInitials} from '~/lib/account-helpers';
import {setCustomerMetafields, type AdminEnv} from '~/lib/admin-api';
import {Camera} from 'lucide-react';
import {useEffect, useRef} from 'react';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Profile Information',
    description: 'Manage your profile information and password.',
  });
}

// ============================================================================
// GraphQL (Storefront API)
// ============================================================================

const CUSTOMER_SETTINGS_QUERY = `#graphql
  query CustomerSettings($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth: metafield(namespace: "custom", key: "date_of_birth") {
        value
      }
    }
  }
` as const;

const UPDATE_CUSTOMER_MUTATION = `#graphql
  mutation UpdateCustomer($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        firstName
        lastName
        phone
      }
      customerUserErrors {
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
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const token = getCustomerAccessToken(context.session)!;
  const data = await context.storefront.query(CUSTOMER_SETTINGS_QUERY, {
    variables: {customerAccessToken: token},
  });

  const customer = data.customer;
  return {
    customer,
    dateOfBirth: customer?.dateOfBirth?.value ?? null,
  };
}

// ============================================================================
// Action
// ============================================================================

interface ActionError {
  field: string[] | string;
  message: string;
}

export async function action({request, context}: Route.ActionArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const token = getCustomerAccessToken(context.session)!;

  switch (intent) {
    case 'updateProfile': {
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const rawPhone = (formData.get('phone') as string) ?? '';
      const dateOfBirth = (formData.get('dateOfBirth') as string) || null;

      // Normalize phone to E.164 format for Shopify (e.g. "+15551234567")
      const digits = rawPhone.replace(/\D/g, '');
      let phone: string | null = null;
      if (digits.length > 0) {
        phone = digits.length === 10 ? `+1${digits}` : `+${digits}`;
      }

      const data = await context.storefront.mutate(UPDATE_CUSTOMER_MUTATION, {
        variables: {
          customerAccessToken: token,
          customer: {firstName, lastName, phone},
        },
      });
      const errors = data?.customerUpdate?.customerUserErrors;
      if (errors?.length) {
        return {errors: errors as ActionError[], intent};
      }

      // Save date of birth as customer metafield via Admin API
      if (dateOfBirth) {
        try {
          // Fetch customer ID for Admin API
          const customerData = await context.storefront.query(
            CUSTOMER_SETTINGS_QUERY,
            {variables: {customerAccessToken: token}},
          );
          const customerId = customerData?.customer?.id;
          if (customerId) {
            await setCustomerMetafields(
              context.env as unknown as AdminEnv,
              customerId,
              [
                {
                  namespace: 'custom',
                  key: 'date_of_birth',
                  value: dateOfBirth,
                  type: 'date',
                },
              ],
            );
          }
        } catch (e) {
          console.error('Failed to save date of birth:', e);
          // Non-blocking — profile still saved successfully
        }
      }

      return {success: true, intent, message: 'Profile updated successfully.'};
    }

    case 'updatePassword': {
      const currentPassword = formData.get('currentPassword') as string;
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          errors: [
            {field: 'password', message: 'All password fields are required.'},
          ] as ActionError[],
          intent,
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          errors: [
            {field: 'confirmPassword', message: 'Passwords do not match.'},
          ] as ActionError[],
          intent,
        };
      }

      if (newPassword.length < 8) {
        return {
          errors: [
            {
              field: 'newPassword',
              message: 'Password must be at least 8 characters.',
            },
          ] as ActionError[],
          intent,
        };
      }

      // Re-authenticate with current password to verify it's correct
      const customerData = await context.storefront.query(
        CUSTOMER_SETTINGS_QUERY,
        {variables: {customerAccessToken: token}},
      );
      const email = customerData?.customer?.email;
      if (!email) {
        return {
          errors: [
            {field: 'password', message: 'Unable to verify identity.'},
          ] as ActionError[],
          intent,
        };
      }

      const loginResult = await loginCustomer(
        context.storefront,
        email,
        currentPassword,
      );
      if ('errors' in loginResult) {
        return {
          errors: [
            {
              field: 'currentPassword',
              message: 'Current password is incorrect.',
            },
          ] as ActionError[],
          intent,
        };
      }

      // Update password
      const data = await context.storefront.mutate(UPDATE_CUSTOMER_MUTATION, {
        variables: {
          customerAccessToken: token,
          customer: {password: newPassword},
        },
      });
      const errors = data?.customerUpdate?.customerUserErrors;
      if (errors?.length) {
        return {errors: errors as ActionError[], intent};
      }
      return {
        success: true,
        intent,
        message: 'Password updated successfully.',
      };
    }

    default:
      return {
        errors: [{field: 'intent', message: 'Unknown action'}] as ActionError[],
      };
  }
}

// ============================================================================
// Shared Styles
// ============================================================================

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-[17px] py-[13px] text-[15px] text-black placeholder:text-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary';

const LABEL_CLASS = 'block text-sm font-medium text-gray-700 leading-[21px]';

const BUTTON_CLASS =
  'rounded-lg bg-secondary px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50';

// ============================================================================
// Main Component
// ============================================================================

export default function SettingsPage({loaderData}: Route.ComponentProps) {
  const {customer, dateOfBirth} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent =
    isSubmitting && navigation.formData
      ? (navigation.formData.get('intent') as string)
      : null;

  const initials = getInitials(
    customer?.firstName ?? null,
    customer?.lastName ?? null,
  );

  // Reset password form after successful submission
  const passwordFormRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (actionData?.intent === 'updatePassword' && actionData?.success) {
      passwordFormRef.current?.reset();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-2xl font-light text-gray-800 leading-[42px] sm:text-[28px]">
        Profile Information
      </h1>

      {/* ================================================================ */}
      {/* Card 1: Personal Information                                     */}
      {/* ================================================================ */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            Personal Information
          </h2>
        </div>

        {/* Card Body */}
        <div className="flex flex-col gap-8 p-4 sm:p-6">
          {/* Avatar + Change Photo */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div
              className="flex size-[100px] shrink-0 items-center justify-center rounded-full text-[40px] font-medium text-white leading-[60px]"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-brand-accent) 100%)',
              }}
            >
              {initials}
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-[25px] py-[13px] text-[15px] font-medium text-gray-700 opacity-50 cursor-not-allowed"
              >
                <Camera size={15} />
                Change Photo
              </button>
              <p className="text-[13px] text-gray-500 leading-[19.5px]">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <Form method="post" className="flex flex-col">
            <input type="hidden" name="intent" value="updateProfile" />

            {/* Success/Error for profile */}
            {actionData?.intent === 'updateProfile' && actionData?.success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {actionData.message}
              </div>
            )}
            {actionData?.intent === 'updateProfile' && actionData?.errors && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(actionData.errors as ActionError[]).map((e, i) => (
                  <p key={i}>{e.message}</p>
                ))}
              </div>
            )}

            {/* First Name + Last Name */}
            <div className="flex flex-col gap-4 pb-5 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="firstName" className={LABEL_CLASS}>
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  defaultValue={customer?.firstName ?? ''}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="lastName" className={LABEL_CLASS}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  defaultValue={customer?.lastName ?? ''}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Email Address (read-only) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={LABEL_CLASS}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={customer?.email ?? ''}
                readOnly
                className={`${INPUT_CLASS} cursor-not-allowed bg-gray-50 text-gray-500`}
              />
              <p className="text-xs text-gray-500">
                Contact support to change your email address
              </p>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2 pt-5">
              <label htmlFor="phone" className={LABEL_CLASS}>
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer?.phone ?? ''}
                placeholder="(555) 123-4567"
                className={INPUT_CLASS}
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2 py-5">
              <label htmlFor="dateOfBirth" className={LABEL_CLASS}>
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={dateOfBirth ?? ''}
                className={INPUT_CLASS}
              />
            </div>

            {/* Save Changes */}
            <button
              type="submit"
              disabled={submittingIntent === 'updateProfile'}
              className={BUTTON_CLASS}
              style={{width: 'fit-content'}}
            >
              {submittingIntent === 'updateProfile'
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </Form>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Card 2: Change Password                                          */}
      {/* ================================================================ */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6">
          <Form ref={passwordFormRef} method="post" className="flex flex-col">
            <input type="hidden" name="intent" value="updatePassword" />

            {/* Success/Error for password */}
            {actionData?.intent === 'updatePassword' && actionData?.success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {actionData.message}
              </div>
            )}
            {actionData?.intent === 'updatePassword' && actionData?.errors && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(actionData.errors as ActionError[]).map((e, i) => (
                  <p key={i}>{e.message}</p>
                ))}
              </div>
            )}

            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="currentPassword" className={LABEL_CLASS}>
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                className={INPUT_CLASS}
              />
            </div>

            {/* New Password + Confirm */}
            <div className="flex flex-col gap-4 py-5 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="newPassword" className={LABEL_CLASS}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Update Password */}
            <button
              type="submit"
              disabled={submittingIntent === 'updatePassword'}
              className={BUTTON_CLASS}
              style={{width: 'fit-content'}}
            >
              {submittingIntent === 'updatePassword'
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[42px] w-64 animate-pulse rounded bg-gray-200" />
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex flex-col gap-8 p-6">
          <div className="flex items-center gap-6">
            <div className="size-[100px] animate-pulse rounded-full bg-gray-200" />
            <div className="flex flex-col gap-2">
              <div className="h-[43px] w-40 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="h-[45px] w-36 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-[45px] animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
          <div className="h-[45px] w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
