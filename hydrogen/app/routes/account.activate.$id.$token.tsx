import type {Route} from './+types/account.activate.$id.$token';

// Account activation is handled by Shopify's hosted new customer accounts UI.
export async function loader({context}: Route.LoaderArgs) {
  return context.customerAccount.login();
}
