import type {Route} from './+types/account.logout';
import {redirect} from 'react-router';
import {clearCustomerAccessToken} from '~/lib/customer-auth';

export async function action({context}: Route.ActionArgs) {
  clearCustomerAccessToken(context.session);
  return redirect('/', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export async function loader() {
  return redirect('/account');
}
