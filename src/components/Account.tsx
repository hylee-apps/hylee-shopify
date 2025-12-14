import { useState } from 'react';
import { 
  User, Package, MapPin, CreditCard, Heart, Mail, Gift, 
  RotateCcw, Settings, ChevronRight, Edit, Trash2, Plus,
  Shield, Bell, Eye, Download, Star, TrendingUp, Award
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AccountProps {
  onNavigate: (path: string) => void;
}

export function Account({ onNavigate }: AccountProps) {
  const [activeSection, setActiveSection] = useState('overview');

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    memberSince: 'January 2024',
    loyaltyPoints: 2450,
    totalOrders: 18,
    totalSpent: 4567.89
  };

  // Mock orders data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-03-15',
      status: 'Delivered',
      total: 299.99,
      items: 3,
      image: 'https://placehold.co/80x80/a1a1aa/52525b?text=Product'
    },
    {
      id: 'ORD-2024-002',
      date: '2024-03-10',
      status: 'In Transit',
      total: 159.99,
      items: 2,
      image: 'https://placehold.co/80x80/a1a1aa/52525b?text=Product'
    },
    {
      id: 'ORD-2024-003',
      date: '2024-03-05',
      status: 'Delivered',
      total: 89.99,
      items: 1,
      image: 'https://placehold.co/80x80/a1a1aa/52525b?text=Product'
    }
  ];

  // Mock saved addresses
  const addresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      street: '123 Lorem Ipsum Street',
      city: 'Dolor City',
      state: 'CA',
      zip: '90210',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      name: 'John Doe',
      street: '456 Consectetur Ave',
      city: 'Amet Town',
      state: 'NY',
      zip: '10001',
      isDefault: false
    }
  ];

  // Mock payment methods
  const paymentMethods = [
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'Mastercard',
      last4: '8888',
      expiry: '08/26',
      isDefault: false
    }
  ];

  // Mock wishlist items
  const wishlist = [
    {
      id: 1,
      name: 'Lorem Ipsum Dolor Sit',
      price: 129.99,
      inStock: true,
      image: 'https://placehold.co/200x200/a1a1aa/52525b?text=Product'
    },
    {
      id: 2,
      name: 'Consectetur Adipiscing',
      price: 89.99,
      inStock: true,
      image: 'https://placehold.co/200x200/a1a1aa/52525b?text=Product'
    },
    {
      id: 3,
      name: 'Sed Do Eiusmod Tempor',
      price: 199.99,
      inStock: false,
      image: 'https://placehold.co/200x200/a1a1aa/52525b?text=Product'
    }
  ];

  // Mock recommendations
  const recommendations = [
    {
      id: 1,
      name: 'Recommended Product One',
      price: 79.99,
      image: 'https://placehold.co/200x200/a1a1aa/52525b?text=Product',
      tag: 'Popular'
    },
    {
      id: 2,
      name: 'Recommended Product Two',
      price: 149.99,
      image: 'https://placehold.co/200x200/a1a1aa/52525b?text=Product',
      tag: 'Best Seller'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-[#2AC864] text-white';
      case 'in transit':
        return 'bg-[#2699A6] text-white';
      case 'processing':
        return 'bg-[#2BD9A8] text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            <button className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              Categories
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => onNavigate('/')}
              className="border-2 border-slate-300 text-slate-700 hover:border-slate-400"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2AC864] to-[#2699A6] rounded-full flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-900">{userData.name}</p>
                  <p className="text-sm text-slate-500">{userData.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'orders', label: 'Order History', icon: Package },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'loyalty', label: 'Loyalty Points', icon: Award },
                  { id: 'returns', label: 'Returns', icon: RotateCcw },
                  { id: 'preferences', label: 'Preferences', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeSection === item.id
                        ? 'bg-[#2AC864] text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl text-slate-900 mb-2">Welcome back, {userData.name.split(' ')[0]}!</h1>
                  <p className="text-slate-600">Member since {userData.memberSince}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Orders</span>
                      <Package className="w-5 h-5 text-[#2AC864]" />
                    </div>
                    <p className="text-3xl text-slate-900">{userData.totalOrders}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Spent</span>
                      <TrendingUp className="w-5 h-5 text-[#2699A6]" />
                    </div>
                    <p className="text-3xl text-slate-900">${userData.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Loyalty Points</span>
                      <Gift className="w-5 h-5 text-[#2BD9A8]" />
                    </div>
                    <p className="text-3xl text-slate-900">{userData.loyaltyPoints}</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl text-slate-900">Recent Orders</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveSection('orders')}
                      className="text-[#2AC864] hover:text-[#24b056]"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 2).map((order) => (
                      <div key={order.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg hover:border-[#2AC864] transition-colors">
                        <img 
                          src={order.image} 
                          alt="Order" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-slate-900">{order.id}</p>
                              <p className="text-sm text-slate-500">{order.date}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{order.items} items</span>
                            <span className="text-slate-900">${order.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-6">Recommended For You</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {recommendations.map((product) => (
                      <div 
                        key={product.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-[#2AC864] hover:shadow-md transition-all cursor-pointer"
                        onClick={() => onNavigate(`/products/${product.id}`)}
                      >
                        <div className="relative mb-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <Badge className="absolute top-2 right-2 bg-[#2AC864] text-white">
                            {product.tag}
                          </Badge>
                        </div>
                        <p className="text-slate-900 mb-2">{product.name}</p>
                        <p className="text-[#2AC864]">${product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Order History Section */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl text-slate-900">Order History</h1>
                  <Button 
                    variant="outline"
                    className="border-2 border-[#2AC864] text-[#2AC864] hover:bg-[#2AC864] hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Orders
                  </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    <TabsTrigger value="transit">In Transit</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-slate-900 mb-1">Order {order.id}</p>
                            <p className="text-sm text-slate-500">Placed on {order.date}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img 
                              src={order.image} 
                              alt="Order" 
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-sm text-slate-600">{order.items} items</p>
                              <p className="text-slate-900">${order.total}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => onNavigate(`/order/${order.id}`)}
                              className="border-slate-300"
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline"
                              className="border-[#2AC864] text-[#2AC864] hover:bg-[#2AC864] hover:text-white"
                            >
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl text-slate-900">Saved Addresses</h1>
                  <Button className="bg-[#2AC864] hover:bg-[#24b056] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div key={address.id} className="bg-white rounded-xl border border-slate-200 p-6 relative">
                      {address.isDefault && (
                        <Badge className="absolute top-4 right-4 bg-[#2AC864] text-white">
                          Default
                        </Badge>
                      )}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-[#2AC864]" />
                          <span className="text-slate-900">{address.type}</span>
                        </div>
                        <p className="text-slate-700">{address.name}</p>
                        <p className="text-sm text-slate-600">{address.street}</p>
                        <p className="text-sm text-slate-600">
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-slate-300">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Section */}
            {activeSection === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl text-slate-900">Payment Methods</h1>
                  <Button className="bg-[#2AC864] hover:bg-[#24b056] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-white rounded-xl border border-slate-200 p-6 relative">
                      {method.isDefault && (
                        <Badge className="absolute top-4 right-4 bg-[#2AC864] text-white">
                          Default
                        </Badge>
                      )}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-[#2AC864]" />
                          <span className="text-slate-900">{method.type}</span>
                        </div>
                        <p className="text-2xl text-slate-700 mb-1">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-slate-600">Expires {method.expiry}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-slate-300">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Section */}
            {activeSection === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl text-slate-900">My Wishlist</h1>
                  <p className="text-slate-600">{wishlist.length} items</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm px-3 py-1 bg-slate-900 rounded">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-slate-900 mb-2">{item.name}</p>
                        <p className="text-[#2AC864] mb-3">${item.price}</p>
                        <Button 
                          className="w-full bg-[#2AC864] hover:bg-[#24b056] text-white"
                          disabled={!item.inStock}
                        >
                          {item.inStock ? 'Add to Cart' : 'Notify Me'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loyalty Points Section */}
            {activeSection === 'loyalty' && (
              <div className="space-y-6">
                <h1 className="text-3xl text-slate-900">Loyalty Points</h1>

                <div className="bg-gradient-to-br from-[#2AC864] to-[#2699A6] rounded-xl p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-white/80 mb-2">Your Balance</p>
                      <p className="text-4xl">{userData.loyaltyPoints} Points</p>
                    </div>
                    <Award className="w-16 h-16 text-white/30" />
                  </div>
                  <p className="text-white/90">
                    You're {3000 - userData.loyaltyPoints} points away from your next reward!
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">How to Earn Points</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#2AC864]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-[#2AC864]" />
                      </div>
                      <div>
                        <p className="text-slate-900">Make a Purchase</p>
                        <p className="text-sm text-slate-600">Earn 1 point for every $1 spent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#2699A6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-[#2699A6]" />
                      </div>
                      <div>
                        <p className="text-slate-900">Write a Review</p>
                        <p className="text-sm text-slate-600">Get 50 points for each product review</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#2BD9A8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#2BD9A8]" />
                      </div>
                      <div>
                        <p className="text-slate-900">Refer a Friend</p>
                        <p className="text-sm text-slate-600">Earn 200 points for each successful referral</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Redeem Points</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-900 mb-1">$10 Off</p>
                      <p className="text-sm text-slate-600 mb-3">Requires 1,000 points</p>
                      <Button 
                        className="w-full bg-[#2AC864] hover:bg-[#24b056] text-white"
                        disabled={userData.loyaltyPoints < 1000}
                      >
                        Redeem
                      </Button>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-900 mb-1">$25 Off</p>
                      <p className="text-sm text-slate-600 mb-3">Requires 2,500 points</p>
                      <Button 
                        className="w-full bg-[#2AC864] hover:bg-[#24b056] text-white"
                        disabled={userData.loyaltyPoints < 2500}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Returns Section */}
            {activeSection === 'returns' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl text-slate-900">Returns & Refunds</h1>
                  <Button className="bg-[#2AC864] hover:bg-[#24b056] text-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Return
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Return Policy</h2>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>• Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                    <p>• Sed do eiusmod tempor incididunt ut labore et dolore</p>
                    <p>• Ut enim ad minim veniam, quis nostrud exercitation</p>
                    <p>• Duis aute irure dolor in reprehenderit in voluptate</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Recent Returns</h2>
                  <p className="text-slate-500 text-center py-8">No returns to display</p>
                </div>
              </div>
            )}

            {/* Email Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h1 className="text-3xl text-slate-900">Email Preferences</h1>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Notification Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Order Updates', description: 'Receive notifications about your order status' },
                      { label: 'Promotional Emails', description: 'Get updates about sales and special offers' },
                      { label: 'Product Recommendations', description: 'Personalized product suggestions based on your preferences' },
                      { label: 'Newsletter', description: 'Monthly newsletter with industry insights' },
                      { label: 'Price Drop Alerts', description: 'Get notified when items in your wishlist go on sale' }
                    ].map((pref, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-slate-900">{pref.label}</p>
                          <p className="text-sm text-slate-600">{pref.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2AC864]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h1 className="text-3xl text-slate-900">Security Settings</h1>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Change Password</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">Current Password</label>
                      <Input type="password" placeholder="••••••••" className="h-11" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">New Password</label>
                      <Input type="password" placeholder="••••••••" className="h-11" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">Confirm New Password</label>
                      <Input type="password" placeholder="••••••••" className="h-11" />
                    </div>
                    <Button className="bg-[#2AC864] hover:bg-[#24b056] text-white">
                      Update Password
                    </Button>
                  </form>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button 
                    variant="outline"
                    className="border-2 border-[#2AC864] text-[#2AC864] hover:bg-[#2AC864] hover:text-white"
                  >
                    Enable 2FA
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl text-slate-900 mb-4">Active Sessions</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-slate-900">Chrome on MacOS</p>
                        <p className="text-sm text-slate-600">Current session • San Francisco, CA</p>
                      </div>
                      <Badge className="bg-[#2AC864] text-white">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-red-100 p-6">
                  <h2 className="text-xl text-red-600 mb-2">Delete Account</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              © 2024 Hylee. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</button>
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</button>
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Contact Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}