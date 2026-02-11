import type {Route} from './+types/policies.$handle';
import {Breadcrumb} from '~/components/navigation';

// ============================================================================
// GraphQL
// ============================================================================

const POLICY_QUERY = `#graphql
  query Policy(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        id
        title
        handle
        body
      }
      refundPolicy {
        id
        title
        handle
        body
      }
      shippingPolicy {
        id
        title
        handle
        body
      }
      termsOfService {
        id
        title
        handle
        body
      }
      subscriptionPolicy {
        id
        title
        handle
        body
      }
    }
  }
` as const;

// ============================================================================
// Types
// ============================================================================

interface ShopPolicy {
  id: string;
  title: string;
  handle: string;
  body: string;
}

const POLICY_MAP: Record<string, string> = {
  'privacy-policy': 'privacyPolicy',
  'refund-policy': 'refundPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'subscription-policy': 'subscriptionPolicy',
};

// ============================================================================
// Loader
// ============================================================================

export async function loader({params, context}: Route.LoaderArgs) {
  const {storefront} = context;

  if (!params.handle || !POLICY_MAP[params.handle]) {
    throw new Response('Policy not found', {status: 404});
  }

  const {shop} = await storefront.query(POLICY_QUERY, {
    variables: {
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const policyKey = POLICY_MAP[params.handle] as keyof typeof shop;
  const policy = shop?.[policyKey] as ShopPolicy | null;

  if (!policy) {
    throw new Response('Policy not found', {status: 404});
  }

  return {policy};
}

// ============================================================================
// Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const policy = data?.policy;
  return [{title: policy?.title ? `${policy.title} | Hy-lee` : 'Policy'}];
}

// ============================================================================
// Page Component
// ============================================================================

export default function PolicyRoute({loaderData}: Route.ComponentProps) {
  const {policy} = loaderData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Breadcrumb
        items={[
          {label: 'Home', url: '/'},
          {label: 'Policies', url: '/policies'},
          {label: policy.title, url: `/policies/${policy.handle}`},
        ]}
      />

      <article className="mt-6">
        <h1 className="mb-6 text-3xl font-bold text-dark sm:text-4xl">
          {policy.title}
        </h1>

        <div
          className="prose prose-lg max-w-none text-text [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-dark [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-dark [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
      </article>
    </div>
  );
}
