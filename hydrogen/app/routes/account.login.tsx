import type {Route} from './+types/account.login';
import {redirect} from 'react-router';

export async function loader({context}: Route.LoaderArgs) {
  if (await context.customerAccount.isLoggedIn()) {
    return redirect('/account');
  }
  return context.customerAccount.login();
}
