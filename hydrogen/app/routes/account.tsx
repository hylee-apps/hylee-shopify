import {Outlet, useLocation} from 'react-router';
import type {Route} from './+types/account';
import {
  isCustomerLoggedIn,
  getAuthenticatedCustomer,
} from '~/lib/customer-auth';
import {AccountSidebar} from '~/components/account/AccountSidebar';

/**
 * Routes that should NOT render the sidebar layout.
 */
const NO_SIDEBAR_ROUTES = [
  '/account/login',
  '/account/register',
  '/account/recover',
  '/account/reset',
  '/account/activate',
  '/account/authorize',
];

/**
 * Route patterns that should NOT render the sidebar layout (regex).
 */
const NO_SIDEBAR_PATTERNS = [/^\/account\/orders\/[^/]+\/return/];

export async function loader({context}: Route.LoaderArgs) {
  const loggedIn = isCustomerLoggedIn(context.session);

  if (!loggedIn) {
    return {customer: null};
  }

  try {
    const customer = await getAuthenticatedCustomer(
      context.storefront,
      context.session,
    );
    return {customer};
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

  // Auth pages, return flow, etc. render without sidebar
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
