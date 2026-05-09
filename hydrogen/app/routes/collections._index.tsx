import {redirect} from 'react-router';
import type {Route} from './+types/collections._index';

export async function loader(_: Route.LoaderArgs) {
  throw redirect('/collections/all', {status: 301});
}
