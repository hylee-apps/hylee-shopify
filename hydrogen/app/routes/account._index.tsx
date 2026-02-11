import type {Route} from './+types/account._index';
import {redirect, Link, Form} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {Breadcrumb, Icon, Card} from '~/components';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Your Account',
    description: 'Manage your Hy-lee account.',
  });
}

// ============================================================================
// GraphQL Query
// ============================================================================

const CUSTOMER_QUERY = `#graphql
  query Customer {
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

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  const {data} = await context.customerAccount.query(CUSTOMER_QUERY);

  return {customer: data.customer};
}

// ============================================================================
// Nav Card Data
// ============================================================================

interface NavCard {
  title: string;
  description: string;
  icon: 'package' | 'user' | 'map-pin' | 'mail' | 'heart' | 'settings';
  to: string;
  disabled?: boolean;
  badge?: string;
}

const navCards: NavCard[] = [
  {
    title: 'Your Orders',
    description: 'Track, return, or buy again',
    icon: 'package',
    to: '/account/orders',
  },
  {
    title: 'Login & Security',
    description: 'Edit name, email, and password',
    icon: 'settings',
    to: '/account/settings',
  },
  {
    title: 'Your Addresses',
    description: 'Manage shipping addresses',
    icon: 'map-pin',
    to: '/account/addresses',
  },
  {
    title: 'Contact Us',
    description: 'Get help with your account',
    icon: 'mail',
    to: '/pages/contact-us',
  },
  {
    title: 'Gift Cards',
    description: 'Coming soon',
    icon: 'heart',
    to: '#',
    disabled: true,
    badge: 'Coming Soon',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function AccountDashboard({loaderData}: Route.ComponentProps) {
  const {customer} = loaderData;

  const firstName = customer?.firstName ?? 'there';
  const memberSince = customer?.creationDate
    ? new Date(customer.creationDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const breadcrumbs = [{label: 'Home', url: '/'}, {label: 'Your Account'}];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Your Account</h1>
        <p className="mt-1 text-text-muted">
          Hello, {firstName}
          {memberSince && <> &middot; Member since {memberSince}</>}
        </p>
      </div>

      {/* Nav Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navCards.map((card) => (
          <AccountNavCard key={card.title} {...card} />
        ))}
      </div>

      {/* Sign Out */}
      <div className="mt-12 border-t border-border pt-8">
        <Form method="post" action="/account/logout">
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-primary"
          >
            <Icon name="log-out" size={16} />
            Sign Out
          </button>
        </Form>
      </div>
    </div>
  );
}

// ============================================================================
// AccountNavCard Component
// ============================================================================

function AccountNavCard({
  title,
  description,
  icon,
  to,
  disabled = false,
  badge,
}: NavCard) {
  const content = (
    <div
      className={`group flex items-start gap-4 rounded-lg border border-border p-5 transition-all ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-primary hover:shadow-sm'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface ${
          !disabled ? 'group-hover:bg-primary/10' : ''
        }`}
      >
        <Icon
          name={icon}
          size={20}
          className={`text-text ${!disabled ? 'group-hover:text-primary' : ''}`}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`text-base font-medium ${!disabled ? 'text-dark group-hover:text-primary' : 'text-text'}`}
          >
            {title}
          </h3>
          {badge && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-muted">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-text-muted">{description}</p>
      </div>
      {!disabled && (
        <Icon
          name="chevron-right"
          size={20}
          className="mt-0.5 shrink-0 text-text-muted group-hover:text-primary"
        />
      )}
    </div>
  );

  if (disabled) return content;

  return <Link to={to}>{content}</Link>;
}
