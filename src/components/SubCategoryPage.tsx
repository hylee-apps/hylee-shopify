import { ChevronRight, Star, Eye, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface SubCategoryPageProps {
  categoryId: string;
  subCategoryId: string;
  onNavigate: (path: string) => void;
  onProductClick: (id: string) => void;
}

export function SubCategoryPage({ categoryId, subCategoryId, onNavigate, onProductClick }: SubCategoryPageProps) {
  const [sortBy, setSortBy] = useState('relevance');
  const [quickViewProduct, setQuickViewProduct] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewData, setQuickViewData] = useState<any>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);

  // Mock subcategory data
  const subcategoryData: Record<string, any> = {
    smartphones: {
      categoryName: "Electronics",
      name: "Smartphones",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      seoContent: {
        title: "Ut Enim Ad Minim Veniam",
        content: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
      },
      filters: {
        brands: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Motorola"],
        colors: ["Black", "White", "Blue", "Red", "Green", "Purple"],
        priceRanges: ["Under $300", "$300-$500", "$500-$800", "Over $800"],
        storage: ["64GB", "128GB", "256GB", "512GB", "1TB"]
      },
      products: [
        { id: 1, name: "Lorem Ipsum Dolor", brand: "Apple", price: "$999.99", rating: 4.9, reviews: 1245, color: "Black", storage: "256GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" },
        { id: 2, name: "Consectetur Adipiscing", brand: "Samsung", price: "$1199.99", rating: 4.8, reviews: 892, color: "Purple", storage: "512GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New", shipping: "Free Shipping" },
        { id: 3, name: "Sed Do Eiusmod", brand: "Google", price: "$899.99", rating: 4.7, reviews: 567, color: "Blue", storage: "128GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Hot Deal", shipping: "Free Shipping" },
        { id: 4, name: "Tempor Incididunt", brand: "OnePlus", price: "$699.99", rating: 4.6, reviews: 423, color: "Green", storage: "256GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular", shipping: "Free Shipping" },
        { id: 5, name: "Ut Labore Dolore", brand: "Xiaomi", price: "$599.99", rating: 4.5, reviews: 312, color: "White", storage: "128GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Value", shipping: "$4.99" },
        { id: 6, name: "Magna Aliqua Ut", brand: "Motorola", price: "$499.99", rating: 4.4, reviews: 198, color: "Black", storage: "256GB", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Budget Pick", shipping: "Free Shipping" }
      ]
    },
    headphones: {
      categoryName: "Electronics",
      name: "Headphones & Audio",
      description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      seoContent: {
        title: "Sed Ut Perspiciatis Unde",
        content: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas."
      },
      filters: {
        brands: ["Sony", "Bose", "Apple", "Samsung", "JBL", "Beats"],
        colors: ["Black", "White", "Silver", "Blue", "Red"],
        types: ["Over-Ear", "On-Ear", "In-Ear", "True Wireless"],
        features: ["Noise Cancelling", "Water Resistant", "Wireless", "Microphone"]
      },
      products: [
        { id: 7, name: "Sit Aspernatur Aut", brand: "Apple", price: "$249.99", rating: 4.8, reviews: 2341, type: "True Wireless", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" },
        { id: 8, name: "Odit Aut Fugit Sed", brand: "Sony", price: "$399.99", rating: 4.9, reviews: 1567, type: "Over-Ear", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Top Rated", shipping: "Free Shipping" },
        { id: 9, name: "Quia Consequuntur Magni", brand: "Bose", price: "$329.99", rating: 4.7, reviews: 987, type: "Over-Ear", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Premium", shipping: "Free Shipping" },
        { id: 10, name: "Dolores Eos Qui Ratione", brand: "Samsung", price: "$229.99", rating: 4.6, reviews: 756, type: "True Wireless", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New", shipping: "Free Shipping" },
        { id: 11, name: "Voluptatem Sequi Nesciunt", brand: "JBL", price: "$179.99", rating: 4.5, reviews: 534, type: "Over-Ear", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Value", shipping: "Free Shipping" },
        { id: 12, name: "Neque Porro Quisquam", brand: "Beats", price: "$149.99", rating: 4.4, reviews: 891, type: "True Wireless", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular", shipping: "Free Shipping" }
      ]
    }
  };

  const currentSubcategory = subcategoryData[subCategoryId] || subcategoryData.smartphones;

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinRating(0);
    setPriceRange([0, 500]);
    setFreeShipping(false);
  };

  const activeFiltersCount = selectedBrands.length + selectedColors.length + selectedSizes.length + 
    (minRating > 0 ? 1 : 0) + (freeShipping ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <img src="https://placehold.co/28x28/71717a/ffffff?text=L" alt="Hylee Logo" className="w-7 h-7 rounded-lg" />
            <span className="text-xl tracking-tight text-slate-900">Hylee</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('/products')}
              className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Products
            </button>
            <button className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              Categories
            </button>
            <button className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              About
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('/signin')}
              className="px-4 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('/signup')}
              className="px-4 py-1.5 text-sm border-2 border-[#2AC864] text-[#2AC864] rounded-lg hover:bg-[#2AC864] hover:text-white transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => onNavigate('/')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button 
              onClick={() => onNavigate(`/category/${categoryId}`)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {currentSubcategory.categoryName}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900">{currentSubcategory.name}</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="px-6 py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl text-slate-900 mb-3">{currentSubcategory.name}</h1>
          <p className="text-slate-600 max-w-3xl">{currentSubcategory.description}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-sm text-[#2AC864] hover:text-[#24B058]"
                    >
                      Clear All ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h4 className="text-sm text-slate-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
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
                    {currentSubcategory.filters.brands.map((brand: string) => (
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

                {/* Color Filter */}
                {currentSubcategory.filters.colors && (
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <h4 className="text-sm text-slate-900 mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSubcategory.filters.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                            selectedColors.includes(color)
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Shipping Filter */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freeShipping}
                      onChange={(e) => setFreeShipping(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Free Shipping Only</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
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
                  {currentSubcategory.products.length} Products
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm text-slate-600">Active filters:</span>
                {selectedBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#2BD9A8]/10 text-[#2699A6] rounded-full text-sm hover:bg-[#2BD9A8]/20 transition-colors border border-[#2BD9A8]"
                  >
                    {brand}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedColors.map(color => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#2BD9A8]/10 text-[#2699A6] rounded-full text-sm hover:bg-[#2BD9A8]/20 transition-colors border border-[#2BD9A8]"
                  >
                    {color}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentSubcategory.products.map((product: any) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-[#2BD9A8] hover:shadow-xl transition-all cursor-pointer"
                  onMouseEnter={() => setQuickViewProduct(product.id)}
                  onMouseLeave={() => setQuickViewProduct(null)}
                >
                  <div 
                    className="relative h-64 overflow-hidden bg-slate-100"
                    onClick={() => onProductClick(product.id.toString())}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#2699A6] text-white text-xs rounded-full">
                        {product.badge}
                      </div>
                    )}
                    
                    {/* Quick View Overlay */}
                    {quickViewProduct === product.id && (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewData(product);
                            setShowQuickView(true);
                          }}
                          className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Quick View
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="text-xs text-slate-500 mb-1">{product.brand}</div>
                    <h4 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-slate-700">{product.rating}</span>
                      </div>
                      <span className="text-xs text-slate-500">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg text-slate-900">{product.price}</span>
                      <span className="text-xs text-emerald-600">{product.shipping}</span>
                    </div>
                    
                    {/* Quick Add to Cart (appears on hover) */}
                    {quickViewProduct === product.id && (
                      <button className="w-full px-4 py-2 border-2 border-[#2AC864] text-[#2AC864] rounded-lg hover:bg-[#2AC864] hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SEO-Rich Copy Block */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <h3 className="text-slate-900 mb-4">{currentSubcategory.seoContent.title}</h3>
              <p className="text-slate-700 leading-relaxed">{currentSubcategory.seoContent.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 bg-slate-50 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://placehold.co/28x28/71717a/ffffff?text=L" alt="Hylee Logo" className="w-7 h-7 rounded-lg" />
                <span className="text-xl tracking-tight text-slate-900">Hylee</span>
              </div>
              <p className="text-sm text-slate-600">
                Premium wholesale marketplace for small businesses worldwide
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 mb-3">Products</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button className="hover:text-slate-900">Electronics</button></li>
                <li><button className="hover:text-slate-900">Fashion</button></li>
                <li><button className="hover:text-slate-900">Home & Living</button></li>
                <li><button className="hover:text-slate-900">All Categories</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button className="hover:text-slate-900">About Us</button></li>
                <li><button className="hover:text-slate-900">Contact</button></li>
                <li><button className="hover:text-slate-900">Careers</button></li>
                <li><button className="hover:text-slate-900">Blog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button className="hover:text-slate-900">Help Center</button></li>
                <li><button className="hover:text-slate-900">Shipping Info</button></li>
                <li><button className="hover:text-slate-900">Returns</button></li>
                <li><button className="hover:text-slate-900">Terms & Conditions</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
            <p>© 2025 Hylee. Connecting small businesses with verified suppliers worldwide.</p>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      {showQuickView && quickViewData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowQuickView(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-slate-900">Quick View</h3>
              <button onClick={() => setShowQuickView(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
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
                  {quickViewData.badge && (
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#2699A6] text-white">
                      {quickViewData.badge}
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                  <div className="text-sm text-slate-500 mb-2">{quickViewData.brand}</div>
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
                    <span className="text-sm text-slate-500">({quickViewData.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl text-slate-900 mb-2">{quickViewData.price}</div>
                    <div className="text-sm text-emerald-600">{quickViewData.shipping}</div>
                  </div>

                  {/* Additional Info */}
                  {quickViewData.color && (
                    <div className="mb-4">
                      <div className="text-sm text-slate-600 mb-1">Color</div>
                      <div className="text-slate-900">{quickViewData.color}</div>
                    </div>
                  )}
                  
                  {quickViewData.storage && (
                    <div className="mb-6">
                      <div className="text-sm text-slate-600 mb-1">Storage</div>
                      <div className="text-slate-900">{quickViewData.storage}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#2AC864] text-white rounded-xl hover:bg-[#24b056] transition-all cursor-pointer">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickView(false);
                        onProductClick(quickViewData.id.toString());
                      }}
                      className="w-full px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
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
    </div>
  );
}