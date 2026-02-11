import {Link} from 'react-router';
import type {Route} from './+types/policies._index';
import {Breadcrumb} from '~/components/navigation';
import {Icon} from '~/components/display';

// ============================================================================
// GraphQL
// ============================================================================

const POLICIES_QUERY = `#graphql
  query Policies(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        id
        title
        handle
      }
      refundPolicy {
        id
        title
        handle
      }
      shippingPolicy {
        id
        title
        handle
      }
      termsOfService {
        id
        title
        handle
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const {shop} = await storefront.query(POLICIES_QUERY, {
    variables: {
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const policies = [
    shop.privacyPolicy,
    shop.refundPolicy,
    shop.shippingPolicy,
    shop.termsOfService,
    shop.subscriptionPolicy,
  ].filter(Boolean);

  return {policies};
}

// ============================================================================
// Meta
// ============================================================================

export function meta() {
  return [{title: 'Policies | Hy-lee'}];
}

// ============================================================================
// Page Component
// ============================================================================

export default function PoliciesIndex({loaderData}: Route.ComponentProps) {
  const {policies} = loaderData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Breadcrumb
        items={[
          {label: 'Home', url: '/'},
          {label: 'Policies', url: '/policies'},
        ]}
      />

      <h1 className="mt-6 mb-8 text-3xl font-bold text-dark sm:text-4xl">
        Store Policies
      </h1>

      {policies.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {policies.map((policy) => (
            <Link
              key={policy.id}
              to={`/policies/${policy.handle}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon name="info" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-dark group-hover:text-primary">
                  {policy.title}
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  View our {policy.title.toLowerCase()}
                </p>
              </div>
              <Icon
                name="chevron-right"
                size={20}
                className="ml-auto text-text-muted group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-text-muted">No policies available at this time.</p>
      )}
    </div>
  );
}
