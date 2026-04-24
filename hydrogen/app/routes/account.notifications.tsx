import type {Route} from './+types/account.notifications';
import {redirect, Form, useActionData, useNavigation} from 'react-router';
import {requireAuth} from '~/lib/customer-auth';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {useState, useEffect} from 'react';
import {adminApi, setCustomerMetafields, type AdminEnv} from '~/lib/admin-api';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Notifications',
    description: 'Manage your notification preferences on Hy-lee.',
  });
}

// ============================================================================
// GraphQL
// ============================================================================

const CUSTOMER_GID_QUERY = `#graphql
  query CustomerGidForNotifications($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
    }
  }
` as const;

/**
 * Admin API — reads marketing consent state and the notification_preferences
 * metafield. The Storefront API cannot read metafields in the custom namespace
 * without an explicit Storefront API access definition, so both are read here.
 */
const ADMIN_NOTIFICATION_PREFS_QUERY = `
  query AdminNotificationPrefs($customerId: ID!) {
    customer(id: $customerId) {
      emailMarketingConsent {
        marketingState
      }
      notificationPrefs: metafield(namespace: "custom", key: "notification_preferences") {
        value
      }
    }
  }
`;

/**
 * Admin API — update email marketing consent without triggering Shopify's
 * double opt-in confirmation email. Uses the dedicated
 * customerEmailMarketingConsentUpdate mutation (not the generic customerUpdate)
 * with SINGLE_OPT_IN so the state is applied immediately.
 */
