import type {Route} from './+types/blogs.$handle';
import {ComingSoonPage} from '~/components/display/ComingSoonPage';

// ============================================================================
// Meta
// ============================================================================

export function meta({params}: Route.MetaArgs) {
  const title = params.handle
    ? params.handle
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Blog';
  return [{title: `${title} | Hy-lee`}];
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
