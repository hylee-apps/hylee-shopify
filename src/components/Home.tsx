import { Search, ChevronRight, TrendingUp, Clock, Star, Mail, Package, Shield, Truck, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HomeProps {
  onSearch: (query: string) => void;
  onNavigate: (path: string) => void;
}

export function Home({ onSearch, onNavigate }: HomeProps) {
  const [query, setQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [showPromoBar, setShowPromoBar] = useState(true);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56
  });

  // Hero carousel data
  const heroSlides = [
    {
      title: "Lorem Ipsum Dolor Sit Amet",
      subtitle: "Consectetur adipiscing elit sed do eiusmod tempor incididunt",
      cta: "Shop Now",
      bgColor: "from-blue-600 to-blue-700",
      image: "https://placehold.co/1920x600/a1a1aa/52525b?text=Hero+Image"
    },
    {
      title: "Ut Labore Et Dolore Magna",
      subtitle: "Quis nostrud exercitation ullamco laboris nisi ut aliquip",
      cta: "Explore Collection",
      bgColor: "from-slate-700 to-slate-800",
      image: "https://placehold.co/1920x600/a1a1aa/52525b?text=Hero+Image"
    },
    {
      title: "Excepteur Sint Occaecat",
      subtitle: "Cupidatat non proident sunt in culpa qui officia deserunt",
      cta: "Learn More",
      bgColor: "from-emerald-600 to-emerald-700",
      image: "https://placehold.co/1920x600/a1a1aa/52525b?text=Hero+Image"
    }
  ];

  // Featured categories
  const categories = [
    { id: 1, name: "Lorem Ipsum", icon: "📱", count: "2,450+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" },
    { id: 2, name: "Dolor Sit", icon: "👔", count: "3,200+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" },
    { id: 3, name: "Amet Consectetur", icon: "🏠", count: "1,800+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" },
    { id: 4, name: "Adipiscing Elit", icon: "⚽", count: "1,500+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" },
    { id: 5, name: "Sed Do Eiusmod", icon: "💄", count: "2,100+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" },
    { id: 6, name: "Tempor Incididunt", icon: "🍳", count: "980+", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Category" }
  ];

  // Best sellers / trending products
  const bestSellers = [
    { id: 1, name: "Lorem Ipsum Dolor Sit", price: "$89.99", sales: "1.2k sold", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Bestseller" },
    { id: 2, name: "Consectetur Adipiscing Elit", price: "$199.99", sales: "980 sold", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Trending" },
    { id: 3, name: "Sed Do Eiusmod Tempor", price: "$149.99", sales: "750 sold", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Popular" },
    { id: 4, name: "Incididunt Ut Labore", price: "$79.99", sales: "620 sold", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product", badge: "Trending" }
  ];

  // New arrivals
  const newArrivals = [
    { id: 5, name: "Dolore Magna Aliqua", price: "$45.99", isNew: true, image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 6, name: "Ut Enim Ad Minim", price: "$32.99", isNew: true, image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 7, name: "Quis Nostrud Exercit", price: "$24.99", isNew: true, image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 8, name: "Ullamco Laboris Nisi", price: "$129.99", isNew: true, image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" }
  ];

  // Flash deals
  const flashDeals = [
    { id: 9, name: "Aliquip Ex Ea Commodo", originalPrice: "$159.99", salePrice: "$79.99", discount: "50% OFF", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 10, name: "Duis Aute Irure Dolor", originalPrice: "$299.99", salePrice: "$179.99", discount: "40% OFF", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" }
  ];

  // Personalized recommendations
  const recommendations = [
    { id: 11, name: "Reprehenderit In Voluptate", price: "$34.99", tag: "For You", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 12, name: "Velit Esse Cillum", price: "$52.99", tag: "Popular", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 13, name: "Dolore Eu Fugiat Nulla", price: "$68.99", tag: "Trending", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" },
    { id: 14, name: "Pariatur Excepteur Sint", price: "$95.99", tag: "For You", image: "https://placehold.co/400x400/a1a1aa/52525b?text=Product" }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Thanks for signing up! Check your email for your 10% discount code.`);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Promo Bar */}
      {showPromoBar && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <Truck className="w-4 h-4" />
            <span>Free Shipping on Orders Over $50 | Use Code: FREESHIP</span>
          </div>
          <button 
            onClick={() => setShowPromoBar(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
            <div className="relative">
              <button 
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Categories
              </button>
              {showCategoriesDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCategoriesDropdown(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 w-64 py-2">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => {
                          setShowCategoriesDropdown(false);
                          onNavigate(`/category/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <div className="text-slate-900">{category.name}</div>
                          <div className="text-xs text-slate-500">{category.count} items</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors">
              About
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('/track-order')}
              className="px-4 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors"
            >
              Track Order
            </button>
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

      {/* Hero Carousel */}
      <div className="relative h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor}`}>
              <div className="absolute inset-0 opacity-20">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="text-white max-w-2xl">
                <h2 className="text-5xl mb-4 tracking-tight">{slide.title}</h2>
                <p className="text-xl mb-8 text-white/90">{slide.subtitle}</p>
                <button 
                  onClick={() => onNavigate('/products')}
                  className="px-8 py-3.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="py-12 px-6 bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center mb-6 text-slate-900">Find the perfect products for your business</h3>
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              <Search 
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" 
                size={20} 
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search thousands of products..."
                className="w-full pl-14 pr-6 py-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 border-2 border-[#2AC864] text-[#2AC864] rounded-lg hover:bg-[#2AC864] hover:text-white transition-all text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-slate-900 mb-2">Featured Categories</h3>
              <p className="text-slate-600">Explore our most popular product categories</p>
            </div>
            <button 
              onClick={() => onNavigate('/products')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate(`/category/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`)}
                className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all p-6 text-center cursor-pointer"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                  <img src={category.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="text-sm text-slate-900 mb-1">{category.name}</div>
                  <div className="text-xs text-slate-500">{category.count} items</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers / Trending */}
      <section className="py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-slate-900">Best Sellers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate(`/products/${product.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#2699A6] text-white text-xs rounded-full">
                    {product.badge}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <div className="text-slate-900">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals with Countdown */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-50 to-red-50 border-y border-orange-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-slate-900">Limited-Time Flash Deals</h3>
                <p className="text-slate-600">Hurry! Deals end soon</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-6 py-3 border border-orange-200 shadow-sm">
              <Clock className="w-5 h-5 text-orange-600" />
              <div className="flex items-center gap-1.5 text-slate-900">
                <div className="text-center">
                  <div className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-slate-500">Hours</div>
                </div>
                <span className="text-xl">:</span>
                <div className="text-center">
                  <div className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-slate-500">Min</div>
                </div>
                <span className="text-xl">:</span>
                <div className="text-center">
                  <div className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-slate-500">Sec</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flashDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => onNavigate(`/products/${deal.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer flex"
              >
                <div className="relative w-1/3 bg-slate-100">
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white text-xs rounded-full">
                    {deal.discount}
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <h4 className="text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">{deal.name}</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl text-red-600">{deal.salePrice}</span>
                    <span className="text-slate-400 line-through">{deal.originalPrice}</span>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                    Grab Deal Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Package className="w-6 h-6 text-emerald-600" />
            <h3 className="text-slate-900">New Arrivals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate(`/products/${product.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-full">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                  <div className="text-slate-900">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h3 className="text-slate-900 mb-2">Recommended For You</h3>
            <p className="text-slate-600">Based on your browsing history</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate(`/products/${product.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-purple-600 text-white text-xs rounded-full">
                    {product.tag}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <div className="text-slate-900">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Email Capture */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Mail className="w-12 h-12 mx-auto mb-4" />
          <h3 className="mb-3">Get 10% Off Your First Order</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Join our newsletter for exclusive deals, new product alerts, and business tips
          </p>
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Brand Story / About Section */}
      <section className="py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-slate-900 mb-4">Why Choose Hylee?</h3>
              <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                Hylee is your trusted B2B marketplace, connecting small businesses with verified suppliers worldwide. 
                We streamline wholesale purchasing with competitive prices, quality assurance, and seamless logistics.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-900 mb-1">Verified Suppliers</div>
                    <p className="text-sm text-slate-600">All suppliers are thoroughly vetted for quality and reliability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-900 mb-1">Fast Shipping</div>
                    <p className="text-sm text-slate-600">Quick delivery with tracking on all orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-900 mb-1">Quality Guarantee</div>
                    <p className="text-sm text-slate-600">30-day return policy on all products</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-[#2AC864] rounded-xl p-6 shadow-lg hover:bg-[#2AC864] hover:text-white transition-all group">
                <Shield className="w-8 h-8 mb-3 text-[#2AC864] group-hover:text-white transition-colors" />
                <div className="text-sm text-slate-600 group-hover:text-white/90 transition-colors">Verified</div>
                <div className="text-lg text-slate-900 group-hover:text-white transition-colors">Suppliers</div>
              </div>
              <div className="border-2 border-[#2699A6] rounded-xl p-6 shadow-lg hover:bg-[#2699A6] hover:text-white transition-all group">
                <Truck className="w-8 h-8 mb-3 text-[#2699A6] group-hover:text-white transition-colors" />
                <div className="text-sm text-slate-600 group-hover:text-white/90 transition-colors">Fast</div>
                <div className="text-lg text-slate-900 group-hover:text-white transition-colors">Shipping</div>
              </div>
              <div className="border-2 border-[#2BD9A8] rounded-xl p-6 shadow-lg hover:bg-[#2BD9A8] hover:text-white transition-all group">
                <Package className="w-8 h-8 mb-3 text-[#2BD9A8] group-hover:text-white transition-colors" />
                <div className="text-sm text-slate-600 group-hover:text-white/90 transition-colors">Bulk</div>
                <div className="text-lg text-slate-900 group-hover:text-white transition-colors">Pricing</div>
              </div>
              <div className="border-2 border-[#2AC864] rounded-xl p-6 shadow-lg hover:bg-[#2AC864] hover:text-white transition-all group">
                <Star className="w-8 h-8 mb-3 text-[#2AC864] group-hover:text-white transition-colors" />
                <div className="text-sm text-slate-600 group-hover:text-white/90 transition-colors">Quality</div>
                <div className="text-lg text-slate-900 group-hover:text-white transition-colors">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200/60 bg-white">
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