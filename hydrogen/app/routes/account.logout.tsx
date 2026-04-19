import type {Route} from './+types/account.logout';
import {redirect} from 'react-router';

export async function action({context}: Route.ActionArgs) {
  return context.customerAccount.logout();
}

export async function loader() {
  return redirect('/account');
}
