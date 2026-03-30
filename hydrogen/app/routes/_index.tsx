import {Link, Form, useLoaderData} from 'react-router';
import {PillInput} from '~/components/ui/pill-input';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';
import {
  ProductCard,
  type ProductCardProps,
} from '~/components/commerce/ProductCard';
import {HeroCarousel, type CarouselSlide} from '~/components/home/HeroCarousel';
import type {Route} from './+types/_index';

// ============================================================================
// Carousel slides — update here or wire to Shopify metaobjects in future
// ============================================================================

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    backgroundImage: '/hero-bg.jpg',
    bgColor: '#14b8a6',
  },
  {
    id: 'slide-2',
    backgroundImage: '',
    bgColor: '#2699a6',
  },
  {
    id: 'slide-3',
    backgroundImage: '',
    bgColor: '#2ac864',
  },
];

// ============================================================================
// Meta
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return [
    {title: 'Hy-lee | Home'},
    {
      name: 'description',
      content:
        'Discover unique products from trusted vendors worldwide. Shop electronics, fashion, home goods, and more.',
    },
  ];
}

// ============================================================================
// GraphQL
// ============================================================================

const WHATS_NEW_QUERY = `#graphql
  query WhatsNewProducts(
    $first: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      query: $query
      sortKey: CREATED_AT
      reverse: true
    ) {
      nodes {
        id
        title
        handle
        vendor
        availableForSale
        tags
        createdAt
        images(first: 2) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;

const DISCOUNTED_PRODUCTS_QUERY = `#graphql
  query DiscountedProducts(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      query: "compare_at_price:>0"
      sortKey: BEST_SELLING
    ) {
      nodes {
        id
        title
        handle
        vendor
        availableForSale
        tags
        createdAt
        images(first: 2) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;

const SEASONAL_COLLECTION_QUERY = `#graphql
  query SeasonalCollection(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        nodes {
          id
          title
          handle
          vendor
          availableForSale
          tags
          createdAt
          images(first: 2) {
            nodes {
              id
              url
              altText
              width
              height
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const baseVars = {
    first: 8,
    country: storefront.i18n.country,
    language: storefront.i18n.language,
  };

  // Calculate the 30-day cutoff date for "What's New"
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Fetch all homepage data in parallel
  const [whatsNewResult, seasonalResult, discountedResult] = await Promise.all([
    storefront
      .query(WHATS_NEW_QUERY, {
        variables: {
          ...baseVars,
          first: 20,
          query: `created_at:>${thirtyDaysAgo}`,
        },
      })
      .catch(() => null),
    storefront
      .query(SEASONAL_COLLECTION_QUERY, {
        variables: {...baseVars, handle: 'summer-collection'},
      })
      .catch(() => null),
    storefront
      .query(DISCOUNTED_PRODUCTS_QUERY, {
        variables: baseVars,
      })
      .catch(() => null),
  ]);

  return {
    whatsNew: whatsNewResult?.products?.nodes ?? [],
    seasonal: seasonalResult?.collection ?? null,
    discounted: discountedResult?.products?.nodes ?? [],
  };
}

// ============================================================================
// Product Section
// Compact header row (title left + "See all" right) above card row.
// ============================================================================

type CollectionProduct = ProductCardProps['product'] & {createdAt?: string};

function ProductSection({
  categoryLabel,
  seeAllUrl,
  collectionHandle,
  products,
}: {
  categoryLabel: string;
  seeAllUrl: string;
  collectionHandle: string;
  products: CollectionProduct[];
}) {
  if (!products.length) return null;

  return (
    <div className="flex flex-col pb-4 w-full overflow-x-auto">
      <div className="mx-auto w-full max-w-300 px-4">
        <div className="flex items-center justify-between py-3">
          <h2 className="text-[20px] font-bold text-black leading-tight">
            {categoryLabel}
          </h2>
          <Link
            to={seeAllUrl}
            className="text-[14px] font-medium text-secondary hover:underline shrink-0 pl-6"
          >
            See all
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto items-stretch">
          {products.slice(0, 5).map((product) => {
            const isNew =
              product.createdAt &&
              Date.now() - new Date(product.createdAt).getTime() <
                30 * 24 * 60 * 60 * 1000;
            return (
              <ProductCard
                key={product.id}
                product={product}
                size="default"
                showQuickAdd
                collectionHandle={collectionHandle}
                customBadge={isNew ? 'New' : undefined}
                customBadgeColor={isNew ? 'bg-primary' : undefined}
                className="flex-1 min-w-40"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// Full homepage layout per Figma node 201:155 (1440×2554px)
// ============================================================================

export default function Homepage() {
  const {whatsNew, seasonal, discounted} = useLoaderData<typeof loader>();

  return (
    <>
      {/* ================================================================ */}
      {/* HERO CAROUSEL — Figma node 203:267                              */}
      {/* Carousel IS the hero: cycling bg + logo + search always shown   */}
      {/* ================================================================ */}
      <HeroCarousel
        slides={CAROUSEL_SLIDES}
        header={
          <img
            src="/logo-white.png"
            alt="Hylee"
            className="h-[101.821px] w-[183px] object-cover shrink-0"
            loading="eager"
          />
        }
        footer={
          <Form action="/search" method="get" className="w-full max-w-[683px]">
            <PillInput
              type="search"
              name="q"
              placeholder="Search Our Products"
              autoComplete="off"
            />
          </Form>
        }
      />

      {/* ================================================================ */}
      {/* PRODUCTS CONTAINER — Figma node 218:476 (1440×1778px)           */}
      {/* ================================================================ */}
      <div className="flex flex-col items-start w-full gap-10">
        {/* What's New — products created in the last 30 days */}
        {whatsNew.length > 0 && (
          <ProductSection
            categoryLabel="What's New"
            seeAllUrl="/collections/all?sort_by=created-descending"
            collectionHandle="all"
            products={whatsNew as CollectionProduct[]}
          />
        )}

        {/* Seasonal Collection — Figma node 218:384 */}
        {seasonal && seasonal.products.nodes.length > 0 && (
          <ProductSection
            categoryLabel={seasonal.title}
            seeAllUrl={`/collections/${seasonal.handle}`}
            collectionHandle={seasonal.handle}
            products={seasonal.products.nodes as CollectionProduct[]}
          />
        )}

        {/* Discounted Products */}
        {discounted.length > 0 && (
          <ProductSection
            categoryLabel="Discounted"
            seeAllUrl="/collections/discounted"
            collectionHandle="discounted"
            products={discounted as CollectionProduct[]}
          />
        )}

        {/* ============================================================== */}
        {/* PROMOTIONS & DEALS — Figma node 218:430                        */}
        {/* Section header h-25 xl:px-[122px], card frame 861×314px        */}
        {/* ============================================================== */}
        <Separator className="w-full" />
        <div className="flex flex-col pb-8 w-full">
          <div className="mx-auto w-full max-w-300 px-4">
            {/* Section header */}
            <div className="flex items-center py-3">
              <h2 className="text-[20px] font-bold text-black leading-tight">
                Promotions &amp; Deals
              </h2>
            </div>

            {/* Masonry grid: featured (left half) + 4 badges (right 2×2) */}
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[340px]">
              {/* Featured promo — spans 2 cols, full height */}
              <div className="col-span-2 row-span-2 bg-secondary rounded-xl p-8 flex flex-col justify-between text-white">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">
                    Limited Time
                  </p>
                  <p className="text-[72px] font-black leading-none mt-2">
                    20%
                  </p>
                  <p className="text-[32px] font-bold leading-none -mt-2">
                    OFF
                  </p>
                  <p className="text-[15px] mt-4 opacity-90 max-w-[200px] leading-snug">
                    Select Home Appliances — through March 1st
                  </p>
                </div>
                <Button className="bg-white text-secondary hover:bg-white/90 rounded-[100px] w-fit px-6 h-10 text-[14px] font-semibold">
                  Shop the Sale
                </Button>
              </div>

              {/* Badge: New Arrivals */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-70">
                    New Arrivals
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Up to 30% off
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Fashion &amp; Accessories
                  </p>
                </div>
                <Link
                  to="/collections/new"
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  Shop now →
                </Link>
              </div>

              {/* Badge: Flash Sale */}
              <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent opacity-70">
                    Flash Sale
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    $15 off $75+
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Code: FLASH15
                  </p>
                </div>
                <Link
                  to="/collections/sale"
                  className="text-[12px] font-semibold text-brand-accent hover:underline"
                >
                  Claim offer →
                </Link>
              </div>

              {/* Badge: Bundle Deal */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-70">
                    Bundle Deal
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Buy 2, Get 1
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Free on select items
                  </p>
                </div>
                <Link
                  to="/collections/bundles"
                  className="text-[12px] font-semibold text-secondary hover:underline"
                >
                  Shop now →
                </Link>
              </div>

              {/* Badge: Members Only */}
              <div className="bg-dark/10 border border-dark/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-dark opacity-70">
                    Members Only
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Extra 10% off
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Sign in to unlock
                  </p>
                </div>
                <Link
                  to="/account"
                  className="text-[12px] font-semibold text-dark hover:underline"
                >
                  Sign in →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
