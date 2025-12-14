import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Package, Truck, Shield, CheckCircle, ChevronLeft, ChevronRight, ZoomIn, Play, Plus, Minus, X, MessageCircle, RotateCcw, CreditCard, Award, Clock, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigate?: (route: string) => void;
}

export function ProductDetails({ productId, onBack, onNavigateHome, onNavigate }: ProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data
  const product = {
    id: productId,
    name: 'Lorem Ipsum Dolor Sit Amet',
    tagline: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt',
    price: 89.99,
    originalPrice: 149.99,
    discount: 40,
    rating: 4.8,
    reviews: 1253,
    verified: 892,
    badges: ['Bestseller', 'Free Shipping', 'Eco-Friendly'],
    inStock: true,
    stockCount: 247,
    shipping: {
      method: 'Express',
      time: '2-4 business days',
      cost: 0,
      estimate: 'Dec 15-19'
    },
    images: [
      'https://placehold.co/800x800/a1a1aa/52525b?text=Product+Image+1',
      'https://placehold.co/800x800/a1a1aa/52525b?text=Product+Image+2',
      'https://placehold.co/800x800/a1a1aa/52525b?text=Product+Image+3'
    ],
    hasVideo: true,
    benefits: [
      'Lorem ipsum dolor sit amet',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor incididunt',
      'Ut labore et dolore magna aliqua'
    ],
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    specifications: {
      'Audio': {
        'Driver Size': '40mm',
        'Frequency Response': '20Hz - 20kHz',
        'Impedance': '32 Ohms',
        'Sensitivity': '105 dB'
      },
      'Connectivity': {
        'Bluetooth Version': '5.3',
        'Range': 'Up to 30 feet',
        'Codecs': 'SBC, AAC, LDAC'
      },
      'Battery': {
        'Battery Life': '30 hours (ANC on)',
        'Charging Time': '2 hours',
        'Quick Charge': '10 min = 5 hours'
      },
      'Physical': {
        'Weight': '250g',
        'Dimensions': '7.3 x 6.7 x 3.3 inches',
        'Foldable': 'Yes'
      }
    },
    warranty: '1-year manufacturer warranty',
    returnPolicy: '30-day return policy'
  };

  // Frequently bought together
  const frequentlyBought = [
    { id: 'addon1', name: 'Lorem Ipsum Accessory', price: 19.99, image: 'https://placehold.co/200x200/e2e8f0/64748b?text=Add-on' },
    { id: 'addon2', name: 'Dolor Sit Cable', price: 9.99, image: 'https://placehold.co/200x200/e2e8f0/64748b?text=Add-on' }
  ];

  // Similar items
  const similarItems = [
    { id: '20', name: 'Sed Do Eiusmod Tempor', price: 399.99, rating: 4.9, reviews: 2341, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Similar', badge: 'Top Rated' },
    { id: '21', name: 'Incididunt Ut Labore', price: 329.99, rating: 4.7, reviews: 1567, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Similar', badge: 'Premium' },
    { id: '22', name: 'Dolore Magna Aliqua', price: 379.99, rating: 4.8, reviews: 892, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Similar', badge: 'New' },
    { id: '23', name: 'Quis Nostrud Exercit', price: 179.99, rating: 4.5, reviews: 534, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Similar', badge: 'Value' }
  ];

  // Customer reviews
  const reviews = [
    { id: 1, author: 'User A.', rating: 5, date: 'Dec 8, 2024', verified: true, comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', helpful: 42 },
    { id: 2, author: 'User B.', rating: 4, date: 'Dec 5, 2024', verified: true, comment: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Nisi ut aliquip ex ea commodo consequat duis aute irure.', helpful: 28 },
    { id: 3, author: 'User C.', rating: 5, date: 'Nov 29, 2024', verified: true, comment: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum!', helpful: 35 }
  ];

  // Q&A
  const qanda = [
    { question: 'Lorem ipsum dolor sit amet consectetur?', answer: 'Adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.', helpful: 156 },
    { question: 'Ullamco laboris nisi ut aliquip ex ea?', answer: 'Commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', helpful: 89 },
    { question: 'Excepteur sint occaecat cupidatat non proident?', answer: 'Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.', helpful: 67 }
  ];

  // Recently viewed (mock data)
  const recentlyViewed = [
    { id: '24', name: 'Accusantium Doloremque', price: 199.99, image: 'https://placehold.co/200x200/e2e8f0/64748b?text=Recent' },
    { id: '25', name: 'Laudantium Totam Rem', price: 89.99, image: 'https://placehold.co/200x200/e2e8f0/64748b?text=Recent' }
  ];

  const totalBoughtTogether = product.price + frequentlyBought.reduce((sum, item) => sum + item.price, 0);
  const savedBoughtTogether = totalBoughtTogether * 0.1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header onNavigate={onNavigate} onNavigateHome={onNavigateHome} onBack={onBack} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-200 group">
              <div className="aspect-square">
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Controls */}
              <button 
                onClick={() => setShowImageZoom(true)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-slate-700" />
              </button>
              
              {product.hasVideo && (
                <button className="absolute top-4 left-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors flex items-center gap-2 text-sm cursor-pointer">
                  <Play className="w-4 h-4 text-slate-700" />
                  <span className="text-slate-700">Watch Video</span>
                </button>
              )}

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-[#2BD9A8]' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {product.badges.map((badge, index) => (
                <span key={badge} className={`px-2.5 py-1 text-xs rounded-full ${
                  index === 0 ? 'bg-[#2AC864]/10 text-[#2AC864] border border-[#2AC864]' :
                  index === 1 ? 'bg-[#2699A6]/10 text-[#2699A6] border border-[#2699A6]' :
                  'bg-[#2BD9A8]/10 text-[#2BD9A8] border border-[#2BD9A8]'
                }`}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl text-slate-900 mb-2">{product.name}</h1>
            <p className="text-lg text-slate-600 mb-4">{product.tagline}</p>

            {/* Reviews */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="text-slate-900">{product.rating}</span>
              </div>
              <button className="text-[#2699A6] hover:text-[#24B058] text-sm">
                {product.reviews.toLocaleString()} reviews
              </button>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-600">{product.verified} verified purchases</span>
            </div>

            {/* Key Benefits Bullets */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-600 mb-3">Key Benefits:</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-[#2AC864] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl text-slate-900">${product.price.toFixed(2)}</span>
                <span className="text-xl text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                  Save {product.discount}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600">Limited time offer - ends in 2 days</span>
              </div>
            </div>

            {/* Stock & Delivery */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-[#2AC864]" />
                <span className="text-[#2AC864]">In Stock ({product.stockCount} available)</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <Truck className="w-5 h-5 text-[#2699A6] mt-0.5" />
                <div>
                  <div className="text-slate-900 mb-1">{product.shipping.method} Shipping - FREE</div>
                  <div className="text-sm text-slate-600">Delivery: {product.shipping.estimate}</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-sm text-slate-600 mb-2 block">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x border-slate-200 focus:outline-none text-slate-900"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <span className="text-sm text-slate-600">Only {product.stockCount} left in stock</span>
              </div>
            </div>

            {/* Action Buttons - Sticky on Mobile */}
            <div className="space-y-3 mb-6 sticky bottom-0 bg-white py-4 -mx-6 px-6 lg:static lg:p-0 border-t lg:border-t-0 border-slate-200 lg:border-transparent">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#2AC864] text-[#2AC864] rounded-xl hover:bg-[#2AC864] hover:text-white transition-all shadow-sm hover:shadow-md text-lg">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={() => onNavigate?.('/checkout')}
                className="w-full px-6 py-4 border-2 border-[#2699A6] text-[#2699A6] rounded-xl hover:bg-[#2699A6] hover:text-white transition-all text-lg"
              >
                Buy Now
              </button>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <Heart className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">Save</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">Share</span>
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-lg">
                <RotateCcw className="w-5 h-5 text-slate-600 mb-2" />
                <span className="text-xs text-slate-700">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-slate-600 mb-2" />
                <span className="text-xs text-slate-700">1-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-slate-600 mb-2" />
                <span className="text-xs text-slate-700">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <section className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-slate-900 mb-4">Frequently Bought Together</h3>
          <div className="flex flex-wrap items-start gap-4 mb-6">
            {/* Main Product */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border border-slate-200">
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm text-slate-900 mt-2">${product.price}</div>
            </div>

            {/* Plus signs and add-ons */}
            {frequentlyBought.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <Plus className="w-5 h-5 text-slate-400" />
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border border-slate-200">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm text-slate-700 mt-2 line-clamp-2">{item.name}</div>
                  <div className="text-sm text-slate-900">${item.price}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600 mb-1">Total: <span className="line-through">${totalBoughtTogether.toFixed(2)}</span></div>
              <div className="text-2xl text-slate-900">Bundle Price: ${(totalBoughtTogether - savedBoughtTogether).toFixed(2)}</div>
              <div className="text-sm text-green-600">Save ${savedBoughtTogether.toFixed(2)} (10%)</div>
            </div>
            <button className="px-6 py-3 border-2 border-[#2AC864] text-[#2AC864] rounded-xl hover:bg-[#2AC864] hover:text-white transition-all">
              Add All to Cart
            </button>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="mb-12">
          <div className="border-b border-slate-200 mb-6">
            <div className="flex gap-1">
              {['description', 'specifications', 'reviews', 'qa'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-[#2AC864] border-b-2 border-[#2AC864]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'qa' ? 'Q&A' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed mb-6">{product.description}</p>
              <h4 className="text-slate-900 mb-4">What's in the Box:</h4>
              <ul className="space-y-2 text-slate-700">
                <li>Premium Wireless Headphones</li>
                <li>USB-C Charging Cable</li>
                <li>3.5mm Audio Cable</li>
                <li>Hard-Shell Carrying Case</li>
                <li>Quick Start Guide</li>
                <li>Warranty Card</li>
              </ul>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div>
              {Object.entries(product.specifications).map(([category, specs]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-slate-900 mb-3">{category}</h4>
                  <div className="grid md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-200 last:border-b-0">
                        <span className="text-slate-600">{key}</span>
                        <span className="text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {/* Review Summary */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl text-slate-900 mb-2">{product.rating}</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <div className="text-sm text-slate-600">{product.reviews} reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-slate-600 w-8">{stars} ★</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${stars === 5 ? 75 : stars === 4 ? 20 : 5}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-12">{stars === 5 ? '75%' : stars === 4 ? '20%' : '5%'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-900">{review.author}</span>
                          {review.verified && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-3">{review.comment}</p>
                    <button className="text-sm text-slate-600 hover:text-slate-900">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div>
              <button className="mb-6 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700">
                <MessageCircle className="w-5 h-5" />
                Ask a Question
              </button>
              <div className="space-y-6">
                {qanda.map((item, index) => (
                  <div key={index} className="pb-6 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-start gap-3 mb-3">
                      <HelpCircle className="w-5 h-5 text-[#2699A6] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-slate-900 mb-2">{item.question}</h4>
                        <p className="text-slate-700">{item.answer}</p>
                      </div>
                    </div>
                    <button className="text-sm text-slate-600 hover:text-slate-900 ml-8">
                      Helpful ({item.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Similar Items */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-900">Similar Items You May Like</h3>
            <button className="text-[#2699A6] hover:text-[#24B058] text-sm">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-[#2BD9A8] hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {item.badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#2699A6] text-white text-xs rounded-full">
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-slate-900 mb-2 group-hover:text-[#2AC864] transition-colors line-clamp-2">{item.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-slate-700">{item.rating}</span>
                    </div>
                    <span className="text-xs text-slate-500">({item.reviews})</span>
                  </div>
                  <div className="text-lg text-slate-900">${item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        <section className="mb-12 p-6 bg-slate-50 rounded-2xl">
          <h3 className="text-slate-900 mb-4">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.map((item) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-[#2BD9A8] cursor-pointer transition-all">
                <div className="aspect-square bg-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-slate-700 mb-1 line-clamp-2">{item.name}</div>
                  <div className="text-slate-900">${item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate || onNavigateHome} />
    </div>
  );
}