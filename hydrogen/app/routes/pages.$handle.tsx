import type {Route} from './+types/pages.$handle';
import {ComingSoonPage} from '~/components/display/ComingSoonPage';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';

// ============================================================================
// GraphQL
// ============================================================================

const PAGE_QUERY = `#graphql
  query Page(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
      handle
      seo {
        title
        description
      }
      createdAt
      updatedAt
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {storefront} = context;

  if (!params.handle) {
    throw new Response('Page not found', {status: 404});
  }

  const {page} = await storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.handle,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!page) {
    return {
      page: null,
      comingSoon: true as const,
      handle: params.handle,
      canonicalUrl: null,
    };
  }

  const url = new URL(request.url);
  const canonicalUrl = `${url.origin}/pages/${params.handle}`;

  return {
    page,
    comingSoon: false as const,
    handle: params.handle,
    canonicalUrl,
  };
}

// ============================================================================
// Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const page = data?.page;
  if (!page) {
    const title = data?.handle
      ? data.handle
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Coming Soon';
    return [{title: `${title} | Hy-lee`}];
  }
  const canonical = data?.canonicalUrl
    ? [{tagName: 'link', rel: 'canonical', href: data.canonicalUrl}]
    : [];
  return [
    {title: page.seo?.title ?? page.title ?? 'Page'},
    {
      name: 'description',
      content: page.seo?.description ?? page.bodySummary ?? '',
    },
    ...canonical,
  ];
}

// ============================================================================
// Page Component
// ============================================================================

export default function PageRoute({loaderData}: Route.ComponentProps) {
  const {page, comingSoon, handle} = loaderData;

  if (comingSoon || !page) {
    return <ComingSoonPage handle={handle} />;
  }

  return (
    <>
      <PageBreadcrumbs current={page.title} />
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <article className="mt-6">
          <h1 className="sr-only">{page.title}</h1>

          <div
            className="prose prose-lg max-w-none text-text [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-dark [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-dark [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:rounded-lg [&_img]:shadow-md"
            dangerouslySetInnerHTML={{__html: page.body}}
          />
        </article>
      </div>
    </>
  );
}
