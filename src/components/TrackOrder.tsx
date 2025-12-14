import { useState } from 'react';
import { Search, Package, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface TrackOrderProps {
  onNavigate: (route: Route) => void;
}

export function TrackOrder({ onNavigate }: TrackOrderProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to order detail page
    if (orderNumber) {
      onNavigate(`/orders/${orderNumber}` as Route);
    }
  };

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
              <Button variant="outline" onClick={() => onNavigate('/signin')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-[#2AC864]" />
          </div>
          <h1 className="text-3xl mb-3">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            Enter your order details below to check the status of your shipment
          </p>
        </div>

        {/* Track Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <div className="mt-1.5 relative">
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., HYL-2024-001234"
                  className="pr-10"
                  required
                />
                <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1.5">
                You can find this in your confirmation email
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="mt-1.5 relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="pr-10"
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1.5">
                The email address used during checkout
              </p>
            </div>

            <Button type="submit" className="w-full gap-2">
              <Search className="w-4 h-4" />
              Track Order
            </Button>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-base mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="text-base mb-1">Can't find your order number?</h4>
              <p className="text-gray-600">
                Check your email inbox for your order confirmation. The subject line should be "Order Confirmation - Hylee"
              </p>
            </div>
            <div>
              <h4 className="text-base mb-1">Still can't find it?</h4>
              <p className="text-gray-600 mb-2">
                If you created an account, you can view all your orders in your account dashboard.
              </p>
              <Button variant="outline" onClick={() => onNavigate('/signin')}>
                Sign In to Account
              </Button>
            </div>
          </div>
        </div>

        {/* Create Account CTA */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg mb-2">Want Easier Order Tracking?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a Hylee account to view all your orders in one place, save addresses, and get personalized recommendations.
          </p>
          <Button onClick={() => onNavigate('/signup')}>
            Create Free Account
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            For order assistance, please contact our support team
          </p>
          <Button variant="link" className="text-[#2AC864] mt-2">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
