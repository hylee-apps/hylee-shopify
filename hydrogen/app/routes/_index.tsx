import {Link, Form, useLoaderData} from 'react-router';
import {PillInput} from '~/components/ui/pill-input';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';
import {
  ProductCard,
  type ProductCardProps,
} from '~/components/commerce/ProductCard';
import type {Route} from './+types/_index';

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
// GraphQL — fetch products from a collection by handle
// ============================================================================

const HOMEPAGE_COLLECTION_QUERY = `#graphql
  query HomepageCollection(
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

  const queryOpts = {
    variables: {
      first: 8,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  };

  // Fetch both collections in parallel — gracefully handle missing collections
  const [whatsNewResult, seasonalResult] = await Promise.all([
    storefront
      .query(HOMEPAGE_COLLECTION_QUERY, {
        variables: {...queryOpts.variables, handle: 'what-s-new'},
      })
      .catch(() => null),
    storefront
      .query(HOMEPAGE_COLLECTION_QUERY, {
        variables: {...queryOpts.variables, handle: 'summer-collection'},
      })
      .catch(() => null),
  ]);

  return {
    whatsNew: whatsNewResult?.collection ?? null,
    seasonal: seasonalResult?.collection ?? null,
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

        <div className="flex gap-2.5 overflow-x-auto">
          {products.slice(0, 4).map((product) => {
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
  const {whatsNew, seasonal} = useLoaderData<typeof loader>();

  return (
    <>
      {/* ================================================================ */}
      {/* HERO — Figma node 203:267                                        */}
      {/* bg-hero (#14b8a6), h-[422px], shadow, centered logo + search    */}
      {/* ================================================================ */}
      <section
        className="relative flex flex-col h-[522px] items-center justify-center px-4 sm:px-[157px] py-[59px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full shrink-0 mb-8 bg-cover bg-center bg-hero"
        style={{backgroundImage: "url('/hero-bg.jpg')"}}
      >
        {/* Teal scrim over the photo */}
        <div
          className="absolute inset-0 bg-hero/10 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col gap-[17px] items-center justify-center overflow-clip px-4 sm:px-[221px] py-[17px] w-full">
          {/* White full Hylee logo — Figma: Logo=Alternate, 183×101.821px */}
          <img
            src="/logo-white.png"
            alt="Hylee"
            className="h-[101.821px] w-[183px] object-cover shrink-0"
            loading="eager"
          />
          {/* Search form — Figma: white bg, border-secondary, rounded-[25px], h-10, max-w-[683px] */}
          <Form action="/search" method="get" className="w-full max-w-[683px]">
            <PillInput
              type="search"
              name="q"
              placeholder="Search Our Products"
              autoComplete="off"
            />
          </Form>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PRODUCTS CONTAINER — Figma node 218:476 (1440×1778px)           */}
      {/* ================================================================ */}
      <div className="flex flex-col items-start w-full gap-10">
        {/* What's New — Figma node 218:337 */}
        {whatsNew && whatsNew.products.nodes.length > 0 && (
          <ProductSection
            categoryLabel="What's New"
            seeAllUrl="/collections/what-s-new"
            collectionHandle="what-s-new"
            products={whatsNew.products.nodes as CollectionProduct[]}
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

        {/* ============================================================== */}
        {/* PROMOTIONS & DISCOUNTS — Figma node 218:430                    */}
        {/* Section header h-25 xl:px-[122px], card frame 861×314px        */}
        {/* ============================================================== */}
        <Separator className="w-full" />
        <div className="flex flex-col pb-8 w-full">
          <div className="mx-auto w-full max-w-300 px-4">
            {/* Section header */}
            <div className="flex items-center py-3">
              <h2 className="text-[20px] font-bold text-black leading-tight">
                Promotions &amp; Discounts
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
