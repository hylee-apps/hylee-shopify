import {Outlet, useLocation} from 'react-router';
import type {Route} from './+types/account';
import {AccountSidebar} from '~/components/account/AccountSidebar';

const NO_SIDEBAR_ROUTES = [
  '/account/login',
  '/account/register',
  '/account/recover',
  '/account/reset',
  '/account/activate',
  '/account/authorize',
];

const NO_SIDEBAR_PATTERNS = [/^\/account\/orders\/[^/]+\/return/];

const CUSTOMER_QUERY = `#graphql
  query AccountLayoutCustomer {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return {customer: null};
  }

  try {
    const {data} = await context.customerAccount.query(CUSTOMER_QUERY);
    const c = data.customer;
    return {
      customer: {
        firstName: c.firstName ?? null,
        lastName: c.lastName ?? null,
        email: c.emailAddress?.emailAddress ?? null,
      },
    };
  } catch {
    return {customer: null};
  }
}

export default function AccountLayout({loaderData}: Route.ComponentProps) {
  const {customer} = loaderData;
  const location = useLocation();

  const isNoSidebarRoute =
    NO_SIDEBAR_ROUTES.some((route) => location.pathname.startsWith(route)) ||
    NO_SIDEBAR_PATTERNS.some((pattern) => pattern.test(location.pathname));

  if (!customer || isNoSidebarRoute) {
    return <Outlet />;
  }

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:px-6 lg:py-8">
      <AccountSidebar
        firstName={customer.firstName}
        lastName={customer.lastName}
        email={customer.email}
      />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
