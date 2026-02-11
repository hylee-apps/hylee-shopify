import {type LoaderFunctionArgs, redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense} from 'react';
import {Await} from 'react-router';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import {
  ProductGallery,
  VariantSelector,
  Breadcrumb,
  Badge,
  Accordion,
  AccordionItem,
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
  if (
    !searchParams.size &&
    firstVariant?.selectedOptions
  ) {
    const params = new URLSearchParams();
    firstVariant.selectedOptions.forEach((option: {name: string; value: string}) => {
      params.set(option.name.toLowerCase(), option.value);
    });
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

  // Parse specifications JSON if exists
  let specifications: Record<string, string> = {};
  if (product.specifications?.value) {
    try {
      const parsed = JSON.parse(product.specifications.value);
      if (typeof parsed === 'object' && parsed !== null) {
        specifications = parsed as Record<string, string>;
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  const isOnSale =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) >
      parseFloat(selectedVariant.price.amount);

  const isOutOfStock = !selectedVariant?.availableForSale;
  const isLowStock =
    selectedVariant?.quantityAvailable &&
    selectedVariant.quantityAvailable <= 5 &&
    selectedVariant.quantityAvailable > 0;

  return (
    <div className="mx-auto max-w-350 px-4 py-8 lg:px-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {label: 'Home', url: '/'},
          {label: 'Products', url: '/collections/all'},
          {label: product.title},
        ]}
        className="mb-6"
      />

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={product.media.nodes.map((node: any) => node.image).filter(Boolean)}
            productTitle={product.title}
          />
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title & Vendor */}
          <div>
            {product.vendor && (
              <p className="text-sm text-text-muted mb-1">{product.vendor}</p>
            )}
            <h1 className="text-2xl lg:text-3xl font-semibold text-dark">
              {product.title}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {isOnSale && <Badge variant="success">Sale</Badge>}
            {isOutOfStock && <Badge variant="destructive">Sold Out</Badge>}
            {isLowStock && (
              <Badge variant="warning">
                Only {selectedVariant.quantityAvailable} left
              </Badge>
            )}
          </div>

          {/* Description Accordion */}
          <Accordion defaultOpenKeys={['description']}>
            <AccordionItem id="description" title="Description">
              <div
                className="prose prose-sm text-text-muted"
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              />
            </AccordionItem>

            {/* Specifications */}
            {Object.keys(specifications).length > 0 && (
              <AccordionItem id="specs" title="Specifications">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specifications).map(([key, value]) => (
                      <tr key={key} className="border-b border-border">
                        <td className="py-2 font-medium text-text">{key}</td>
                        <td className="py-2 text-text-muted">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionItem>
            )}

            {/* Warranty */}
            {product.warranty?.value && (
              <AccordionItem id="warranty" title="Warranty">
                <p className="text-sm text-text-muted">{product.warranty.value}</p>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Buy Box Column */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-6 bg-surface p-6 rounded-lg border border-border">
            {/* Price */}
            <div>
              {selectedVariant && (
                <PriceDisplay
                  price={{
                    amount: selectedVariant.price.amount,
                    currencyCode: selectedVariant.price.currencyCode,
                  }}
                  compareAtPrice={
                    selectedVariant.compareAtPrice
                      ? {
                          amount: selectedVariant.compareAtPrice.amount,
                          currencyCode: selectedVariant.compareAtPrice.currencyCode,
                        }
                      : undefined
                  }
                  size="lg"
                />
              )}
            </div>

            {/* Variant Selector */}
            <VariantSelector
              options={product.options}
              variants={product.variants.nodes}
              selectedVariant={selectedVariant}
              productHandle={product.handle}
            />

            {/* Add to Cart */}
            {selectedVariant && (
              <AddToCart
                variantId={selectedVariant.id}
                available={!isOutOfStock}
                fullWidth
              />
            )}

            {/* SKU */}
            {selectedVariant?.sku && (
              <p className="text-xs text-text-muted text-center">
                SKU: {selectedVariant.sku}
              </p>
            )}

            {/* Trust badges */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Icon name="truck" size={16} />
                <span>Free shipping on orders over $99</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Icon name="refresh" size={16} />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Icon name="shield" size={16} />
                <span>2-year warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-dark mb-8">
          You might also like
        </h2>
        <Suspense fallback={<RecommendedProductsSkeleton />}>
          <Await resolve={recommendedProducts}>
            {(data) => <RecommendedProducts products={data?.productRecommendations || []} />}
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
    id: string;
    url: string;
    altText?: string | null;
    width: number;
    height: number;
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
