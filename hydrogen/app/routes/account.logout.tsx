import type {Route} from './+types/account.logout';

// ============================================================================
// Action — Logout via POST
// ============================================================================

export async function action({context}: Route.ActionArgs) {
  return context.customerAccount.logout();
}

// ============================================================================
// Loader — redirect GET requests to account
// ============================================================================

export async function loader() {
  return new Response(null, {
    status: 302,
    headers: {Location: '/account'},
  });
}
