import type {Route} from './+types/account.settings';
import {Form, useActionData, useNavigation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {getInitials} from '~/lib/account-helpers';
import {setCustomerMetafields, type AdminEnv} from '~/lib/admin-api';
import {requireAuth} from '~/lib/customer-auth';
import {Camera} from 'lucide-react';
import {useTranslation} from 'react-i18next';

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
// GraphQL (Customer Account API)
// ============================================================================

const CUSTOMER_SETTINGS_QUERY = `#graphql
  query CustomerSettings($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
    }
  }
` as const;

const UPDATE_CUSTOMER_MUTATION = `#graphql
  mutation UpdateCustomer($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        firstName
        lastName
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
  const token = requireAuth(context.session);

  const {customer} = await context.storefront.query(CUSTOMER_SETTINGS_QUERY, {
    variables: {customerAccessToken: token},
  });

  return {
    customer: customer
      ? {
          id: customer.id,
          firstName: customer.firstName ?? null,
          lastName: customer.lastName ?? null,
          email: customer.email ?? null,
        }
      : null,
    dateOfBirth: null as string | null,
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
  const token = requireAuth(context.session);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'updateProfile': {
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const dateOfBirth = (formData.get('dateOfBirth') as string) || null;

      const {customerUpdate} = await context.storefront.mutate(
        UPDATE_CUSTOMER_MUTATION,
        {
          variables: {
            customerAccessToken: token,
            customer: {firstName, lastName},
          },
        },
      );
      const errors = customerUpdate?.customerUserErrors;
      if (errors?.length) {
        return {errors: errors as ActionError[], intent};
      }

      // Save date of birth as customer metafield via Admin API
      if (dateOfBirth) {
        try {
          const {customer: idCustomer} = await context.storefront.query(
            CUSTOMER_SETTINGS_QUERY,
            {variables: {customerAccessToken: token}},
          );
          const customerId = idCustomer?.id;
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
        }
      }

      return {
        success: true,
        intent,
        message: 'settings.success.profileUpdated',
      };
    }

    default:
      return {
        errors: [
          {field: 'intent', message: 'settings.error.unknownAction'},
        ] as ActionError[],
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
  const {t} = useTranslation('common');
  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent =
    isSubmitting && navigation.formData
      ? (navigation.formData.get('intent') as string)
      : null;

  const initials = getInitials(
    customer?.firstName ?? null,
    customer?.lastName ?? null,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-2xl font-light text-gray-800 leading-[42px] sm:text-[28px]">
        {t('settings.pageTitle')}
      </h1>

      {/* ================================================================ */}
      {/* Card 1: Personal Information                                     */}
      {/* ================================================================ */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('settings.personalInfo.cardTitle')}
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
                {t('settings.personalInfo.changePhoto')}
              </button>
              <p className="text-[13px] text-gray-500 leading-[19.5px]">
                {t('settings.personalInfo.photoHint')}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <Form method="post" className="flex flex-col">
            <input type="hidden" name="intent" value="updateProfile" />

            {/* Success/Error for profile */}
            {actionData?.intent === 'updateProfile' && actionData?.success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {t(actionData.message as string)}
              </div>
            )}
            {actionData?.intent === 'updateProfile' && actionData?.errors && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(actionData.errors as ActionError[]).map((e, i) => (
                  <p key={i}>{t(e.message)}</p>
                ))}
              </div>
            )}

            {/* First Name + Last Name */}
            <div className="flex flex-col gap-4 pb-5 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="firstName" className={LABEL_CLASS}>
                  {t('settings.personalInfo.firstName')}
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
                  {t('settings.personalInfo.lastName')}
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
                {t('settings.personalInfo.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                value={customer?.email ?? ''}
                readOnly
                className={`${INPUT_CLASS} cursor-not-allowed bg-gray-50 text-gray-500`}
              />
              <p className="text-xs text-gray-500">
                {t('settings.personalInfo.emailReadonlyHint')}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2 py-5">
              <label htmlFor="dateOfBirth" className={LABEL_CLASS}>
                {t('settings.personalInfo.dateOfBirth')}
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
                ? t('settings.personalInfo.saving')
                : t('settings.personalInfo.saveChanges')}
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
