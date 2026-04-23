import {type LoaderFunctionArgs, redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense, useState, useRef, useEffect} from 'react';
import {
  Await,
  Link,
  useRouteLoaderData,
  useSearchParams,
  useFetcher,
} from 'react-router';
import type {RootLoader} from '~/root';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import {ProductGallery, VariantSelector} from '~/components';
import {AddToCart, PriceDisplay, QuantitySelector} from '~/components/commerce';
import {
  formatPriceParts,
  type MoneyLike,
} from '~/components/commerce/PriceDisplay';
import {
  Star,
  ShoppingCart,
  ImageIcon,
  Plus,
  Smile,
  Frown,
  Meh,
  PenLine,
} from 'lucide-react';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import type {ProductReview} from '~/routes/api.reviews';
import {ProductCard} from '~/components/commerce/ProductCard';
import {
  FaceIcon,
  FaceRatingSummary,
  toFaceRating,
  type FaceRatingValue,
} from '~/components/commerce/FaceRating';
import {Button} from '~/components/ui/button';
import {Skeleton} from '~/components/ui/skeleton';
import {Separator} from '~/components/ui/separator';
import {Avatar, AvatarFallback} from '~/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';

import {
  findDeepestNavPath,
  buildPathFromParentMetafields,
  findDeepestMetafieldPath,
  type CollectionRef,
  PARENT_CHAIN_FRAGMENT,
} from '~/lib/breadcrumbs';
import {richTextToHtml} from '~/lib/rich-text';
import {adminApi, type AdminEnv} from '~/lib/admin-api';

// ============================================================================
// Constants
// ============================================================================

/** Collection handles that should show the "Does It Fit" accordion section */
const DOES_IT_FIT_COLLECTIONS = new Set([
  'furniture',
  'appliances',
  'home-appliances',
]);

/** Ordered list of primary spec keys — top 6 with values shown inline */
const PRIMARY_SPEC_KEYS = [
  'dimensions',
  'weight',
  'material',
  'color',
  'capacity',
  'power_source',
];

