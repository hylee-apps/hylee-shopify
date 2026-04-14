import {type LoaderFunctionArgs, redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense, useState, useRef} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import {ProductGallery, VariantSelector} from '~/components';
import {AddToCart, PriceDisplay, QuantitySelector} from '~/components/commerce';
import {
  formatPriceParts,
  type MoneyLike,
} from '~/components/commerce/PriceDisplay';
import {Star, ShoppingCart, ImageIcon, Plus, Smile, Frown} from 'lucide-react';
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

import {
  findDeepestNavPath,
  buildPathFromParentMetafields,
  findDeepestMetafieldPath,
  type CollectionRef,
  PARENT_CHAIN_FRAGMENT,
} from '~/lib/breadcrumbs';
import {richTextToHtml} from '~/lib/rich-text';

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
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        url
        altText
        width
        height
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

  return {product, selectedVariant, recommendedProducts, collectionHandle};
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
  const {product, selectedVariant, recommendedProducts, collectionHandle} =
    loaderData;
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
  const [openDetailsItems, setOpenDetailsItems] = useState<string[]>([]);
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
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Breadcrumb ── */}
      <div className="mb-5">
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {/* Ancestor nodes: L1 / L2 / ... */}
            {breadcrumbNodes.map((node, i) => (
              <>
                {i > 0 && (
                  <BreadcrumbSeparator key={`sep-${node.url}`}>
                    /
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem key={node.url}>
                  <BreadcrumbLink asChild>
                    <Link to={node.url}>{node.title}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ))}

            {/* Product title removed — breadcrumb ends at the last collection */}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
            counts={SAMPLE_REVIEWS.reduce(
              (acc, r) => ({
                ...acc,
                [r.face]: (acc[r.face as FaceRatingValue] ?? 0) + 1,
              }),
              {} as Partial<Record<FaceRatingValue, number>>,
            )}
            totalCount={ratingCount ?? SAMPLE_REVIEWS.length}
          />

          {/* Accordion: Key Features / Specs / Does It Fit */}
          <Accordion
            type="single"
            defaultValue="key-features"
            className="mt-2 flex flex-col gap-4"
          >
            <AccordionItem
              value="key-features"
              className="rounded-lg border border-border bg-white px-4"
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
              className="rounded-lg border border-border bg-surface px-4"
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
                className="rounded-lg border border-border bg-surface px-4"
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
              <ReviewsSection rating={rating} ratingCount={ratingCount} />
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

function SpecsContent({
  productMetafields,
  primaryOnly,
}: {
  productMetafields?: Array<{key: string; value: string} | null> | null;
  /** When true, show only the top 6 primary specs (ordered by PRIMARY_SPEC_KEYS) */
  primaryOnly?: boolean;
}) {
  let entries = (productMetafields ?? []).filter(
    (mf): mf is {key: string; value: string} => mf != null && !!mf.value,
  );

  if (primaryOnly) {
    // Show primary specs first (in priority order), then fill remaining slots
    const primary = PRIMARY_SPEC_KEYS.map((key) =>
      entries.find((mf) => mf.key === key),
    ).filter(Boolean) as Array<{key: string; value: string}>;
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
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {entries.map((mf) => (
        <div key={mf.key} className="contents">
          <dt className="font-medium text-text">
            {METAFIELD_LABELS[mf.key] ??
              mf.key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
          </dt>
          <dd className="text-text-muted">{mf.value}</dd>
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

const SAMPLE_REVIEWS: Array<{
  id: string;
  initials: string;
  name: string;
  date: string;
  face: FaceRatingValue;
  body: string;
}> = [
  {
    id: '1',
    initials: 'NC',
    name: 'Nicolas Cage',
    date: '3 days ago',
    face: 1,
    body: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
  },
  {
    id: '2',
    initials: 'RD',
    name: 'Sr. Robert Downey',
    date: '1 week ago',
    face: 2,
    body: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
  },
  {
    id: '3',
    initials: 'AT',
    name: 'A. Thompson',
    date: '2 weeks ago',
    face: 3,
    body: 'Great product overall. Exactly as described and arrived quickly. Would definitely recommend to others.',
  },
];

function ReviewsSection({
  rating,
  ratingCount,
}: {
  rating: number | null;
  ratingCount: number | null;
}) {
  const [activeFilter, setActiveFilter] =
    useState<ReviewFilter>('Most Popular');

  const filteredReviews = SAMPLE_REVIEWS.filter((review) => {
    if (activeFilter === 'Happy') return review.face === 1;
    if (activeFilter === 'Unhappy') return review.face === 3;
    // 'Most Popular' and 'Most Recent' show all reviews
    return true;
  });

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Filter Pills */}
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

      {/* Review List */}
      <div className="flex flex-col divide-y divide-border">
        {filteredReviews.length === 0 && (
          <p className="py-6 text-sm text-text-muted text-center">
            No reviews match this filter.
          </p>
        )}
        {filteredReviews.map((review) => (
          <div key={review.id} className="flex gap-4 px-4 py-3">
            <Avatar className="size-[80px] shrink-0">
              <AvatarFallback className="bg-surface text-text-muted text-sm font-medium">
                {review.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[22px] leading-[28px] text-text">
                  {review.name}
                </span>
                <FaceIcon value={review.face} size={20} />
              </div>
              <p className="text-sm text-text-muted line-clamp-2 leading-[20px]">
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

interface RecommendedProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

function RecommendedProducts({products}: {products: RecommendedProduct[]}) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
      {products.slice(0, 4).map((product) => (
        <a
          key={product.id}
          href={`/products/${product.handle}`}
          className="group block"
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-surface mb-3">
            {product.featuredImage ? (
              <Image
                data={product.featuredImage}
                aspectRatio="1/1"
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={32} className="text-text-muted" />
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
          <PriceDisplay
            price={{
              amount: product.priceRange.minVariantPrice.amount,
              currencyCode: product.priceRange.minVariantPrice.currencyCode,
            }}
            size="sm"
            className="mt-1"
          />
        </a>
      ))}
    </div>
  );
}

function RecommendedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({length: 4}).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square rounded-lg mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
