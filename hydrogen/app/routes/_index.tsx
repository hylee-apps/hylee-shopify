import {useState, useEffect, useCallback} from 'react';
import {Link, Form, useNavigate} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Route} from './+types/_index';
import {Button} from '~/components/forms';
import {Icon, Badge, Card} from '~/components/display';
import {Input} from '~/components/forms';
import {ProductCard} from '~/components/commerce';

// ============================================================================
// GraphQL
// ============================================================================

const HOMEPAGE_PRODUCT_FRAGMENT = `#graphql
  fragment HomepageProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    tags
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
    metafields(identifiers: [
      {namespace: "reviews", key: "rating"},
      {namespace: "reviews", key: "rating_count"}
    ]) {
      key
      value
    }
  }
` as const;

const HOMEPAGE_QUERY = `#graphql
  query Homepage(
    $featuredCount: Int!
    $newArrivalsCount: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    featuredProducts: collection(handle: "all") {
      products(first: $featuredCount, sortKey: BEST_SELLING) {
        nodes {
          ...HomepageProduct
        }
      }
    }
    newArrivals: collection(handle: "all") {
      products(first: $newArrivalsCount, sortKey: CREATED_AT, reverse: true) {
        nodes {
          ...HomepageProduct
        }
      }
    }
    collections(first: 6, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
        productsCount: products(first: 0) {
          filters {
            values {
              count
            }
          }
        }
      }
    }
  }
  ${HOMEPAGE_PRODUCT_FRAGMENT}
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const data = await storefront.query(HOMEPAGE_QUERY, {
    variables: {
      featuredCount: 8,
      newArrivalsCount: 4,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return {
    featuredProducts: data.featuredProducts?.products.nodes ?? [],
    newArrivals: data.newArrivals?.products.nodes ?? [],
    collections: data.collections?.nodes ?? [],
  };
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
// Page Component
// ============================================================================

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {featuredProducts, newArrivals, collections} = loaderData;

  return (
    <div>
      <HeroSearch />
      <FeaturedCategories collections={collections} />
      <FeaturedProducts products={featuredProducts} />
      <NewArrivals products={newArrivals} />
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}

// ============================================================================
// Section 1: Hero Search
// ============================================================================

function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-r from-secondary to-accent px-4 py-16 sm:py-24">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/10" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
          Welcome to Our Marketplace
        </h1>
        <p className="mb-8 text-lg text-white/90">
          Discover unique products from trusted vendors worldwide
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={20}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories, brands..."
              className="w-full rounded-lg border-0 bg-white py-3 pr-4 pl-12 text-base shadow-lg placeholder:text-text-muted focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="lg">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}

// ============================================================================
// Section 2: Featured Categories
// ============================================================================

interface CategoryItem {
  icon: string;
  title: string;
  handle: string;
  description: string;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    icon: '📱',
    title: 'Electronics',
    handle: 'electronics',
    description: 'Gadgets & Tech',
  },
  {
    icon: '👗',
    title: 'Fashion',
    handle: 'fashion',
    description: 'Clothing & Accessories',
  },
  {
    icon: '🏠',
    title: 'Home & Living',
    handle: 'home-living',
    description: 'Furniture & Décor',
  },
  {
    icon: '⚽',
    title: 'Sports & Outdoors',
    handle: 'sports-outdoors',
    description: 'Gear & Equipment',
  },
  {
    icon: '💄',
    title: 'Beauty & Personal Care',
    handle: 'beauty-personal-care',
    description: 'Skincare & Wellness',
  },
  {
    icon: '🍳',
    title: 'Kitchen & Dining',
    handle: 'kitchen-dining',
    description: 'Cookware & Appliances',
  },
];

function FeaturedCategories({
  collections,
}: {
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
  }>;
}) {
  return (
    <section className="bg-surface px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-dark sm:text-3xl">
            Shop by Category
          </h2>
          <p className="text-text-muted">Browse our most popular categories</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_ITEMS.map((category) => (
            <Link
              key={category.handle}
              to={`/collections/${category.handle}`}
              className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="mb-3 text-4xl">{category.icon}</span>
              <h3 className="text-sm font-semibold text-dark group-hover:text-primary">
                {category.title}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button as="link" to="/collections" variant="outline">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 3: Featured Products
// ============================================================================

function FeaturedProducts({products}: {products: Array<any>}) {
  if (products.length === 0) return null;

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-1 text-text-muted">
              Our best-selling products loved by customers
            </p>
          </div>
          <Button
            as="link"
            to="/collections/all"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showVendor
              showQuickAdd
              showDiscountPercentage
              showSecondaryImage
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button as="link" to="/collections/all" variant="outline">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 4: New Arrivals
// ============================================================================

function NewArrivals({products}: {products: Array<any>}) {
  if (products.length === 0) return null;

  return (
    <section className="bg-surface px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Icon name="package" size={28} className="text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-dark sm:text-3xl">
              New Arrivals
            </h2>
            <p className="mt-1 text-text-muted">
              Fresh products just added to our store
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showVendor
              customBadge="New"
              customBadgeColor="#059669"
              showDiscountPercentage
              showSecondaryImage
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 5: Why Choose Us
// ============================================================================

const FEATURES = [
  {
    icon: 'shield' as const,
    title: 'Verified Suppliers',
    description:
      'Every vendor is thoroughly vetted so you can shop with confidence.',
  },
  {
    icon: 'truck' as const,
    title: 'Fast Shipping',
    description:
      'Get your orders delivered quickly with our reliable shipping partners.',
  },
  {
    icon: 'star' as const,
    title: 'Quality Guaranteed',
    description:
      'Premium products backed by our satisfaction guarantee policy.',
  },
];

const VALUE_CARDS = [
  {
    icon: 'shield' as const,
    label: 'Trust',
    title: 'Verified Suppliers',
    color: 'green' as const,
  },
  {
    icon: 'truck' as const,
    label: 'Speed',
    title: 'Fast Shipping',
    color: 'teal' as const,
  },
  {
    icon: 'package' as const,
    label: 'Savings',
    title: 'Bulk Pricing',
    color: 'mint' as const,
  },
  {
    icon: 'star' as const,
    label: 'Quality',
    title: 'Quality Guaranteed',
    color: 'green' as const,
  },
];

const cardColorMap: Record<string, string> = {
  green: 'bg-primary/10 text-primary',
  teal: 'bg-secondary/10 text-secondary',
  mint: 'bg-accent/10 text-accent',
};

function WhyChooseUs() {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: text + feature list */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-dark sm:text-3xl">
              Why Shop With Us?
            </h2>
            <p className="mb-8 text-text-muted">
              We&apos;re committed to providing the best shopping experience
              with verified products, competitive prices, and exceptional
              customer service.
            </p>

            <ul className="space-y-6">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon
                      name={feature.icon}
                      size={20}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{feature.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: 2×2 value cards */}
          <div className="grid grid-cols-2 gap-4">
            {VALUE_CARDS.map((card) => (
              <div
                key={card.title}
                className={`flex flex-col items-center rounded-xl p-6 text-center ${cardColorMap[card.color] ?? 'bg-primary/10 text-primary'}`}
              >
                <Icon name={card.icon} size={32} className="mb-3" />
                <span className="mb-1 text-xs font-medium uppercase tracking-wider opacity-75">
                  {card.label}
                </span>
                <h3 className="text-sm font-semibold text-dark">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section 6: Newsletter
// ============================================================================

const PROMOTIONS = [
  {
    icon: '🎁',
    heading: '10% Off First Order',
    description: 'Sign up and get 10% off your first purchase',
    badge: 'Welcome Offer',
  },
  {
    icon: '🚚',
    heading: 'Free Shipping $50+',
    description: 'Free standard shipping on orders over $50',
    badge: 'Free Shipping',
  },
  {
    icon: '⚡',
    heading: 'Flash Sale — 30% Off',
    description: 'Limited-time discounts on select items',
    badge: 'Flash Deal',
  },
  {
    icon: '⭐',
    heading: 'VIP Rewards',
    description: 'Earn points with every purchase and unlock rewards',
    badge: 'Members Only',
  },
];

function Newsletter() {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextPromo = useCallback(() => {
    setCurrentPromo((prev) => (prev + 1) % PROMOTIONS.length);
  }, []);

  const prevPromo = useCallback(() => {
    setCurrentPromo(
      (prev) => (prev - 1 + PROMOTIONS.length) % PROMOTIONS.length,
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextPromo, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextPromo]);

  const promo = PROMOTIONS[currentPromo];

  return (
    <section className="relative overflow-hidden bg-linear-to-r from-[#0ea5e9] to-[#0284c7] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Promo carousel */}
        <div className="mb-10 text-center">
          <div className="relative mx-auto max-w-md">
            <button
              onClick={prevPromo}
              className="absolute top-1/2 -left-8 -translate-y-1/2 rounded-full p-1 text-white/70 hover:text-white sm:-left-12"
              aria-label="Previous promotion"
            >
              <Icon name="chevron-left" size={24} />
            </button>

            <div className="min-h-25">
              <span className="mb-2 text-4xl">{promo.icon}</span>
              <Badge variant="success" className="mb-2">
                {promo.badge}
              </Badge>
              <h3 className="text-xl font-bold text-white">{promo.heading}</h3>
              <p className="mt-1 text-sm text-white/80">{promo.description}</p>
            </div>

            <button
              onClick={nextPromo}
              className="absolute top-1/2 -right-8 -translate-y-1/2 rounded-full p-1 text-white/70 hover:text-white sm:-right-12"
              aria-label="Next promotion"
            >
              <Icon name="chevron-right" size={24} />
            </button>
          </div>

          {/* Dots + pause */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {PROMOTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPromo(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === currentPromo ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to promotion ${i + 1}`}
              />
            ))}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 text-white/60 hover:text-white"
              aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
            >
              <Icon name={isPaused ? 'refresh' : 'x-circle'} size={16} />
            </button>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
            Stay in the Loop
          </h2>
          <p className="mb-6 text-white/80">
            Subscribe for exclusive deals, new arrivals, and more.
          </p>

          <Form
            method="post"
            action="/contact#newsletter"
            className="mx-auto flex max-w-md gap-2"
          >
            <input type="hidden" name="form_type" value="customer" />
            <input type="hidden" name="contact[tags]" value="newsletter" />
            <input
              type="email"
              name="contact[email]"
              placeholder="Enter your email address"
              required
              className="flex-1 rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder:text-white/60 backdrop-blur focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="lg">
              Subscribe
            </Button>
          </Form>

          <p className="mt-3 text-xs text-white/60">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
