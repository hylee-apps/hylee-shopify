import type {Route} from './+types/account.authorize';

export async function loader({context}: Route.LoaderArgs) {
  return context.customerAccount.authorize();
}
