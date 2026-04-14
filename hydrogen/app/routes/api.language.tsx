import {redirect} from 'react-router';
import type {Route} from './+types/api.language';

const SUPPORTED = ['EN', 'ES', 'FR'] as const;

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const language = (formData.get('language') as string)?.toUpperCase();

  if (!SUPPORTED.includes(language as (typeof SUPPORTED)[number])) {
    return new Response('Unsupported language', {status: 400});
  }

  const referer = request.headers.get('Referer') ?? '/';

  return redirect(referer, {
    headers: {
      'Set-Cookie': `language=${language}; Path=/; SameSite=Lax; Max-Age=31536000`,
    },
  });
}
