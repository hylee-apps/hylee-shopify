import { ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface CategoryPageProps {
  categoryId: string;
  onNavigate: (path: string) => void;
  onProductClick: (id: string) => void;
}

export function CategoryPage({ categoryId, onNavigate, onProductClick }: CategoryPageProps) {
  const [sortBy, setSortBy] = useState('relevance');
  const [quickViewProduct, setQuickViewProduct] = useState<number | null>(null);

  // Mock category data based on categoryId
  const categories: Record<string, any> = {
    electronics: {
      name: "Lorem Ipsum",
      hero: {
        title: "Lorem Ipsum Dolor Sit Amet",
        subtitle: "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        image: "https://placehold.co/1920x400/71717a/3f3f46?text=Category+Hero+Image"
      },
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      subcategories: [
        { id: "smartphones", name: "Dolor Sit", icon: "📱", count: 245 },
        { id: "laptops", name: "Amet Consectetur", icon: "💻", count: 189 },
        { id: "headphones", name: "Adipiscing Elit", icon: "🎧", count: 312 },
        { id: "cameras", name: "Sed Eiusmod", icon: "📷", count: 156 },
        { id: "wearables", name: "Tempor Incididunt", icon: "⌚", count: 98 },
        { id: "accessories", name: "Ut Labore", icon: "🔌", count: 421 }
      ],
      featuredCollections: [
        { id: "new-arrivals", name: "Lorem Ipsum", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "New" },
        { id: "seasonal", name: "Dolor Sit Amet", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Seasonal" },
        { id: "bestsellers", name: "Consectetur", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Popular" },
        { id: "deals", name: "Adipiscing Elit", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Sale" }
      ],
      featuredProducts: [
        { id: 1, name: "Lorem Ipsum Dolor Sit", price: "$89.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" },
        { id: 2, name: "Consectetur Adipiscing Elit", price: "$199.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New", shipping: "Free Shipping" },
        { id: 3, name: "Sed Do Eiusmod Tempor", price: "$299.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Hot", shipping: "Free Shipping" },
        { id: 4, name: "Incididunt Ut Labore", price: "$79.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular", shipping: "Free Shipping" },
        { id: 11, name: "Dolore Magna Aliqua", price: "$149.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Trending", shipping: "Free Shipping" },
        { id: 12, name: "Ut Enim Ad Minim", price: "$129.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New", shipping: "$5.99" },
        { id: 13, name: "Quis Nostrud Exercit", price: "$179.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular", shipping: "Free Shipping" },
        { id: 14, name: "Ullamco Laboris Nisi", price: "$99.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" }
      ]
    },
    'dolor-sit': {
      name: "Dolor Sit",
      hero: {
        title: "Dolore Magna Aliqua",
        subtitle: "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris",
        image: "https://placehold.co/1920x400/71717a/3f3f46?text=Category+Hero+Image"
      },
      description: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      subcategories: [
        { id: "mens", name: "Excepteur Sint", icon: "👔", count: 342 },
        { id: "womens", name: "Occaecat Cupidatat", icon: "👗", count: 489 },
        { id: "shoes", name: "Non Proident", icon: "👟", count: 267 },
        { id: "accessories", name: "Sunt In Culpa", icon: "👜", count: 198 },
        { id: "kids", name: "Qui Officia", icon: "👶", count: 156 },
        { id: "activewear", name: "Deserunt Mollit", icon: "🏃", count: 134 }
      ],
      featuredCollections: [
        { id: "spring", name: "Anim Id Est", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Seasonal" },
        { id: "trending", name: "Laborum Ipsum", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Trending" },
        { id: "clearance", name: "Excepteur Sint", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Sale" },
        { id: "premium", name: "Occaecat", image: "https://placehold.co/300x300/a1a1aa/52525b?text=Collection", badge: "Premium" }
      ],
      featuredProducts: [
        { id: 5, name: "Excepteur Sint Occaecat", price: "$129.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New Arrival", shipping: "Free Shipping" },
        { id: 6, name: "Cupidatat Non Proident", price: "$89.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" },
        { id: 7, name: "Sunt In Culpa Qui", price: "$159.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Trending", shipping: "$5.99" },
        { id: 8, name: "Officia Deserunt Mollit", price: "$24.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular", shipping: "Free Shipping" },
        { id: 15, name: "Anim Id Est Laborum", price: "$199.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "New", shipping: "Free Shipping" },
        { id: 16, name: "Voluptate Velit Esse", price: "$74.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Hot", shipping: "Free Shipping" },
        { id: 17, name: "Cillum Dolore Eu", price: "$119.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Trending", shipping: "$5.99" },
        { id: 18, name: "Fugiat Nulla Pariatur", price: "$89.99", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller", shipping: "Free Shipping" }
      ]
    }
  };

  const currentCategory = categories[categoryId] || categories.electronics;

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
            <span className="text-slate-900">{currentCategory.name}</span>
          </div>
        </div>
      </div>

      {/* Category Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40">
          <img 
            src={currentCategory.hero.image} 
            alt={currentCategory.name}
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl mb-4 tracking-tight text-white">{currentCategory.hero.title}</h1>
            <p className="text-xl text-white/90">{currentCategory.hero.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Category Description */}
      <section className="py-8 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-700 leading-relaxed">{currentCategory.description}</p>
        </div>
      </section>

      {/* Subcategory Navigation Grid */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-slate-900 mb-6">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {currentCategory.subcategories.map((subcat: any) => (
              <button
                key={subcat.id}
                onClick={() => onNavigate(`/category/${categoryId}/${subcat.id}`)}
                className="group text-center"
              >
                <div className="w-32 h-32 mx-auto mb-3 rounded-full bg-white border-2 border-slate-200 hover:border-[#2BD9A8] transition-all flex items-center justify-center shadow-sm hover:shadow-md">
                  <span className="text-5xl">{subcat.icon}</span>
                </div>
                <h4 className="text-sm text-slate-900 mb-1 group-hover:text-[#2699A6] transition-colors">{subcat.name}</h4>
                <p className="text-xs text-slate-500">{subcat.count} items</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections / Seasonal Picks */}
      <section className="py-12 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-slate-900 mb-6">New & Featured</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentCategory.featuredCollections.map((collection: any) => (
              <button
                key={collection.id}
                onClick={() => onNavigate(`/collection/${collection.id}`)}
                className="group relative"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-[#2BD9A8] transition-all shadow-sm hover:shadow-md">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h4 className="text-sm text-slate-900 group-hover:text-[#2699A6] transition-colors">{collection.name}</h4>
                  {collection.badge && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#E5F8ED] text-[#2AC864] rounded-full">{collection.badge}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sort Options and Featured Products */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-slate-900">Featured Products</h3>
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

          {/* Product Grid with Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentCategory.featuredProducts.map((product: any) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-[#2BD9A8] hover:shadow-xl transition-all cursor-pointer relative"
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
                          onProductClick(product.id.toString());
                        }}
                        className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Quick View
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h4 className="text-slate-900 mb-2 group-hover:text-[#2699A6] transition-colors">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900">{product.price}</span>
                    <span className="text-xs text-emerald-600">{product.shipping}</span>
                  </div>
                  
                  {/* Quick Add to Cart (appears on hover) */}
                  {quickViewProduct === product.id && (
                    <button className="mt-3 w-full px-4 py-2 border-2 border-[#2AC864] text-[#2AC864] rounded-lg hover:bg-[#2AC864] hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 bg-slate-50">
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
    </div>
  );
}