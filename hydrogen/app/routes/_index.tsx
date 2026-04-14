import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, Form, useLoaderData} from 'react-router';
import {PillInput} from '~/components/ui/pill-input';
import {
  ProductCard,
  type ProductCardProps,
} from '~/components/commerce/ProductCard';
import {HeroCarousel, type CarouselSlide} from '~/components/home/HeroCarousel';
import type {Route} from './+types/_index';
import {adminApi, type AdminEnv} from '~/lib/admin-api';

// ============================================================================
// Hero slides — Shopify metaobjects (type: "hero_slide")
// Fields: video_url, background_image, bg_color, sort_order, active
// ============================================================================

const HERO_SLIDES_QUERY = `#graphql
  query HeroSlides {
    metaobjects(type: "hero_slide", first: 20) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
` as const;

function buildHeroSlides(data: any): CarouselSlide[] {
  const nodes: any[] = data?.metaobjects?.nodes ?? [];

  return nodes
    .map((node) => {
      const byKey = Object.fromEntries(node.fields.map((f: any) => [f.key, f]));

      // Skip inactive slides
      if (byKey.active?.value === 'false') return null;

      return {
        id: node.id as string,
        videoUrl: (byKey.video_url?.value as string) || undefined,
        backgroundImage:
          (byKey.background_image?.reference?.image?.url as string) ||
          undefined,
        bgColor: (byKey.bg_color?.value as string) || undefined,
        _sort: byKey.sort_order?.value
          ? parseInt(byKey.sort_order.value, 10)
          : 999,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a._sort - b._sort)
    .map(({_sort: _s, ...slide}: any) => slide as CarouselSlide);
}

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

// Admin API query — fetches active automatic + code discounts from Shopify admin.
// Uses the existing adminApi client (client_credentials grant via ADMIN_APP_CLIENT_ID/SECRET).
const DISCOUNTS_ADMIN_QUERY = `
  query HomepageDiscounts {
    automaticDiscountNodes(first: 20) {
      nodes {
        id
        automaticDiscount {
          __typename
          ... on DiscountAutomaticBasic {
            title
            status
            customerGets {
              value {
                __typename
                ... on DiscountPercentage { percentage }
                ... on DiscountAmount {
                  amount { amount currencyCode }
                }
              }
              items {
                __typename
                ... on DiscountCollections {
                  collections(first: 1) { nodes { title handle } }
                }
              }
            }
          }
          ... on DiscountAutomaticBxgy {
            title
            status
            customerBuys { value { __typename ... on DiscountQuantity { quantity } } }
            customerGets { value { __typename ... on DiscountQuantity { quantity } } }
          }
        }
      }
    }
    codeDiscountNodes(first: 20) {
      nodes {
        id
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            title
            status
            codes(first: 1) { nodes { code } }
            customerGets {
              value {
                __typename
                ... on DiscountPercentage { percentage }
                ... on DiscountAmount {
                  amount { amount currencyCode }
                }
              }
              items {
                __typename
                ... on DiscountCollections {
                  collections(first: 1) { nodes { title handle } }
                }
              }
            }
          }
          ... on DiscountCodeBxgy {
            title
            status
            codes(first: 1) { nodes { code } }
          }
          ... on DiscountCodeFreeShipping {
            title
            status
            codes(first: 1) { nodes { code } }
          }
        }
      }
    }
  }
`;

// Cycles through available colors for visual variety
const PROMO_COLOR_CYCLE = [
  'secondary',
  'primary',
  'brand-accent',
  'dark',
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPromoSlidesFromDiscounts(data: any): PromoSlide[] {
  const slides: PromoSlide[] = [];
  let colorIdx = 0;
  const nextColor = () =>
    PROMO_COLOR_CYCLE[colorIdx++ % PROMO_COLOR_CYCLE.length];

  function parseValue(v: any): {heading: string; subheading: string} | null {
    if (v?.__typename === 'DiscountPercentage') {
      return {heading: `${Math.round(v.percentage * 100)}%`, subheading: 'OFF'};
    }
    if (v?.__typename === 'DiscountAmount') {
      const n = parseFloat(v.amount.amount);
      return {
        heading: `$${Number.isInteger(n) ? n : n.toFixed(2)}`,
        subheading: 'OFF',
      };
    }
    return null;
  }

  function collectionUrl(items: any): string {
    const col = items?.collections?.nodes?.[0];
    return col ? `/collections/${col.handle}` : '/collections/discounts';
  }

  function collectionLabel(items: any): string {
    const col = items?.collections?.nodes?.[0];
    return col ? col.title : '';
  }

  for (const node of data?.automaticDiscountNodes?.nodes ?? []) {
    const d = node.automaticDiscount;
    if (!d || d.status !== 'ACTIVE') continue;

    if (d.__typename === 'DiscountAutomaticBasic') {
      const hs = parseValue(d.customerGets?.value);
      if (!hs) continue;
      const label = collectionLabel(d.customerGets?.items);
      slides.push({
        id: node.id,
        badge: 'Limited Time',
        heading: hs.heading,
        subheading: hs.subheading,
        description: label ? `${d.title} — ${label}` : d.title,
        ctaLabel: 'Shop the Sale',
        ctaUrl: collectionUrl(d.customerGets?.items),
        color: nextColor(),
      });
    } else if (d.__typename === 'DiscountAutomaticBxgy') {
      const buy = d.customerBuys?.value?.quantity ?? 2;
      const get = d.customerGets?.value?.quantity ?? 1;
      slides.push({
        id: node.id,
        badge: 'Bundle Deal',
        heading: `Buy ${buy}`,
        subheading: `Get ${get} Free`,
        description: d.title,
        ctaLabel: 'Shop now',
        ctaUrl: '/collections/discounts',
        color: nextColor(),
      });
    }
  }

  for (const node of data?.codeDiscountNodes?.nodes ?? []) {
    const d = node.codeDiscount;
    if (!d || d.status !== 'ACTIVE') continue;

    const code: string = d.codes?.nodes?.[0]?.code ?? '';

    if (d.__typename === 'DiscountCodeBasic') {
      const hs = parseValue(d.customerGets?.value);
      if (!hs) continue;
      const label = collectionLabel(d.customerGets?.items);
      slides.push({
        id: node.id,
        badge: code || 'Discount',
        heading: hs.heading,
        subheading: hs.subheading,
        description: label ? `${d.title} — ${label}` : d.title,
        ctaLabel: 'Claim offer',
        ctaUrl: collectionUrl(d.customerGets?.items),
        color: nextColor(),
      });
    } else if (d.__typename === 'DiscountCodeFreeShipping') {
      slides.push({
        id: node.id,
        badge: code || 'Free Shipping',
        heading: 'FREE',
        subheading: 'SHIPPING',
        description: d.title,
        ctaLabel: 'Shop now',
        ctaUrl: '/collections/discounts',
        color: nextColor(),
      });
    } else if (d.__typename === 'DiscountCodeBxgy') {
      slides.push({
        id: node.id,
        badge: code || 'Bundle Deal',
        heading: 'Buy 2',
        subheading: 'Get 1 Free',
        description: d.title,
        ctaLabel: 'Shop now',
        ctaUrl: '/collections/discounts',
        color: nextColor(),
      });
    }
  }

  return slides;
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const baseVars = {
    first: 20,
    country: storefront.i18n.country,
    language: storefront.i18n.language,
  };

  // Calculate the 30-day cutoff date for "What's New"
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Fetch all homepage data in parallel
  const [
    whatsNewResult,
    seasonalResult,
    discountedResult,
    discountsData,
    heroSlidesData,
  ] = await Promise.all([
    storefront
      .query(WHATS_NEW_QUERY, {
        variables: {
          ...baseVars,
          query: `created_at:>${thirtyDaysAgo}`,
        },
      })
      .catch(() => null),
    storefront
      .query(SEASONAL_COLLECTION_QUERY, {
        variables: {...baseVars, handle: 'seasonal'},
      })
      .catch(() => null),
    storefront
      .query(DISCOUNTED_PRODUCTS_QUERY, {
        variables: baseVars,
      })
      .catch(() => null),
    adminApi(context.env as unknown as AdminEnv, DISCOUNTS_ADMIN_QUERY).catch(
      () => null,
    ),
    storefront
      .query(HERO_SLIDES_QUERY, {
        cache: storefront.CacheShort(),
      })
      .catch(() => null),
  ]);

  const promotions = buildPromoSlidesFromDiscounts(discountsData);
  const heroSlides = buildHeroSlides(heroSlidesData);

  return {
    whatsNew: whatsNewResult?.products?.nodes ?? [],
    seasonal: seasonalResult?.collection ?? null,
    discounted: discountedResult?.products?.nodes ?? [],
    promotions,
    heroSlides,
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
  const {t} = useTranslation();
  if (!products.length) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Section header — accent bar left, title, See all right */}
        <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-1 h-8 rounded-full bg-secondary shrink-0" />
            <h2 className="text-[32px] font-bold text-[#111827] leading-tight tracking-tight">
              {categoryLabel}
            </h2>
          </div>
          <Link
            to={seeAllUrl}
            className="shrink-0 flex items-center gap-1 rounded-full border border-secondary px-4 py-1.5 text-[14px] font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            {t('collection.seeAll')}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 20).map((product) => {
            const isNew =
              product.createdAt &&
              Date.now() - new Date(product.createdAt).getTime() <
                30 * 24 * 60 * 60 * 1000;
            return (
              <ProductCard
                key={product.id}
                product={product}
                size="end-node"
                collectionHandle={collectionHandle}
                customBadge={isNew ? t('home.newBadge') : undefined}
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
// Promotions Carousel
// Drag-to-scroll horizontal carousel driven by Shopify metaobjects
// (type: "promotion"). Fields: badge, heading, subheading, description,
// cta_label, cta_url, color (secondary | primary | brand-accent | dark).
// ============================================================================

type PromoSlide = {
  id: string;
  badge: string;
  heading: string;
  subheading: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  color: string;
};

// Maps the "color" metaobject field to Tailwind bg + CTA text classes
const PROMO_COLORS: Record<string, {bg: string; cta: string}> = {
  secondary: {bg: 'bg-secondary', cta: 'text-secondary'},
  primary: {bg: 'bg-primary', cta: 'text-primary'},
  'brand-accent': {bg: 'bg-brand-accent', cta: 'text-brand-accent'},
  dark: {bg: 'bg-dark', cta: 'text-dark'},
};

function PromotionsCarousel({promotions}: {promotions: PromoSlide[]}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  // Attach mousemove/mouseup to window so drag continues even when the
  // cursor leaves the carousel container.
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !scrollRef.current) return;
      e.preventDefault();
      scrollRef.current.scrollLeft =
        scrollStart.current - (e.clientX - startX.current);
    }
    function onMouseUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (!scrollRef.current) return;
      scrollRef.current.style.cursor = 'grab';

      const el = scrollRef.current;
      const slideWidth = el.offsetWidth * 0.5; // matches min-w-[50%]
      const gap = 16; // matches gap-4
      const step = slideWidth + gap;
      const numSlides = el.children.length;
      const snapOffset = (el.offsetWidth - slideWidth) / 2;
      const index = Math.max(
        0,
        Math.min(
          numSlides - 1,
          Math.round((el.scrollLeft + snapOffset) / step),
        ),
      );
      el.scrollTo({
        left: Math.max(0, index * step - snapOffset),
        behavior: 'smooth',
      });
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  }

  const slideBase =
    'min-w-[50%] shrink-0 rounded-xl h-[260px] p-8 lg:p-12 flex items-center gap-10 lg:gap-16';

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-hidden cursor-grab select-none"
      style={
        {
          touchAction: 'pan-x',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties
      }
      onMouseDown={handleMouseDown}
      onDragStart={(e) => e.preventDefault()}
    >
      {promotions.map((promo) => {
        const colors = PROMO_COLORS[promo.color] ?? PROMO_COLORS.secondary;
        return (
          <div key={promo.id} className={`${slideBase} ${colors.bg}`}>
            <div className="shrink-0">
              {promo.badge && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                  {promo.badge}
                </p>
              )}
              <p className="text-[80px] font-black leading-none text-white mt-1">
                {promo.heading}
              </p>
              {promo.subheading && (
                <p className="text-[38px] font-bold leading-none text-white -mt-3">
                  {promo.subheading}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {promo.description && (
                <p className="text-[20px] font-semibold text-white/95 leading-snug max-w-[340px]">
                  {promo.description}
                </p>
              )}
              {promo.ctaLabel && promo.ctaUrl && (
                <Link
                  to={promo.ctaUrl}
                  className={`inline-flex items-center bg-white rounded-[100px] px-6 h-10 text-[14px] font-semibold hover:bg-white/90 transition-colors w-fit ${colors.cta}`}
                >
                  {promo.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Page Component
// Full homepage layout per Figma node 201:155 (1440×2554px)
// ============================================================================

export default function Homepage() {
  const {whatsNew, seasonal, discounted, promotions, heroSlides} =
    useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <>
      {/* ================================================================ */}
      {/* HERO CAROUSEL — Figma node 203:267                              */}
      {/* Carousel IS the hero: cycling bg + logo + search always shown   */}
      {/* ================================================================ */}
      <HeroCarousel
        slides={heroSlides}
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
              placeholder={t('home.searchPlaceholder')}
              autoComplete="off"
            />
          </Form>
        }
      />

      {/* ================================================================ */}
      {/* PRODUCTS CONTAINER — Figma node 218:476 (1440×1778px)           */}
      {/* ================================================================ */}
      <div className="flex flex-col items-start w-full gap-12 py-10">
        {/* What's New — products created in the last 30 days */}
        {whatsNew.length > 0 && (
          <ProductSection
            categoryLabel={t('home.whatsNew')}
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

        {/* Discounts — products with compare-at prices */}
        {discounted.length > 0 && (
          <ProductSection
            categoryLabel={t('home.discounts')}
            seeAllUrl="/collections/discounts"
            collectionHandle="discounts"
            products={discounted as CollectionProduct[]}
          />
        )}

        {/* ============================================================== */}
        {/* PROMOTIONS & DEALS — driven by "promotion" metaobjects        */}
        {/* ============================================================== */}
        {promotions.length > 0 && (
          <div className="flex flex-col pb-8 w-full">
            <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-8 rounded-full bg-secondary shrink-0" />
                  <h2 className="text-[32px] font-bold text-[#111827] leading-tight tracking-tight">
                    {t('home.promotionsDeals')}
                  </h2>
                </div>
              </div>
              <PromotionsCarousel promotions={promotions} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