const ADMIN_UPDATE_MARKETING_MUTATION = `
  mutation AdminUpdateMarketingConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  orderUpdates: true;
  productRecommendations: boolean;
  promotionalOffers: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  orderUpdates: true,
  productRecommendations: false,
  promotionalOffers: false,
};

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const token = requireAuth(context.session);
  const env = context.env as unknown as AdminEnv;

  const {customer: gidCustomer} = await context.storefront.query(
    CUSTOMER_GID_QUERY,
    {variables: {customerAccessToken: token}},
  );
  const customerId = gidCustomer?.id ?? null;

  if (!customerId) {
    return {customerId: null, acceptsMarketing: false, prefs: DEFAULT_PREFS};
  }

  // Step 2: Read marketing consent + prefs metafield via Admin API so the
  // values are always in sync with what was last written (no propagation lag).
  const adminData = await adminApi<{
    customer: {
      emailMarketingConsent: {marketingState: string} | null;
      notificationPrefs: {value: string} | null;
    } | null;
  }>(env, ADMIN_NOTIFICATION_PREFS_QUERY, {customerId});

  const marketingState =
    adminData.customer?.emailMarketingConsent?.marketingState;
  const acceptsMarketing = marketingState === 'SUBSCRIBED';

  let prefs: NotificationPreferences = DEFAULT_PREFS;
  try {
    const rawValue = adminData.customer?.notificationPrefs?.value;
    if (rawValue) {
      const parsed = JSON.parse(rawValue) as Record<string, unknown>;
      prefs = {
        orderUpdates: true,
        productRecommendations: Boolean(parsed.productRecommendations),
        promotionalOffers: Boolean(parsed.promotionalOffers),
      };
    }
  } catch {
    // Use defaults on parse error
  }

  return {customerId, acceptsMarketing, prefs};
}

// ============================================================================
// Action
// ============================================================================

interface ActionError {
  field: string;
  message: string;
}

export async function action({request, context}: Route.ActionArgs) {
  const token = requireAuth(context.session);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const env = context.env as unknown as AdminEnv;

  const {customer: gidCustomer} = await context.storefront.query(
    CUSTOMER_GID_QUERY,
    {variables: {customerAccessToken: token}},
  );
  const customerId = gidCustomer?.id;

  if (!customerId) {
    return {
      errors: [
        {field: 'general', message: 'account.notifications.errorMessage'},
      ] as ActionError[],
      intent,
    };
  }

  switch (intent) {
    case 'updateMarketing': {
      const acceptsMarketing = formData.get('acceptsMarketing') === 'true';

      try {
        // Use the Admin API with SINGLE_OPT_IN so the state is applied
        // immediately without sending Shopify's double opt-in email.
        const result = await adminApi<{
          customerEmailMarketingConsentUpdate: {
            userErrors: Array<{field: string; message: string}>;
          };
        }>(env, ADMIN_UPDATE_MARKETING_MUTATION, {
          input: {
            customerId,
            emailMarketingConsent: {
              marketingOptInLevel: 'SINGLE_OPT_IN',
              consentUpdatedAt: new Date().toISOString(),
              marketingState: acceptsMarketing ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
            },
          },
        });

        const errors = result?.customerEmailMarketingConsentUpdate?.userErrors;
        if (errors?.length) {
          console.error('[notifications] updateMarketing userErrors:', errors);
          return {
            success: false as const,
            errors: errors as ActionError[],
            intent,
          };
        }

        // Echo back the saved value so the component can use it directly
        // without waiting for the loader to re-validate (which may return
        // stale/cached data and cause toggles to snap back to false).
        return {success: true as const, intent, acceptsMarketing};
      } catch (e) {
        console.error('[notifications] updateMarketing threw:', e);
        return {
          success: false as const,
          errors: [
            {
              field: 'general',
              message: 'account.notifications.emailCard.errorMessage',
            },
          ] as ActionError[],
          intent,
        };
      }
    }

    case 'updatePreferences': {
      const productRecommendations =
        formData.get('productRecommendations') === 'on';
      const promotionalOffers = formData.get('promotionalOffers') === 'on';

      try {
        await setCustomerMetafields(env, customerId, [
          {
            namespace: 'custom',
            key: 'notification_preferences',
            value: JSON.stringify({
              orderUpdates: true,
              productRecommendations,
              promotionalOffers,
            }),
            type: 'json',
          },
        ]);

        // Echo back what was written so the component can reflect it immediately.
        return {
          success: true as const,
          intent,
          prefs: {
            orderUpdates: true as const,
            productRecommendations,
            promotionalOffers,
          },
        };
      } catch (e) {
        console.error('[notifications] updatePreferences threw:', e);
        return {
          success: false as const,
          errors: [
            {
              field: 'general',
              message: 'account.notifications.emailCard.errorMessage',
            },
          ] as ActionError[],
          intent,
        };
      }
    }

    default:
      return {
        success: false as const,
        errors: [{field: 'intent', message: 'Unknown action'}] as ActionError[],
      };
  }
}

// ============================================================================
// Main Component
// ============================================================================

export default function NotificationsPage({loaderData}: Route.ComponentProps) {
  const {t} = useTranslation();
  const {acceptsMarketing, prefs} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // Controlled state for all toggles — seeded from loader data on mount.
  const [marketingChecked, setMarketingChecked] = useState(acceptsMarketing);
  const [productRec, setProductRec] = useState(prefs.productRecommendations);
  const [promoOffers, setPromoOffers] = useState(prefs.promotionalOffers);

  // Extract the values the action echoed back on a successful save.
  // These are what was ACTUALLY written to the Admin API, so they take
  // priority over whatever the revalidated loader returns (which can still
  // be stale if Shopify's read-after-write hasn't propagated yet).
  const savedMarketing =
    actionData?.success && actionData.intent === 'updateMarketing'
      ? (actionData as {acceptsMarketing: boolean}).acceptsMarketing
      : undefined;

  const savedPrefs =
    actionData?.success && actionData.intent === 'updatePreferences'
      ? (actionData as {prefs: NotificationPreferences}).prefs
      : undefined;

  // Sync marketing toggle from loader data, but skip when a successful
  // updateMarketing save just completed — in that case `savedMarketing` is the
  // authoritative value and overwriting it from a potentially-stale loader
  // would make the toggle snap back to false.
  useEffect(() => {
    if (savedMarketing !== undefined) {
      setMarketingChecked(savedMarketing);
      return;
    }
    setMarketingChecked(acceptsMarketing);
  }, [acceptsMarketing, savedMarketing]);

  // Same guard for the metafield-backed prefs.
  useEffect(() => {
    if (savedPrefs !== undefined) {
      setProductRec(savedPrefs.productRecommendations);
      setPromoOffers(savedPrefs.promotionalOffers);
      return;
    }
    setProductRec(prefs.productRecommendations);
    setPromoOffers(prefs.promotionalOffers);
  }, [prefs.productRecommendations, prefs.promotionalOffers, savedPrefs]);

  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent =
    isSubmitting && navigation.formData
      ? (navigation.formData.get('intent') as string)
      : null;

  const prefsSuccess =
    actionData?.intent === 'updatePreferences' && actionData?.success;
  const prefsError =
    actionData?.intent === 'updatePreferences' && actionData?.errors;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-[28px] font-light leading-[42px] text-gray-800">
        {t('account.notifications.pageTitle')}
      </h1>

      {/* Email Notifications Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.notifications.emailCard.title')}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {t('account.notifications.emailCard.description')}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Row 1: Order Updates (locked on) */}
          <ToggleRow
            label={t('account.notifications.emailCard.orderUpdates.label')}
            subtext={t('account.notifications.emailCard.orderUpdates.subtext')}
            checked={true}
            disabled={true}
            badge={t(
              'account.notifications.emailCard.orderUpdates.requiredBadge',
            )}
          />

          {/* Row 2: Marketing Emails — auto-submits on change */}
          <MarketingToggleRow
            checked={marketingChecked}
            label={t('account.notifications.emailCard.marketingEmails.label')}
            subtext={t(
              'account.notifications.emailCard.marketingEmails.subtext',
            )}
            isSubmitting={submittingIntent === 'updateMarketing'}
            onChange={setMarketingChecked}
          />

          {/* Rows 3+4: Metafield prefs — single form with Save button */}
          <Form method="post" className="flex flex-col">
            <input type="hidden" name="intent" value="updatePreferences" />

            <ToggleRow
              name="productRecommendations"
              label={t(
                'account.notifications.emailCard.productRecommendations.label',
              )}
              subtext={t(
                'account.notifications.emailCard.productRecommendations.subtext',
              )}
              checked={productRec}
              onChange={setProductRec}
            />

            <ToggleRow
              name="promotionalOffers"
              label={t(
                'account.notifications.emailCard.promotionalOffers.label',
              )}
              subtext={t(
                'account.notifications.emailCard.promotionalOffers.subtext',
              )}
              checked={promoOffers}
              onChange={setPromoOffers}
            />

            {/* Feedback banners */}
            <div className="px-6 pb-2">
              {prefsSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {t('account.notifications.emailCard.successMessage')}
                </div>
              )}
              {prefsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {t('account.notifications.emailCard.errorMessage')}
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="px-6 pb-6">
              <button
                type="submit"
                disabled={submittingIntent === 'updatePreferences'}
                className="rounded-lg bg-secondary px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingIntent === 'updatePreferences'
                  ? t('account.notifications.emailCard.saving')
                  : t('account.notifications.emailCard.savePreferences')}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ToggleRowProps {
  label: string;
  subtext: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  badge?: string;
}

function ToggleRow({
  label,
  subtext,
  checked,
  onChange,
  disabled = false,
  name,
  badge,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-gray-800">{label}</span>
          {badge && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {badge}
            </span>
          )}
        </div>
        <span className="text-sm text-text-muted">{subtext}</span>
      </div>
      <Toggle
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function MarketingToggleRow({
  checked,
  label,
  subtext,
  isSubmitting,
  onChange,
}: {
  checked: boolean;
  label: string;
  subtext: string;
  isSubmitting: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Form
      method="post"
      className="flex items-center justify-between gap-4 px-6 py-5"
    >
      <input type="hidden" name="intent" value="updateMarketing" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-gray-800">{label}</span>
        <span className="text-sm text-text-muted">{subtext}</span>
      </div>
      <MarketingToggle
        checked={checked}
        disabled={isSubmitting}
        onChange={onChange}
      />
    </Form>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  disabled = false,
}: {
  name?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`relative inline-flex shrink-0 cursor-pointer items-center ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        readOnly={!onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-secondary peer-checked:after:translate-x-5" />
    </label>
  );
}

function MarketingToggle({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`relative inline-flex shrink-0 cursor-pointer items-center ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        name="acceptsMarketing"
        value="true"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.checked);
          const form = e.currentTarget.form;
          if (form) form.requestSubmit();
        }}
        className="peer sr-only"
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-secondary peer-checked:after:translate-x-5" />
    </label>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[42px] w-44 animate-pulse rounded bg-gray-200" />
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-5"
            >
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <div className="h-[46px] w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
