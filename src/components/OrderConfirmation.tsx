import { CheckCircle, Truck, Mail, Package, Download, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface OrderConfirmationProps {
  onNavigate: (route: Route) => void;
}

// Mock order data
const mockOrder = {
  orderNumber: 'HYL-2024-001234',
  orderDate: 'December 13, 2024',
  estimatedDelivery: 'December 20, 2024',
  trackingNumber: 'TRK9876543210',
  email: 'customer@example.com',
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
  total: 377.16
};

export function OrderConfirmation({ onNavigate }: OrderConfirmationProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => onNavigate('/')}
            className="text-2xl tracking-tight text-[#2AC864] hover:opacity-80 transition-opacity"
          >
            Hylee
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-[#2AC864]" />
          </div>
          <h1 className="text-3xl mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've sent a confirmation email to <span className="text-[#2AC864]">{mockOrder.email}</span>
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-2xl text-[#2AC864]">{mockOrder.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="text-base">{mockOrder.orderDate}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Delivery Information */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 mb-4 border border-green-200">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#2AC864] mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base mb-1">Estimated Delivery</h3>
                <p className="text-xl text-[#2AC864] mb-2">{mockOrder.estimatedDelivery}</p>
                <p className="text-sm text-gray-600">
                  Your order is being processed and will ship soon. You'll receive a shipping confirmation email with tracking details.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="default" 
              onClick={() => onNavigate(`/orders/${mockOrder.orderNumber}` as Route)}
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Track My Order
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Resend Confirmation
            </Button>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl mb-4">Order Details</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {mockOrder.items.map((item) => (
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

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${mockOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>${mockOrder.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${mockOrder.tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between">
              <span>Total</span>
              <span className="text-xl text-[#2AC864]">${mockOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base mb-3">Shipping Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{mockOrder.shippingAddress.name}</p>
              <p>{mockOrder.shippingAddress.street}</p>
              <p>
                {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.state} {mockOrder.shippingAddress.zip}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base mb-3">Payment Method</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{mockOrder.payment.method}</p>
              <p>Ending in {mockOrder.payment.last4}</p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl mb-4">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-[#2AC864]">1</span>
              </div>
              <div>
                <h4 className="text-base mb-1">Order Processing</h4>
                <p className="text-sm text-gray-600">
                  We're preparing your order for shipment. This typically takes 1-2 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-[#2AC864]">2</span>
              </div>
              <div>
                <h4 className="text-base mb-1">Shipping Notification</h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email with your tracking number once your order ships.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-[#2AC864]">3</span>
              </div>
              <div>
                <h4 className="text-base mb-1">Track Your Order</h4>
                <p className="text-sm text-gray-600">
                  Monitor your shipment's progress in real-time using the tracking link in your email or your account dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-[#2AC864]">4</span>
              </div>
              <div>
                <h4 className="text-base mb-1">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Receive your order and enjoy! We'll send a delivery confirmation once your package arrives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Account Prompt (for guest users) */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg mb-2">Create an Account to Track Your Order</h3>
              <p className="text-sm text-gray-600 mb-4">
                Save your delivery preferences, view order history, and get personalized recommendations.
              </p>
              <Button onClick={() => onNavigate('/signup')} className="gap-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Button variant="outline" onClick={() => onNavigate('/products')} className="gap-2">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
