import type {Route} from './+types/account.reset.$id.$token';

// Password reset is handled by Shopify's hosted new customer accounts UI.
export async function loader({context}: Route.LoaderArgs) {
  return context.customerAccount.login();
}
