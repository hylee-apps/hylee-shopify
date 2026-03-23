import type {Route} from './+types/account.settings';
import {redirect, Form, useActionData, useNavigation, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
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
import {LogOut, User, Clock, Settings, type LucideProps} from 'lucide-react';
import type {ForwardRefExoticComponent, RefAttributes} from 'react';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Login & Security',
    description: 'Manage your account settings and security.',
  });
}

// ============================================================================
// GraphQL Query
// ============================================================================

const CUSTOMER_SETTINGS_QUERY = `#graphql
  query CustomerSettings {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      creationDate
      defaultAddress {
        formatted
      }
    }
  }
` as const;

const UPDATE_CUSTOMER_MUTATION = `#graphql
  mutation UpdateCustomer($customer: CustomerUpdateInput!) {
    customerUpdate(input: $customer) {
      customer {
        firstName
        lastName
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
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const {data} = await context.customerAccount.query(CUSTOMER_SETTINGS_QUERY);

  return {customer: data.customer};
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
    case 'updateName': {
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const {data} = await context.customerAccount.mutate(
        UPDATE_CUSTOMER_MUTATION,
        {variables: {customer: {firstName, lastName}}},
      );
      const errors = data?.customerUpdate?.userErrors;
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
// Helpers
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// Main Component
// ============================================================================

export default function SettingsPage({loaderData}: Route.ComponentProps) {
  const {customer} = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
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
            <BreadcrumbPage>Login &amp; Security</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-8 text-3xl font-bold text-dark">Login & Security</h1>

      {/* Success Message */}
      {actionData?.success && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Settings updated successfully.
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <SettingCard
          title="Personal Information"
          icon="user"
          description="Your name and contact details"
        >
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="updateName" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-text"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  defaultValue={customer?.firstName ?? ''}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-text"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  defaultValue={customer?.lastName ?? ''}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Email
              </label>
              <p className="text-sm text-dark">
                {customer?.emailAddress?.emailAddress ?? '—'}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                Contact support to change your email address
              </p>
            </div>
            {customer?.phoneNumber?.phoneNumber && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text">
                  Phone
                </label>
                <p className="text-sm text-dark">
                  {customer.phoneNumber.phoneNumber}
                </p>
              </div>
            )}
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </SettingCard>

        {/* Account Activity */}
        <SettingCard
          title="Account Activity"
          icon="clock"
          description="Your account statistics"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-md bg-surface p-4">
              <p className="text-2xl font-bold text-dark">
                {customer?.creationDate
                  ? formatDate(customer.creationDate)
                  : '—'}
              </p>
              <p className="text-xs text-text-muted">Member Since</p>
            </div>
            <div className="rounded-md bg-surface p-4">
              <p className="text-2xl font-bold text-dark">—</p>
              <p className="text-xs text-text-muted">Total Orders</p>
            </div>
            <div className="rounded-md bg-surface p-4">
              <p className="text-2xl font-bold text-dark">
                {customer?.defaultAddress ? '1' : '0'}
              </p>
              <p className="text-xs text-text-muted">Addresses</p>
            </div>
          </div>
        </SettingCard>

        {/* Sign Out */}
        <SettingCard
          title="Sign Out"
          icon="log-out"
          description="Sign out of your account on this device"
        >
          <Form method="post" action="/account/logout">
            <Button type="submit" variant="outline" size="sm">
              <LogOut size={14} className="mr-1" />
              Sign Out
            </Button>
          </Form>
        </SettingCard>
      </div>
    </div>
  );
}

// ============================================================================
// SettingCard Component
// ============================================================================

type SettingIcon = 'user' | 'clock' | 'log-out' | 'settings';

const SETTING_ICONS: Record<
  SettingIcon,
  ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
> = {
  user: User,
  clock: Clock,
  'log-out': LogOut,
  settings: Settings,
};

function SettingCard({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: SettingIcon;
  description: string;
  children: React.ReactNode;
}) {
  const IconComp = SETTING_ICONS[icon];
  return (
    <div className="rounded-lg border border-border p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface">
          <IconComp size={18} className="text-text" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-dark">{title}</h2>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
