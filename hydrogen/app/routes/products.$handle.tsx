import {type LoaderFunctionArgs, redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense, useState} from 'react';
import {Await, Link} from 'react-router';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import {
  ProductGallery,
  VariantSelector,
  Icon,
  Skeleton,
} from '~/components';
import {AddToCart, PriceDisplay, QuantitySelector} from '~/components/commerce';

// ============================================================================
// GraphQL Fragments & Query
// ============================================================================

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    quantityAvailable
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
    seo {
      title
      description
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
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
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

  // Build selected options from URL params
  const selectedOptions: {name: string; value: string}[] = [];
  searchParams.forEach((value, key) => {
    selectedOptions.push({name: key, value});
  });

  // Fetch product data
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

  // Get first available variant if no variant is selected
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  // Redirect to first variant if no options are selected
  if (!searchParams.size && firstVariant?.selectedOptions) {
    const params = new URLSearchParams();
    firstVariant.selectedOptions.forEach(
      (option: {name: string; value: string}) => {
        params.set(option.name.toLowerCase(), option.value);
      },
    );
    throw redirect(`/products/${handle}?${params.toString()}`);
  }

  // Defer recommendations
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {
      productId: product.id,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return {
    product,
    selectedVariant,
    recommendedProducts,
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
  const {product, selectedVariant, recommendedProducts} = loaderData;

  if (!product) {
    return null;
  }

  const isOnSale =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) >
      parseFloat(selectedVariant.price.amount);

  const isOutOfStock = !selectedVariant?.availableForSale;

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>(
    'description',
  );

  // Parse rating from metafields
  const ratingMeta = product.metafields?.find(
    (m: any) => m?.key === 'rating',
  );
  const ratingCountMeta = product.metafields?.find(
    (m: any) => m?.key === 'rating_count',
  );
  const rating = ratingMeta?.value ? parseFloat(ratingMeta.value) : null;
  const ratingCount = ratingCountMeta?.value
    ? parseInt(ratingCountMeta.value, 10)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="inline-flex items-center gap-2 rounded-lg bg-[#edf0f8] px-3 py-2 text-sm">
          <Link to="/" className="text-text-muted hover:text-primary">
            Home
          </Link>
          <Icon name="chevron-right" size={14} className="text-text-muted" />
          <Link
            to="/collections/all"
            className="text-text-muted hover:text-primary"
          >
            Products
          </Link>
          <Icon name="chevron-right" size={14} className="text-text-muted" />
          <span className="font-semibold text-[#3a4980]">{product.title}</span>
        </nav>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Product Gallery */}
        <div>
          <ProductGallery
            images={product.media.nodes
              .map((node: any) => node.image)
              .filter(Boolean)}
            productTitle={product.title}
          />
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          {/* Title + Vendor + Actions */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-semibold text-dark">
                {product.title}
              </h1>
              {product.vendor && (
                <p className="mt-2 text-base text-[#b9bbbf]">
                  {product.vendor}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8b4b8] px-3 py-1.5 text-sm font-medium text-[#d46f77]">
                <Icon name="heart" size={18} className="text-[#d46f77]" />
                109
              </button>
              {/* Bookmark */}
              <button className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-muted hover:text-[#3a4980] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              {/* Share */}
              <button className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-muted hover:text-[#3a4980] transition-colors">
                <Icon name="external-link" size={18} />
              </button>
            </div>
          </div>

          {/* Price + Rating */}
          <div className="flex flex-wrap items-start gap-8 lg:gap-12">
            {/* Price */}
            <div className="flex flex-col">
              {selectedVariant && (
                <>
                  <span className="text-[34px] font-bold leading-tight text-[#3a4980]">
                    ${parseFloat(selectedVariant.price.amount).toFixed(2)}
                  </span>
                  {isOnSale && selectedVariant.compareAtPrice && (
                    <span className="text-base text-black/40 line-through">
                      $
                      {parseFloat(
                        selectedVariant.compareAtPrice.amount,
                      ).toFixed(2)}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Rating + Reviews */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-3">
                {rating !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf3ea] px-3 py-1.5 text-sm font-semibold text-[#d48d3b]">
                    <Icon name="star" size={16} className="text-[#d48d3b]" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {ratingCount !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf0f8] px-3 py-1.5 text-sm font-semibold text-[#3a4980]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3a4980]">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {ratingCount} Reviews
                  </span>
                )}
              </div>
              {ratingCount !== null && ratingCount > 0 && (
                <p className="text-sm text-[#b9bbbf]">
                  <span className="font-semibold text-[#3e9242]">93%</span> of
                  buyers have recommended this.
                </p>
              )}
            </div>
          </div>

          {/* Variant Selector (Color, Size, etc.) */}
          <VariantSelector
            options={product.options}
            variants={product.variants.nodes}
            selectedVariant={selectedVariant}
            productHandle={product.handle}
          />

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            {selectedVariant && (
              <>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={selectedVariant.quantityAvailable ?? 99}
                  className="shrink-0"
                />
                <AddToCart
                  variantId={selectedVariant.id}
                  quantity={quantity}
                  available={!isOutOfStock}
                  className="flex-1 rounded-full bg-[#3a4980] px-8 py-4 text-base font-semibold text-white hover:bg-[#3a4980]/90"
                >
                  <span className="flex items-center justify-center gap-2.5">
                    <Icon name="shopping-bag" size={20} />
                    Add To Cart
                  </span>
                </AddToCart>
              </>
            )}
          </div>

          {/* Delivery Info Card */}
          <div className="rounded-xl border border-[#e4e4e4] p-5">
            <div className="flex gap-4">
              <div className="flex shrink-0 items-center justify-center w-10 h-10">
                <Icon name="truck" size={26} className="text-[#e07575]" />
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#1d364d]">
                  Free Delivery
                </p>
                <p className="text-sm text-[#726c6c] underline cursor-pointer">
                  Enter your Postal code for Delivery Availability
                </p>
              </div>
            </div>
            <hr className="my-4 border-border" />
            <div className="flex gap-4">
              <div className="flex shrink-0 items-center justify-center w-10 h-10">
                <Icon name="package" size={26} className="text-[#e07575]" />
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#1d364d]">
                  Return Delivery
                </p>
                <p className="text-sm text-[#726c6c]">
                  Free 30 days Delivery Return.{' '}
                  <span className="underline cursor-pointer">Details</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Reviews Tabs */}
      <section className="mt-16">
        {/* Tab Bar */}
        <div className="border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 text-base font-semibold transition-colors ${
                activeTab === 'description'
                  ? 'border-b-[3px] border-[#3a4980] text-[#3a4980]'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-base font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-[3px] border-[#3a4980] text-[#3a4980]'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'description' && (
            <DescriptionTab
              descriptionHtml={product.descriptionHtml}
              tags={product.tags}
              productType={product.productType}
              vendor={product.vendor}
              specifications={product.specifications?.value}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab rating={rating} ratingCount={ratingCount} />
          )}
        </div>
      </section>

      {/* Recommended Products */}
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
// Helper Components
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
                <Icon name="image" size={32} className="text-text-muted" />
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
          <Skeleton type="image" className="aspect-square rounded-lg mb-3" />
          <Skeleton type="text" className="w-3/4 mb-2" />
          <Skeleton type="text" className="w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Description Tab
// ============================================================================

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 mt-0.5 text-[#3a4980]"
    >
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.15"
      />
    </svg>
  );
}

interface DescriptionTabProps {
  descriptionHtml: string;
  tags: string[];
  productType: string;
  vendor: string;
  specifications?: string | null;
}

function DescriptionTab({
  descriptionHtml,
  tags,
  productType,
  vendor,
  specifications,
}: DescriptionTabProps) {
  // Parse specifications JSON if available
  let specs: Record<string, string> = {};
  if (specifications) {
    try {
      specs = JSON.parse(specifications) as Record<string, string>;
    } catch {
      // ignore invalid JSON
    }
  }

  // Build product details from available data
  const productDetails: string[] = [];
  if (productType) productDetails.push(`Type: ${productType}`);
  if (vendor) productDetails.push(`Brand: ${vendor}`);

  // Build more details from tags and specs
  const moreDetails: string[] = [];
  if (Object.keys(specs).length > 0) {
    Object.entries(specs).forEach(([key, value]) => {
      moreDetails.push(`${key}: ${value}`);
    });
  }
  if (tags.length > 0) {
    tags.forEach((tag) => {
      moreDetails.push(tag);
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Product Description */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-dark">
          Product Description
        </h3>
        <div
          className="prose prose-sm text-[#726c6c] leading-relaxed"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      </div>

      {/* Product Details */}
      {productDetails.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-dark">Product Details</h3>
          <ul className="space-y-2.5">
            {productDetails.map((detail, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-sm text-[#726c6c]">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* More Details */}
      {moreDetails.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-dark">More Details</h3>
          <ul className="space-y-2.5">
            {moreDetails.map((detail, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-sm text-[#726c6c]">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reviews Tab
// ============================================================================

function StarRating({
  rating,
  size = 16,
  className = '',
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({length: 5}).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? '#e8a43a' : 'none'}
          stroke={i < Math.round(rating) ? '#e8a43a' : '#d1d5db'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({length: 5}).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="focus:outline-none"
          aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
        >
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill={i < rating ? '#e8a43a' : 'none'}
            stroke={i < rating ? '#e8a43a' : '#d1d5db'}
            strokeWidth="1.5"
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface ReviewsTabProps {
  rating: number | null;
  ratingCount: number | null;
}

function ReviewsTab({rating, ratingCount}: ReviewsTabProps) {
  const displayRating = rating ?? 4.8;
  const displayCount = ratingCount ?? 0;

  // Simulated rating distribution
  const distribution = [
    {stars: 5, percent: 70},
    {stars: 4, percent: 15},
    {stars: 3, percent: 10},
    {stars: 2, percent: 3},
    {stars: 1, percent: 2},
  ];

  // Review form state
  const [formRating, setFormRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  // Sample reviews
  const sampleReviews = [
    {
      id: '1',
      initials: 'A.T',
      name: 'Nicolas Cage',
      date: '3 Days ago',
      rating: 5,
      title: 'Greate Product',
      body: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
    },
    {
      id: '2',
      initials: 'A.T',
      name: 'Sr.Robert Downey',
      date: 'Days ago',
      rating: 5,
      title: 'The best product in Market',
      body: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.",
    },
  ];

  return (
    <div className="max-w-3xl space-y-10">
      {/* Customers Feedback */}
      <div>
        <h3 className="mb-6 text-lg font-bold text-dark">
          Customers Feedback
        </h3>
        <div className="flex items-start gap-10 rounded-lg border border-border p-6">
          {/* Left: Overall Rating */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-bold text-[#3a4980]">
              {displayRating.toFixed(1)}
            </span>
            <StarRating rating={displayRating} size={18} />
            <span className="mt-1 text-sm text-text-muted">
              Product Rating
            </span>
          </div>

          {/* Right: Distribution Bars */}
          <div className="flex-1 space-y-2">
            {distribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3">
                <div className="h-2.5 flex-1 rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full rounded-full bg-[#3e9242]"
                    style={{width: `${row.percent}%`}}
                  />
                </div>
                <StarRating rating={row.stars} size={12} />
                <span className="w-8 text-right text-xs font-medium text-[#e8a43a]">
                  {row.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="mb-6 text-lg font-bold text-dark">Reviews</h3>
        <div className="space-y-6">
          {sampleReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border p-5"
            >
              {/* Header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3e9242] text-sm font-bold text-white">
                  {review.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark">
                      {review.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {review.date}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>
              </div>
              {/* Body */}
              <p className="mb-1 text-sm font-semibold text-dark">
                {review.title}
              </p>
              <p className="text-sm leading-relaxed text-[#726c6c]">
                {review.body}
              </p>
              {/* Actions */}
              <div className="mt-3 flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-text-muted hover:text-dark transition-colors">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  Like
                </button>
                <button className="font-medium text-[#3a4980] hover:underline">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Reviews */}
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-[#3a4980] underline hover:text-[#3a4980]/80">
            View All Reviews
          </button>
        </div>
      </div>

      {/* Write a Review */}
      <div>
        <h3 className="mb-6 text-lg font-bold text-dark">Write a Review</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Future: submit review via API
          }}
          className="space-y-5"
        >
          {/* Star Rating */}
          <div>
            <label className="mb-2 block text-sm text-text-muted">
              What is it like to Product?
            </label>
            <InteractiveStarRating
              rating={formRating}
              onChange={setFormRating}
            />
          </div>

          {/* Review Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">
              Review Title
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Great Products"
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-dark placeholder:text-text-muted/50 focus:border-[#3a4980] focus:outline-none focus:ring-1 focus:ring-[#3a4980]"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">
              Review Content
            </label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={5}
              className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-dark placeholder:text-text-muted/50 focus:border-[#3a4980] focus:outline-none focus:ring-1 focus:ring-[#3a4980]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="rounded-full bg-[#3a4980] px-8 py-3 text-sm font-semibold text-white hover:bg-[#3a4980]/90 transition-colors"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
