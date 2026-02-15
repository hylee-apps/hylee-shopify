import {type LoaderFunctionArgs, redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense} from 'react';
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
            <div className="flex items-center gap-3">
              {/* Wishlist */}
              <button className="flex items-center gap-1.5 rounded-lg bg-[#fff0f0] px-2.5 py-1.5">
                <Icon name="heart" size={20} className="text-[#d46f77]" />
              </button>
              {/* Share */}
              <button className="rounded-lg bg-[#edf0f8] p-1.5">
                <Icon name="external-link" size={20} className="text-[#3a4980]" />
              </button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Price + Rating */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              {selectedVariant && (
                <>
                  <span className="text-[34px] font-bold text-[#3a4980]">
                    ${parseFloat(selectedVariant.price.amount).toFixed(2)}
                  </span>
                  {isOnSale && selectedVariant.compareAtPrice && (
                    <span className="text-xl text-black/50 line-through">
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {rating !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf3ea] px-2.5 py-1.5 text-sm font-semibold text-[#d48d3b]">
                    <Icon name="star" size={16} className="text-[#d48d3b]" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {ratingCount !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf0f8] px-2.5 py-1.5 text-sm font-semibold text-[#3a4980]">
                    <Icon name="star" size={16} />
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

          <hr className="border-border" />

          {/* Variant Selector (Color, Size, etc.) */}
          <VariantSelector
            options={product.options}
            variants={product.variants.nodes}
            selectedVariant={selectedVariant}
            productHandle={product.handle}
          />

          <hr className="border-border" />

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            {selectedVariant && (
              <>
                <AddToCart
                  variantId={selectedVariant.id}
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
          <div className="rounded-xl border border-[#e4e4e4] p-4">
            <div className="flex gap-3.5">
              <Icon name="truck" size={24} className="shrink-0 text-dark" />
              <div>
                <p className="text-[17px] font-bold text-[#1d364d]">
                  Free Delivery
                </p>
                <p className="text-sm text-[#726c6c] underline">
                  Enter your Postal code for Delivery Availability
                </p>
              </div>
            </div>
            <hr className="my-4 border-border" />
            <div className="flex gap-3.5">
              <Icon name="refresh" size={24} className="shrink-0 text-dark" />
              <div>
                <p className="text-[17px] font-bold text-[#1d364d]">
                  Return Delivery
                </p>
                <p className="text-sm text-[#726c6c]">
                  Free 30 days Delivery Return.{' '}
                  <span className="underline">Details</span>
                </p>
              </div>
            </div>
          </div>

          {/* Product Description */}
          {product.descriptionHtml && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-dark">
                Description
              </h3>
              <div
                className="prose prose-sm text-text-muted"
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recommended Products */}
      <section className="mt-16">
        <h2 className="mb-8 text-2xl font-semibold text-dark">
          You might also like
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
