import type {LoaderFunctionArgs} from 'react-router';
import type {Route} from './+types/blogs.$handle';
import {ComingSoonPage} from '~/components/display/ComingSoonPage';

// ============================================================================
// Loader
// ============================================================================

export async function loader({params, request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const canonicalUrl = params.handle
    ? `${url.origin}/blogs/${params.handle}`
    : null;
  return {handle: params.handle, canonicalUrl};
}

// ============================================================================
// Meta
// ============================================================================

export function meta({data, params}: Route.MetaArgs) {
  const handle = data?.handle ?? params.handle;
  const title = handle
    ? handle
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Blog';
  const canonical = data?.canonicalUrl
    ? [{tagName: 'link', rel: 'canonical', href: data.canonicalUrl}]
    : [];
  return [{title: `${title} | Hy-lee`}, ...canonical];
}

// ============================================================================
// Page Component
//
// Blog & Media content is not yet available. Show a branded coming-soon page
// rather than a bare 404. Once blog posts are ready in Shopify, this route
// can be wired to the Storefront API blogs/articles query.
// ============================================================================

export default function BlogRoute({params}: Route.ComponentProps) {
  return <ComingSoonPage handle={params.handle} />;
}
