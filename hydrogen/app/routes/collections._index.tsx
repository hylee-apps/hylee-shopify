import type {Route} from './+types/collections._index';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Breadcrumb} from '~/components/navigation';

interface CollectionItem {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
}

// ============================================================================
// GraphQL Query
// ============================================================================

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $first: Int!
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, after: $endCursor) {
      nodes {
        id
        title
        handle
        description
        image {
          id
          url
          altText
          width
          height
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      first: 50,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return {collections: collections.nodes as CollectionItem[]};
}

// ============================================================================
// SEO Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Collections',
    description: 'Browse all product collections at Hy-lee.',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function CollectionsIndexPage({
  loaderData,
}: Route.ComponentProps) {
  const {collections} = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{label: 'Home', url: '/'}, {label: 'Collections'}]}
        className="py-4"
      />

      <h1 className="mb-8 text-2xl font-bold text-slate-900 md:text-3xl">
        Collections
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
          >
            {collection.image ? (
              <div className="aspect-[16/9] overflow-hidden">
                <Image
                  data={collection.image}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                <span className="text-4xl text-slate-300">
                  {collection.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                {collection.title}
              </h2>
              {collection.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {collection.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-500">No collections available.</p>
        </div>
      )}
    </div>
  );
}
