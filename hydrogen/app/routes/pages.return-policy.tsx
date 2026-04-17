import {redirect} from 'react-router';

export function loader() {
  throw redirect('/policies/return-policy', 301);
}

export default function () {
  return null;
}
