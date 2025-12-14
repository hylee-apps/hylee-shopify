import { Search, SlidersHorizontal, Grid3x3, List, Star, Truck, ShoppingCart, ChevronDown, X, TrendingUp, DollarSign, Package, Award, ThumbsUp, Eye, Plus, Check, ArrowUpDown, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';

interface ProductsProps {
  searchQuery: string;
  onNavigateHome: () => void;
  onProductClick: (productId: string) => void;
  onNavigate?: (path: string) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  bulkPrice: number;
  minOrder: number;
  supplier: string;
  rating: number;
  reviews: number;
  sold: number;
  category: string;
  stock: number;
  badges: string[];
  image: string;
  features?: string[];
}

export function Products({ searchQuery, onNavigateHome, onProductClick, onNavigate }: ProductsProps) {
  const [query, setQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewData, setQuickViewData] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name: 'All Categories', count: 342 },
    { id: 'electronics', name: 'Electronics', count: 145 },
    { id: 'audio', name: 'Audio & Headphones', count: 98 },
    { id: 'wearables', name: 'Wearables', count: 56 },
    { id: 'accessories', name: 'Accessories', count: 43 },
  ];

  const brands = ['TechDirect', 'GadgetHub', 'AccessoryPro', 'AudioMax', 'MediaPro'];

  const products: Product[] = [
    {
      id: '1',
      name: 'Lorem Ipsum Dolor Sit Amet Consectetur',
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      bulkPrice: 45.00,
      minOrder: 10,
      supplier: 'TechDirect',
      rating: 4.8,
      reviews: 1253,
      sold: 5420,
      category: 'audio',
      stock: 247,
      badges: ['Bestseller', 'Free Shipping'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Lorem ipsum dolor sit', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor']
    },
    {
      id: '2',
      name: 'Adipiscing Elit Sed Do Eiusmod Tempor',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      bulkPrice: 120.00,
      minOrder: 5,
      supplier: 'GadgetHub',
      rating: 4.9,
      reviews: 2104,
      sold: 8932,
      category: 'wearables',
      stock: 156,
      badges: ['Top Rated', 'Eco-Friendly'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Incididunt ut labore', 'Dolore magna aliqua', 'Ut enim ad minim']
    },
    {
      id: '3',
      name: 'Incididunt Ut Labore Et Dolore Magna',
      price: 24.99,
      bulkPrice: 8.00,
      minOrder: 25,
      supplier: 'AccessoryPro',
      rating: 4.6,
      reviews: 892,
      sold: 15432,
      category: 'accessories',
      stock: 523,
      badges: ['Staff Pick'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Quis nostrud exercitation', 'Ullamco laboris nisi', 'Aliquip ex ea commodo']
    },
    {
      id: '4',
      name: 'Quis Nostrud Exercitation Ullamco',
      price: 34.99,
      bulkPrice: 18.00,
      minOrder: 15,
      supplier: 'TechDirect',
      rating: 4.7,
      reviews: 654,
      sold: 3221,
      category: 'electronics',
      stock: 89,
      badges: ['Free Shipping'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Duis aute irure dolor', 'Reprehenderit in voluptate', 'Velit esse cillum']
    },
    {
      id: '5',
      name: 'Excepteur Sint Occaecat Cupidatat Non',
      price: 19.99,
      originalPrice: 29.99,
      discount: 33,
      bulkPrice: 6.00,
      minOrder: 50,
      supplier: 'AccessoryPro',
      rating: 4.5,
      reviews: 1876,
      sold: 22145,
      category: 'accessories',
      stock: 1024,
      badges: ['20% Off Today', 'Free Shipping'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Proident sunt in culpa', 'Officia deserunt mollit', 'Laborum et dolorum']
    },
    {
      id: '6',
      name: 'Sed Ut Perspiciatis Unde Omnis Iste',
      price: 49.99,
      bulkPrice: 25.00,
      minOrder: 10,
      supplier: 'AudioMax',
      rating: 4.8,
      reviews: 743,
      sold: 4532,
      category: 'audio',
      stock: 234,
      badges: ['Bestseller', 'Eco-Friendly'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Natus error sit voluptatem', 'Accusantium doloremque', 'Laudantium totam rem']
    },
    {
      id: '7',
      name: 'Nemo Enim Ipsam Voluptatem Quia',
      price: 15.99,
      bulkPrice: 5.00,
      minOrder: 30,
      supplier: 'GadgetHub',
      rating: 4.6,
      reviews: 521,
      sold: 7234,
      category: 'accessories',
      stock: 412,
      badges: ['Staff Pick'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Voluptas sit aspernatur', 'Aut odit aut fugit', 'Consequuntur magni']
    },
    {
      id: '8',
      name: 'Neque Porro Quisquam Est Qui Dolorem',
      price: 29.99,
      originalPrice: 49.99,
      discount: 40,
      bulkPrice: 15.00,
      minOrder: 20,
      supplier: 'TechDirect',
      rating: 4.7,
      reviews: 1102,
      sold: 5678,
      category: 'electronics',
      stock: 178,
      badges: ['40% Off', 'Free Shipping'],
      image: 'https://placehold.co/600x600/e2e8f0/64748b?text=Product+Image',
      features: ['Ipsum quia dolor sit', 'Amet consectetur adipisci', 'Velit sed quia non']
    },
  ];

  // Filtering logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.supplier);
    const matchesRating = product.rating >= minRating;
    const matchesStock = !inStock || product.stock > 0;
    const matchesFreeShipping = !freeShipping || product.badges.includes('Free Shipping');
    
    return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesStock && matchesFreeShipping;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'popular') return b.sold - a.sold;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return parseInt(b.id) - parseInt(a.id);
    return 0; // relevance
  });

  // Pagination / Infinite scroll
  const itemsPerPage = 6;
  const displayedProducts = sortedProducts.slice(0, page * itemsPerPage);
  const hasMore = displayedProducts.length < sortedProducts.length;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setPage(prev => prev + 1);
            setLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 3) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setSelectedBrands([]);
    setMinRating(0);
    setInStock(false);
    setFreeShipping(false);
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (inStock ? 1 : 0) +
    (freeShipping ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header onNavigate={onNavigate || onNavigateHome} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-slate-700" />
                    <h3 className="text-slate-900">Filters</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h4 className="text-sm text-slate-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-slate-300"
                        />
                        <span className="text-sm text-slate-700 flex-1 group-hover:text-slate-900">
                          {category.name}
                        </span>
                        <span className="text-xs text-slate-500">({category.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h4 className="text-sm text-slate-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h4 className="text-sm text-slate-900 mb-3">Brand</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h4 className="text-sm text-slate-900 mb-3">Customer Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-700">{rating}+ Stars</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freeShipping}
                      onChange={(e) => setFreeShipping(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Free Shipping</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm">{showFilters ? 'Hide' : 'Show'} Filters</span>
                </button>
                <span className="text-sm text-slate-600">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all appearance-none bg-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Compare Bar */}
            {compareList.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-blue-900">{compareList.length} product{compareList.length > 1 ? 's' : ''} selected</span>
                  {compareList.map(id => {
                    const product = products.find(p => p.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-blue-200">
                        <span className="text-sm text-slate-700">{product?.name.substring(0, 20)}...</span>
                        <button onClick={() => toggleCompare(id)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCompare(true)}
                    disabled={compareList.length < 2}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Compare ({compareList.length})
                  </button>
                  <button
                    onClick={() => setCompareList([])}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 ${
                    compareList.includes(product.id) 
                      ? 'border-blue-600' 
                      : 'border-transparent'
                  } cursor-pointer`}
                  onClick={() => onProductClick(product.id)}
                  onMouseEnter={() => setQuickViewProduct(product.id)}
                  onMouseLeave={() => setQuickViewProduct(null)}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden bg-slate-100 cursor-pointer ${
                      viewMode === 'grid' ? 'h-64' : 'w-48 h-48 flex-shrink-0'
                    }`}
                    onClick={() => onProductClick(product.id)}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`px-2.5 py-1 text-xs rounded-full ${
                            badge.includes('Off') || badge.includes('%')
                              ? 'bg-red-600 text-white'
                              : badge === 'Bestseller'
                              ? 'bg-blue-600 text-white'
                              : badge === 'Eco-Friendly'
                              ? 'bg-green-600 text-white'
                              : badge === 'Staff Pick'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Compare Checkbox */}
                    <div className="absolute top-3 right-3">
                      <label className="flex items-center gap-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={compareList.includes(product.id)}
                          onChange={() => toggleCompare(product.id)}
                          disabled={!compareList.includes(product.id) && compareList.length >= 3}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-700">Compare</span>
                      </label>
                    </div>

                    {/* Quick View Overlay */}
                    {quickViewProduct === product.id && (
                      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewData(product);
                            setShowQuickView(true);
                          }}
                          className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Quick View
                        </button>
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                    <div>
                      <h4
                        className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                        onClick={() => onProductClick(product.id)}
                      >
                        {product.name}
                      </h4>
                      
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-700">{product.rating}</span>
                        <span className="text-sm text-slate-500">({product.reviews.toLocaleString()})</span>
                      </div>

                      {/* Quick View Info (appears on hover) */}
                      {quickViewProduct === product.id && product.features && (
                        <ul className="mb-3 space-y-1">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price & Discount */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl text-slate-900">${product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <>
                              <span className="text-sm text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                              <span className="text-sm text-red-600">Save {product.discount}%</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">Bulk: ${product.bulkPrice.toFixed(2)}/unit</div>
                      </div>

                      {/* Stock Info */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        {product.stock > 0 ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-green-700">In Stock ({product.stock})</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-red-700">Out of Stock</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Min: {product.minOrder} units</span>
                      <span className="text-blue-600">{product.supplier}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Observer */}
            {hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Loading more products...</span>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompare && compareList.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-slate-900">Compare Products</h3>
              <button onClick={() => setShowCompare(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {compareList.map(id => {
                  const product = products.find(p => p.id === id);
                  if (!product) return null;
                  return (
                    <div key={id} className="border border-slate-200 rounded-xl p-4">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <h4 className="text-slate-900 mb-2">{product.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Price</span>
                          <span className="text-slate-900">${product.price}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Rating</span>
                          <span className="text-slate-900">{product.rating} ⭐</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Reviews</span>
                          <span className="text-slate-900">{product.reviews}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Min Order</span>
                          <span className="text-slate-900">{product.minOrder}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-600">Supplier</span>
                          <span className="text-slate-900">{product.supplier}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onProductClick(product.id)}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowQuickView(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-slate-900">Quick View</h3>
              <button onClick={() => setShowQuickView(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4">
                    <img src={quickViewData.image} alt={quickViewData.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {quickViewData.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`px-3 py-1 text-xs rounded-full ${
                          badge.includes('Off') || badge.includes('%')
                            ? 'bg-red-600 text-white'
                            : badge === 'Bestseller'
                            ? 'bg-blue-600 text-white'
                            : badge === 'Eco-Friendly'
                            ? 'bg-green-600 text-white'
                            : badge === 'Staff Pick'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                  <h2 className="text-2xl text-slate-900 mb-3">{quickViewData.name}</h2>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(quickViewData.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-900">{quickViewData.rating}</span>
                    <span className="text-sm text-slate-500">({quickViewData.reviews.toLocaleString()} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl text-slate-900">${quickViewData.price.toFixed(2)}</span>
                      {quickViewData.originalPrice && (
                        <>
                          <span className="text-lg text-slate-400 line-through">${quickViewData.originalPrice.toFixed(2)}</span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                            Save {quickViewData.discount}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      Bulk pricing: ${quickViewData.bulkPrice.toFixed(2)}/unit • Min order: {quickViewData.minOrder} units
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="mb-6 flex items-center gap-2">
                    {quickViewData.stock > 0 ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-700">In Stock ({quickViewData.stock} available)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-red-700">Out of Stock</span>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  {quickViewData.features && quickViewData.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm text-slate-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {quickViewData.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Supplier Info */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">Supplier</div>
                    <div className="text-slate-900">{quickViewData.supplier}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickView(false);
                        onProductClick(quickViewData.id);
                      }}
                      className="w-full px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer onNavigate={onNavigate || onNavigateHome} />
    </div>
  );
}