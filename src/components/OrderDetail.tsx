import { Package, Truck, CheckCircle, MapPin, Download, Mail, ExternalLink, ThumbsUp, ThumbsDown, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface OrderDetailProps {
  orderId: string;
  onNavigate: (route: Route) => void;
}

// Mock order tracking data
const mockOrderTracking = {
  orderNumber: 'HYL-2024-001234',
  orderDate: 'December 13, 2024',
  trackingNumber: 'TRK9876543210',
  carrier: 'UPS',
  carrierLogo: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=100',
  currentStatus: 'in-transit',
  estimatedDelivery: 'December 20, 2024',
  progressPercentage: 60,
  items: [
    {
      id: '1',
      name: 'Lorem Ipsum Product Name',
      description: 'Consectetur adipiscing elit variant',
      price: 129.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    {
      id: '2',
      name: 'Dolor Sit Amet Item',
      description: 'Sed do eiusmod tempor',
      price: 79.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    }
  ],
  shippingAddress: {
    name: 'Lorem Ipsum',
    street: '123 Lorem Ipsum Street, Apt 4B',
    city: 'Dolor City',
    state: 'CA',
    zip: '12345'
  },
  payment: {
    method: 'Credit Card',
    last4: '3456'
  },
  subtotal: 339.97,
  shipping: 9.99,
  tax: 27.20,
  total: 377.16,
  trackingUpdates: [
    {
      date: 'December 17, 2024',
      time: '2:45 PM',
      status: 'In Transit',
      location: 'Sacramento, CA',
      description: 'Package is in transit to destination'
    },
    {
      date: 'December 16, 2024',
      time: '10:30 AM',
      status: 'Departed Facility',
      location: 'San Francisco, CA',
      description: 'Departed from shipping facility'
    },
    {
      date: 'December 15, 2024',
      time: '8:15 AM',
      status: 'Arrived at Facility',
      location: 'San Francisco, CA',
      description: 'Arrived at shipping facility'
    },
    {
      date: 'December 14, 2024',
      time: '3:00 PM',
      status: 'Picked Up',
      location: 'Oakland, CA',
      description: 'Package picked up by carrier'
    },
    {
      date: 'December 13, 2024',
      time: '11:20 AM',
      status: 'Label Created',
      location: 'Oakland, CA',
      description: 'Shipping label created'
    }
  ]
};

const statusStages = [
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'in-transit', label: 'In Transit', icon: MapPin },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export function OrderDetail({ orderId, onNavigate }: OrderDetailProps) {
  const currentStageIndex = statusStages.findIndex(s => s.id === mockOrderTracking.currentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onNavigate('/')}
              className="text-2xl tracking-tight text-[#2AC864] hover:opacity-80 transition-opacity"
            >
              Hylee
            </button>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => onNavigate('/track-order')}>
                Track Another Order
              </Button>
              <Button variant="outline" onClick={() => onNavigate('/account')}>
                My Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Order Tracking</h1>
          <p className="text-gray-600">Order {mockOrderTracking.orderNumber} • Placed on {mockOrderTracking.orderDate}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl mb-1">Delivery Status</h2>
                  <p className="text-sm text-gray-600">Estimated delivery: {mockOrderTracking.estimatedDelivery}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Tracking #</p>
                  <p className="text-base">{mockOrderTracking.trackingNumber}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress value={mockOrderTracking.progressPercentage} className="h-2 mb-4" />
                <div className="flex items-center justify-between">
                  {statusStages.map((stage, index) => (
                    <div key={stage.id} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${
                          index <= currentStageIndex
                            ? 'bg-[#2AC864] border-[#2AC864] text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <stage.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm text-center ${index <= currentStageIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Status Card */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2AC864] mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base mb-1">
                      {mockOrderTracking.trackingUpdates[0].status}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {mockOrderTracking.trackingUpdates[0].description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mockOrderTracking.trackingUpdates[0].location} • {mockOrderTracking.trackingUpdates[0].date} at {mockOrderTracking.trackingUpdates[0].time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carrier Info */}
              <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipped via</p>
                    <p className="text-base">{mockOrderTracking.carrier}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Track on {mockOrderTracking.carrier}
                </Button>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Tracking History</h2>
              <div className="space-y-4">
                {mockOrderTracking.trackingUpdates.map((update, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#2AC864]' : 'bg-gray-300'}`} />
                      {index < mockOrderTracking.trackingUpdates.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-base">{update.status}</h4>
                        <span className="text-sm text-gray-500">{update.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{update.description}</p>
                      <p className="text-sm text-gray-500">{update.location} • {update.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Items in This Shipment</h2>
              <div className="space-y-4">
                {mockOrderTracking.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-base">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reorder Button */}
              <div className="mt-6">
                <Button variant="outline" className="w-full gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Reorder These Items
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${mockOrderTracking.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>${mockOrderTracking.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${mockOrderTracking.tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between mb-6">
                <span>Total</span>
                <span className="text-xl text-[#2AC864]">${mockOrderTracking.total.toFixed(2)}</span>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h4 className="text-base mb-2">Shipping To</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{mockOrderTracking.shippingAddress.name}</p>
                  <p>{mockOrderTracking.shippingAddress.street}</p>
                  <p>
                    {mockOrderTracking.shippingAddress.city}, {mockOrderTracking.shippingAddress.state} {mockOrderTracking.shippingAddress.zip}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="text-base mb-2">Payment</h4>
                <p className="text-sm text-gray-600">
                  {mockOrderTracking.payment.method} ending in {mockOrderTracking.payment.last4}
                </p>
              </div>

              <Separator className="my-4" />

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Email Receipt
                </Button>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base mb-3">Need Help?</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Report an Issue
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Delivery Feedback */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-base mb-2">Rate Your Delivery</h3>
              <p className="text-sm text-gray-600 mb-4">
                How was your delivery experience?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Good
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  Poor
                </Button>
              </div>
            </div>

            {/* Create Account CTA (for guest users) */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-base mb-2">Save Your Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create an account to easily track future orders and manage delivery preferences.
              </p>
              <Button onClick={() => onNavigate('/signup')} size="sm" className="w-full">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