// ============================================================================
// GraphQL Fragments & Query
// ============================================================================

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    tags
    publishedAt
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
    media(first: 20) {
      nodes {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    collections(first: 10) {
      nodes {
        id
        ...BcCollectionWithParents
      }
    }
    seo {
      title
      description
    }
    shortDescription: metafield(namespace: "custom", key: "short_description") {
      value
    }
    warranty: metafield(namespace: "custom", key: "warranty") {
      value
    }
    specifications: metafield(namespace: "custom", key: "specifications") {
      value
    }
    metafields(identifiers: [
      {namespace: "reviews", key: "rating"},
      {namespace: "reviews", key: "rating_count"}
    ]) {
      key
      value
    }

    productMetafields: metafields(identifiers: [
      {namespace: "custom", key: "dimensions"},
      {namespace: "custom", key: "height"},
      {namespace: "custom", key: "width"},
      {namespace: "custom", key: "depth"},
      {namespace: "custom", key: "weight"},
      {namespace: "custom", key: "material"},
      {namespace: "custom", key: "color"},
      {namespace: "custom", key: "model_number"},
      {namespace: "custom", key: "manufacturer"},
      {namespace: "custom", key: "country_of_origin"},
      {namespace: "custom", key: "power_source"},
      {namespace: "custom", key: "voltage"},
      {namespace: "custom", key: "wattage"},
      {namespace: "custom", key: "capacity"},
      {namespace: "custom", key: "battery_life"}
    ]) {
      namespace
      key
      value
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PARENT_CHAIN_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      vendor
      availableForSale
      tags
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
      images(first: 2) {
        nodes {
          id
          url
          altText
          width
          height
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
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const selectedOptions: {name: string; value: string}[] = [];
  searchParams.forEach((value, key) => {
    selectedOptions.push({name: key, value});
  });

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  if (!searchParams.size && firstVariant?.selectedOptions) {
    const params = new URLSearchParams();
    firstVariant.selectedOptions.forEach(
      (option: {name: string; value: string}) => {
        params.set(option.name.toLowerCase(), option.value);
      },
    );
    throw redirect(
      `/products/${encodeURIComponent(handle)}?${params.toString()}`,
    );
  }

  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {
      productId: product.id,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  // ?collection=<handle> is appended by PLP links so we can build breadcrumbs
  const collectionHandle = searchParams.get('collection') ?? null;

  const isLoggedIn = isCustomerLoggedIn(context.session);

  // Read reviews via Admin API — Storefront API has a propagation delay for
  // metafields written through the Admin API, so reads must go through the same path.
  let storedReviews: ProductReview[] = [];
  try {
    const reviewsData = await adminApi<{
      product: {reviewsMeta: {value: string} | null} | null;
    }>(
      context.env as unknown as AdminEnv,
      `query ProductReviewsLoad($productId: ID!) {
        product(id: $productId) {
          reviewsMeta: metafield(namespace: "custom", key: "reviews_json") {
            value
          }
        }
      }`,
      {productId: product.id},
    );
    const raw = reviewsData.product?.reviewsMeta?.value;
    if (raw) storedReviews = JSON.parse(raw) as ProductReview[];
  } catch {
    // No reviews yet or Admin API unavailable — show empty list
  }

  return {
    product,
    selectedVariant,
    recommendedProducts,
    collectionHandle,
    isLoggedIn,
    storedReviews,
  };
}

// ============================================================================
// SEO Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  if (!data?.product) {
    return [{title: 'Product Not Found'}];
  }
  const {product, selectedVariant} = data;
  return getSeoMeta({
    title: product.seo?.title ?? product.title,
    description: product.seo?.description ?? product.description,
    media: selectedVariant?.image ?? product.featuredImage,
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ProductPage({loaderData}: Route.ComponentProps) {
  const {
    product,
    selectedVariant,
    recommendedProducts,
    collectionHandle,
    isLoggedIn,
    storedReviews,
  } = loaderData;
  const root = useRouteLoaderData<RootLoader>('root');

  if (!product) return null;

  const productCollections = (product.collections?.nodes ??
    []) as CollectionRef[];

  // Strategy A: metafield parent chain — prefer the ?collection= anchor if it
  // has a chain, otherwise find the collection with the deepest chain.
  let metafieldPath: Array<{title: string; url: string}> | null = null;
  if (collectionHandle) {
    const anchor = productCollections.find(
      (c) => c.handle === collectionHandle,
    );
    if (anchor) metafieldPath = buildPathFromParentMetafields(anchor);
  }
  if (!metafieldPath) {
    metafieldPath = findDeepestMetafieldPath(productCollections);
  }

  // Strategy B: nav menu fallback (used when metafields aren't set up yet)
  const uniqueHandles = [
    ...new Set([
      ...(collectionHandle ? [collectionHandle] : []),
      ...productCollections.map((c) => c.handle),
    ]),
  ];
  const navPath = uniqueHandles.length
    ? findDeepestNavPath(root?.header?.menu, uniqueHandles)
    : null;

  // Anchor handle for the last-resort single-crumb fallback
  const anchorHandle =
    collectionHandle ?? productCollections[0]?.handle ?? null;

  const breadcrumbNodes: Array<{title: string; url: string}> =
    metafieldPath ??
    navPath ??
    (anchorHandle
      ? [
          {
            title:
              productCollections.find((c) => c.handle === anchorHandle)
                ?.title ??
              anchorHandle
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            url: `/collections/${anchorHandle}`,
          },
        ]
      : []);

  const isOnSale =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) >
      parseFloat(selectedVariant.price.amount);

  const isOutOfStock = !selectedVariant?.availableForSale;
  const [quantity, setQuantity] = useState(1);
  const [searchParams] = useSearchParams();
  const writeReviewParam = searchParams.get('write_review') === '1';
  const [openDetailsItems, setOpenDetailsItems] = useState<string[]>(
    writeReviewParam ? ['reviews'] : [],
  );
  const detailsAccordionRef = useRef<HTMLDivElement>(null);

  function openAccordionAndScroll(section: string) {
    setOpenDetailsItems((prev) =>
      prev.includes(section) ? prev : [...prev, section],
    );
    setTimeout(() => {
      detailsAccordionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  const ratingMeta = product.metafields?.find((m: any) => m?.key === 'rating');
  const ratingCountMeta = product.metafields?.find(
    (m: any) => m?.key === 'rating_count',
  );
  const rating = ratingMeta?.value ? parseFloat(ratingMeta.value) : null;
  const ratingCount = ratingCountMeta?.value
    ? parseInt(ratingCountMeta.value, 10)
    : null;

  const images = product.media.nodes
    .map((node: any) => node.image)
    .filter(Boolean);

  // Shopify adds a default "Title" option to single-variant products — exclude it
  const hasVariantOptions = product.options.some(
    (opt: {name: string}) => opt.name.toLowerCase() !== 'title',
  );

  return (
    <>
      {/* Product title omitted — breadcrumb ends at the parent collection */}
      <PageBreadcrumbs crumbs={breadcrumbNodes} />
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── 3-Column Grid ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[10px]">
          {/* Col 1: Image Gallery (vertical thumbnails) */}
          <div>
            <ProductGallery
              images={images}
              selectedVariant={selectedVariant}
              productTitle={product.title}
              layout="vertical"
            />
          </div>

          {/* Col 2: Product Info + Accordion */}
          <div className="flex flex-col gap-[9px]">
            <h1 className="text-[21px] font-semibold leading-normal text-black">
              {product.title}
            </h1>

            {/* Aggregate Face Rating */}
            <FaceRatingSummary
              counts={storedReviews.reduce(
                (
                  acc: Partial<Record<FaceRatingValue, number>>,
                  r: ProductReview,
                ) => ({
                  ...acc,
                  [r.face]: (acc[r.face as FaceRatingValue] ?? 0) + 1,
                }),
                {} as Partial<Record<FaceRatingValue, number>>,
              )}
              totalCount={ratingCount ?? storedReviews.length}
            />

            {/* Accordion: Key Features / Specs / Does It Fit */}
            <Accordion
              type="single"
              defaultValue="key-features"
              className="mt-2 flex flex-col gap-4"
            >
              <AccordionItem
                value="key-features"
                className="overflow-hidden rounded-lg ring-1 ring-inset ring-border bg-white px-4"
              >
                <AccordionTrigger className="text-[16px] font-semibold text-text hover:no-underline">
                  Key Item Features
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm text-text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: richTextToHtml(product.shortDescription?.value),
                    }}
                  />
                  <button
                    onClick={() => openAccordionAndScroll('details')}
                    className="mt-3 text-sm font-medium text-secondary hover:underline"
                  >
                    View full details
                  </button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="specs"
                className="overflow-hidden rounded-lg ring-1 ring-inset ring-border bg-surface px-4"
              >
                <AccordionTrigger className="text-[16px] font-semibold text-text hover:no-underline">
                  Specs
                </AccordionTrigger>
                <AccordionContent>
                  <SpecsContent
                    productMetafields={product.productMetafields}
                    primaryOnly
                  />
                  <button
                    onClick={() => openAccordionAndScroll('specifications')}
                    className="mt-3 text-sm font-medium text-secondary hover:underline"
                  >
                    View full specifications
                  </button>
                </AccordionContent>
              </AccordionItem>

              {productCollections.some((c) =>
                DOES_IT_FIT_COLLECTIONS.has(c.handle),
              ) && (
                <AccordionItem
                  value="does-it-fit"
                  className="overflow-hidden rounded-lg ring-1 ring-inset ring-border bg-surface px-4"
                >
                  <AccordionTrigger className="text-[16px] font-semibold text-text hover:no-underline">
                    Does It Fit
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-text-muted">
                      {product.warranty?.value ??
                        'Please check product dimensions before purchasing.'}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

          {/* Col 3: Purchase Controls */}
          <div className="flex flex-col gap-0 overflow-hidden py-0.5">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              {selectedVariant && (
                <>
                  <PdpPrice
                    money={selectedVariant.price}
                    className="text-[24px] font-semibold tracking-[0.5px] text-black"
                    supClassName="text-[12px]"
                  />
                  {isOnSale && selectedVariant.compareAtPrice && (
                    <PdpPrice
                      money={selectedVariant.compareAtPrice}
                      className="text-[14px] font-semibold tracking-[0.5px] text-text-muted line-through"
                      supClassName="text-[8px]"
                    />
                  )}
                </>
              )}
            </div>

            <Separator className="my-[15px]" />

            {/* Variant Selector — hidden for single-variant products (no real options) */}
            {hasVariantOptions && (
              <>
                <VariantSelector
                  options={product.options}
                  variants={product.variants.nodes}
                  selectedVariant={selectedVariant}
                  productHandle={product.handle}
                />
                <Separator className="my-3.75" />
              </>
            )}

            {/* Quantity + Add to Cart */}
            {selectedVariant && (
              <div className="flex items-center gap-[10px]">
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={99}
                  className="shrink-0"
                />
                <AddToCart
                  variantId={selectedVariant.id}
                  quantity={quantity}
                  available={!isOutOfStock}
                  className="flex-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary/90"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add to Cart
                  </span>
                </AddToCart>
              </div>
            )}
          </div>
        </div>

        {/* ── Below: Full-Width Accordion (Details / Specs / Warranty / Reviews) ── */}
        <div className="mt-8" ref={detailsAccordionRef}>
          <Accordion
            type="multiple"
            value={openDetailsItems}
            onValueChange={setOpenDetailsItems}
            className="flex flex-col gap-0"
          >
            <AccordionItem value="details" className="border-b">
              <AccordionTrigger className="px-4 py-4 text-[16px] font-semibold text-text hover:no-underline">
                <span className="flex items-center gap-3">
                  <Star size={20} className="text-secondary shrink-0" />
                  Details
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div
                  className="prose prose-sm text-text-muted leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product.descriptionHtml,
                  }}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specifications" className="border-b">
              <AccordionTrigger className="px-4 py-4 text-[16px] font-semibold text-text hover:no-underline">
                <span className="flex items-center gap-3">
                  <Star size={20} className="text-secondary shrink-0" />
                  Specifications
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <SpecsContent productMetafields={product.productMetafields} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warranty" className="border-b">
              <AccordionTrigger className="px-4 py-4 text-[16px] font-semibold text-text hover:no-underline">
                <span className="flex items-center gap-3">
                  <Star size={20} className="text-secondary shrink-0" />
                  Warranty
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <p className="text-sm text-text-muted">
                  {product.warranty?.value ??
                    'No warranty information available.'}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reviews" className="border-b">
              <AccordionTrigger className="px-4 py-4 text-[16px] font-semibold text-text hover:no-underline">
                <span className="flex items-center gap-3">
                  <Star size={20} className="text-secondary shrink-0" />
                  Reviews
                  {ratingCount != null && ratingCount > 0 && (
                    <span className="ml-1 text-sm font-normal text-text-muted">
                      ({ratingCount})
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <ReviewsSection
                  key={product.id}
                  rating={rating}
                  ratingCount={ratingCount}
                  reviews={storedReviews}
                  productId={product.id}
                  isLoggedIn={isLoggedIn}
                  openWriteFormInitially={writeReviewParam}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* ── Recommended Products ── */}
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-dark">
            Similar Items You Might Also Like
          </h2>
          <Suspense fallback={<RecommendedProductsSkeleton />}>
            <Await resolve={recommendedProducts}>
              {(data) => (
                <RecommendedProducts
                  products={data?.productRecommendations || []}
                />
              )}
            </Await>
          </Suspense>
        </section>
      </div>
    </>
  );
}

// ============================================================================
// PDP Price — locale-aware currency display with superscript symbol
// ============================================================================

/**
 * Renders a price with its currency symbol positioned correctly for the locale.
 * - Pre-symbol currencies (USD $, GBP £, EUR €, JPY ¥): symbol rendered as <sup>
 * - Post-symbol currencies (SEK kr, NOK kr, DKK kr, etc.): symbol appended after
 */
function PdpPrice({
  money,
  className,
  supClassName,
}: {
  money: MoneyLike;
  className?: string;
  supClassName?: string;
}) {
  const {symbol, number, symbolPosition} = formatPriceParts(money);
  return (
    <span className={className}>
      {symbolPosition === 'before' && (
        <sup className={supClassName}>{symbol}</sup>
      )}
      {number}
      {symbolPosition === 'after' && (
        <span className={supClassName}>&nbsp;{symbol}</span>
      )}
    </span>
  );
}

// ============================================================================
// Specs Content
// ============================================================================

/** Maps metafield keys to human-readable labels */
const METAFIELD_LABELS: Record<string, string> = {
  dimensions: 'Dimensions',
  height: 'Height',
  width: 'Width',
  depth: 'Depth',
  weight: 'Weight',
  material: 'Material',
  color: 'Color',
  model_number: 'Model Number',
  manufacturer: 'Manufacturer',
  country_of_origin: 'Country of Origin',
  power_source: 'Power Source',
  voltage: 'Voltage',
  wattage: 'Wattage',
  capacity: 'Capacity',
  battery_life: 'Battery Life',
};

/** Keys in the `custom` namespace that are displayed in dedicated sections (not Specs) */
const EXCLUDED_SPEC_KEYS = new Set([
  'short_description',
  'warranty',
  'specifications',
]);

function SpecsContent({
  productMetafields,
  primaryOnly,
}: {
  productMetafields?: Array<{
    namespace: string;
    key: string;
    value: string;
  } | null> | null;
  /** When true, show only the top 6 primary specs (ordered by PRIMARY_SPEC_KEYS) */
  primaryOnly?: boolean;
}) {
  let entries = (productMetafields ?? []).filter(
    (mf): mf is {namespace: string; key: string; value: string} =>
      mf != null &&
      !!mf.value &&
      mf.namespace === 'custom' &&
      !EXCLUDED_SPEC_KEYS.has(mf.key),
  );

  if (primaryOnly) {
    // Show primary specs first (in priority order), then fill remaining slots
    const primary = PRIMARY_SPEC_KEYS.map((key) =>
      entries.find((mf) => mf.key === key),
    ).filter(Boolean) as Array<{namespace: string; key: string; value: string}>;
    const primaryKeySet = new Set(PRIMARY_SPEC_KEYS);
    const rest = entries.filter((mf) => !primaryKeySet.has(mf.key));
    entries = [...primary, ...rest].slice(0, 6);
  }

  if (!entries.length) {
    return (
      <p className="text-sm text-text-muted">No specifications available.</p>
    );
  }

  return (
    <dl className="flex flex-col gap-y-2 text-sm">
      {entries.map((mf) => (
        <div key={mf.key} className="flex justify-between gap-4">
          <dt className="font-medium text-text">
            {METAFIELD_LABELS[mf.key] ??
              mf.key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
          </dt>
          <dd className="text-text-muted text-right">{mf.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ============================================================================
// Reviews Section
// ============================================================================

type ReviewFilter = 'Most Popular' | 'Most Recent' | 'Happy' | 'Unhappy';

const REVIEW_FILTERS: ReviewFilter[] = [
  'Most Popular',
  'Most Recent',
  'Happy',
  'Unhappy',
];

function formatReviewDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function ReviewsSection({
  rating,
  ratingCount,
  reviews,
  productId,
  isLoggedIn,
  openWriteFormInitially,
}: {
  rating: number | null;
  ratingCount: number | null;
  reviews: ProductReview[];
  productId: string;
  isLoggedIn: boolean;
  openWriteFormInitially?: boolean;
}) {
  const [activeFilter, setActiveFilter] =
    useState<ReviewFilter>('Most Popular');
  const [showWriteForm, setShowWriteForm] = useState(
    openWriteFormInitially ?? false,
  );
  const [selectedFace, setSelectedFace] = useState<FaceRatingValue | null>(
    null,
  );
  const [reviewBody, setReviewBody] = useState('');
  const [submittedReview, setSubmittedReview] = useState<ProductReview | null>(
    null,
  );

  const fetcher = useFetcher<{
    success?: boolean;
    review?: ProductReview;
    error?: string;
  }>();
  const isSubmitting = fetcher.state === 'submitting';

  // When the fetch settles with a successful review, reset the form and surface the new review
  useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data?.success &&
      fetcher.data.review
    ) {
      setSubmittedReview(fetcher.data.review);
      setShowWriteForm(false);
      setSelectedFace(null);
      setReviewBody('');
    }
  }, [fetcher.state, fetcher.data]);

  // Prepend the just-submitted review only until the loader revalidates and
  // includes it — once it appears in `reviews` we stop prepending to avoid a duplicate.
  const submittedAlreadyInList = submittedReview
    ? reviews.some((r) => r.id === submittedReview.id)
    : false;
  const allReviews: ProductReview[] =
    submittedReview && !submittedAlreadyInList
      ? [submittedReview, ...reviews]
      : reviews;

  const filteredReviews = allReviews.filter((review) => {
    if (activeFilter === 'Happy') return review.face === 1;
    if (activeFilter === 'Unhappy') return review.face === 3;
    return true;
  });

  const serverError =
    fetcher.data && !fetcher.data.success ? fetcher.data.error : null;

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Header row: filter pills + write review button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-[5px]">
          {REVIEW_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity ${
                activeFilter === filter
                  ? 'bg-secondary'
                  : 'bg-secondary/70 hover:bg-secondary/90'
              }`}
            >
              {filter === 'Most Popular' && <Plus size={14} />}
              {filter === 'Happy' && <Smile size={14} />}
              {filter === 'Unhappy' && <Frown size={14} />}
              {filter}
            </button>
          ))}
        </div>

        {isLoggedIn && !submittedReview && (
          <button
            onClick={() => setShowWriteForm((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-secondary px-5 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            <PenLine size={14} />
            Write a review
          </button>
        )}
        {!isLoggedIn && (
          <Link
            to="/account/login?redirect=/products"
            className="flex items-center gap-2 rounded-full border border-secondary px-5 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            <PenLine size={14} />
            Sign in to review
          </Link>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteForm && isLoggedIn && !submittedReview && (
        <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-5">
          <h3 className="mb-4 text-[16px] font-semibold text-text">
            Write a review
          </h3>

          <fetcher.Form method="POST" action="/api/reviews">
            <input type="hidden" name="productId" value={productId} />

            {/* Face Rating Selector */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-text">
                How did you feel about this product?
              </p>
              <div className="flex gap-3">
                {([1, 2, 3] as FaceRatingValue[]).map((face) => {
                  const icons: Record<FaceRatingValue, React.ReactNode> = {
                    1: <Smile size={28} />,
                    2: <Meh size={28} />,
                    3: <Frown size={28} />,
                  };
                  const labels: Record<FaceRatingValue, string> = {
                    1: 'Happy',
                    2: 'Neutral',
                    3: 'Unhappy',
                  };
                  const colors: Record<FaceRatingValue, string> = {
                    1: 'text-primary border-primary bg-primary/10',
                    2: 'text-warning border-warning bg-warning/10',
                    3: 'text-destructive border-destructive bg-destructive/10',
                  };
                  const isSelected = selectedFace === face;
                  return (
                    <button
                      key={face}
                      type="button"
                      onClick={() => setSelectedFace(face)}
                      aria-label={labels[face]}
                      className={`flex flex-col items-center gap-1.5 rounded-[10px] border-2 px-5 py-3 text-xs font-medium transition-all ${
                        isSelected
                          ? colors[face]
                          : 'border-[#e5e7eb] text-text-muted hover:border-[#9ca3af]'
                      }`}
                    >
                      {icons[face]}
                      <span>{labels[face]}</span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="face" value={selectedFace ?? ''} />
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label
                htmlFor="review-body"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Your review
              </label>
              <textarea
                id="review-body"
                name="body"
                rows={4}
                maxLength={1000}
                placeholder="Share your experience with this product..."
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                className="w-full resize-none rounded-[8px] border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              <div className="mt-1 text-right text-xs text-text-muted">
                {reviewBody.length}/1000
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <p className="mb-3 text-sm text-destructive">{serverError}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedFace || !reviewBody.trim()}
                className="rounded-full bg-secondary px-6 py-2.5 text-sm font-medium text-white hover:bg-secondary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Submit review'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowWriteForm(false);
                  setSelectedFace(null);
                  setReviewBody('');
                }}
                className="text-sm text-text-muted hover:text-text"
              >
                Cancel
              </button>
            </div>
          </fetcher.Form>
        </div>
      )}

      {/* Success message after submission */}
      {submittedReview && (
        <div className="flex items-center gap-3 rounded-[10px] border border-primary/30 bg-primary/5 px-4 py-3">
          <Smile size={20} className="shrink-0 text-primary" />
          <p className="text-sm font-medium text-primary">
            Thank you for your review!
          </p>
        </div>
      )}

      {/* Review List */}
      <div className="flex flex-col divide-y divide-border">
        {filteredReviews.length === 0 && (
          <p className="py-6 text-center text-sm text-text-muted">
            {allReviews.length === 0
              ? 'No reviews yet. Be the first to share your experience!'
              : 'No reviews match this filter.'}
          </p>
        )}
        {filteredReviews.map((review) => (
          <div key={review.id} className="flex gap-4 px-4 py-3">
            <Avatar className="size-[80px] shrink-0">
              <AvatarFallback className="bg-surface text-sm font-medium text-text-muted">
                {review.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-semibold leading-[28px] text-text">
                  {review.name}
                </span>
                <FaceIcon value={review.face} size={20} />
                <span className="ml-auto text-xs text-text-muted">
                  {formatReviewDate(review.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-[20px] text-text-muted">
                {review.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Recommended Products
// ============================================================================

function RecommendedProducts({
  products,
}: {
  products: Parameters<typeof ProductCard>[0]['product'][];
}) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
      {products.slice(0, 5).map((product) => (
        <ProductCard key={product.id} product={product} size="end-node" />
      ))}
    </div>
  );
}

function RecommendedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
      {Array.from({length: 5}).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-[12px] border border-[#e5e7eb] overflow-hidden"
        >
          <Skeleton className="h-[250px] w-full rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
