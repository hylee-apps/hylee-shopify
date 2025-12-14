import { useState } from 'react';
import { CreditCard, ShoppingCart, Truck, CheckCircle, Lock, Shield, ChevronRight, X, MapPin, Home as HomeIcon, Briefcase, Users, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface CheckoutProps {
  onNavigate: (route: Route) => void;
}

// Mock cart data
const mockCartItems = [
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
];

const addressCategories = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'office', label: 'Office', icon: Briefcase },
  { id: 'work', label: 'Work', icon: Building2 },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'other', label: 'Other', icon: MapPin }
];

export function Checkout({ onNavigate }: CheckoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [addressCategory, setAddressCategory] = useState('home');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  const steps = [
    { id: 0, label: 'Cart', icon: ShoppingCart },
    { id: 1, label: 'Shipping', icon: Truck },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Review', icon: CheckCircle }
  ];

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === 'express' ? 19.99 : shippingMethod === 'overnight' ? 39.99 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = () => {
    onNavigate('/order-confirmation');
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep >= step.id
                        ? 'bg-[#2AC864] border-[#2AC864] text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-sm ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-colors ${
                      currentStep > step.id ? 'bg-[#2AC864]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 0: Cart Review */}
            {currentStep === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-6">Review Your Order</h2>

                {/* Guest Checkout Option */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base">Checkout Options</h3>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setIsGuest(false)}
                      variant={!isGuest ? "default" : "outline"}
                      className="flex-1"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setIsGuest(true)}
                      variant={isGuest ? "default" : "outline"}
                      className="flex-1"
                    >
                      Guest Checkout
                    </Button>
                  </div>
                  {isGuest && (
                    <p className="text-sm text-gray-600 mt-3">
                      You can create an account after completing your order to track shipments and save preferences.
                    </p>
                  )}
                </div>

                {/* Cart Items */}
                <div className="space-y-4">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-base">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setCurrentStep(1)} className="gap-2">
                    Continue to Shipping
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-6">Shipping Information</h2>

                {isGuest && (
                  <div className="mb-6">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="mt-1.5"
                    />
                    <p className="text-sm text-gray-500 mt-1.5">
                      We'll send order confirmation and tracking details here
                    </p>
                  </div>
                )}

                {/* Address Category Selection */}
                <div className="mb-6">
                  <Label className="mb-3 block">Address Type</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {addressCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setAddressCategory(category.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          addressCategory === category.id
                            ? 'border-[#2AC864] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <category.icon className={`w-5 h-5 ${addressCategory === category.id ? 'text-[#2AC864]' : 'text-gray-500'}`} />
                        <span className="text-sm">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Lorem" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Ipsum" className="mt-1.5" />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Lorem Ipsum Street" className="mt-1.5" />
                </div>

                <div className="mb-4">
                  <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                  <Input id="address2" placeholder="Apt 4B" className="mt-1.5" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Dolor City" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="CA" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="12345" className="mt-1.5" />
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mb-6">
                  <Label className="mb-3 block">Shipping Method</Label>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="cursor-pointer">
                            <div>Standard Shipping</div>
                            <div className="text-sm text-gray-500">5-7 business days</div>
                          </Label>
                        </div>
                        <span className="text-base">$9.99</span>
                      </div>

                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <Label htmlFor="express" className="cursor-pointer">
                            <div>Express Shipping</div>
                            <div className="text-sm text-gray-500">2-3 business days</div>
                          </Label>
                        </div>
                        <span className="text-base">$19.99</span>
                      </div>

                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="overnight" id="overnight" />
                          <Label htmlFor="overnight" className="cursor-pointer">
                            <div>Overnight Shipping</div>
                            <div className="text-sm text-gray-500">Next business day</div>
                          </Label>
                        </div>
                        <span className="text-base">$39.99</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} className="gap-2">
                    Continue to Payment
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-6">Payment Method</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Credit / Debit Card
                      </Label>
                    </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                    </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="apple-pay" id="apple-pay" />
                      <Label htmlFor="apple-pay" className="cursor-pointer">Apple Pay</Label>
                    </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="google-pay" id="google-pay" />
                      <Label htmlFor="google-pay" className="cursor-pointer">Google Pay</Label>
                    </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="shop-pay" id="shop-pay" />
                      <Label htmlFor="shop-pay" className="cursor-pointer">Shop Pay</Label>
                    </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <RadioGroupItem value="afterpay" id="afterpay" />
                      <Label htmlFor="afterpay" className="cursor-pointer">
                        Afterpay
                        <span className="text-sm text-gray-500 ml-2">Pay in 4 installments</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === 'credit-card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="mt-1.5" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="Lorem Ipsum" className="mt-1.5" />
                    </div>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Shield className="w-5 h-5 text-[#2AC864]" />
                    <div>
                      <div>Your payment information is secure</div>
                      <div className="text-gray-500">256-bit SSL encryption • PCI DSS compliant</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="gap-2">
                    Review Order
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-6">Review Your Order</h2>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="text-base mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {mockCartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="text-base mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>Lorem Ipsum</p>
                    <p>123 Lorem Ipsum Street, Apt 4B</p>
                    <p>Dolor City, CA 12345</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Shipping Method */}
                <div className="mb-6">
                  <h3 className="text-base mb-2">Shipping Method</h3>
                  <p className="text-sm text-gray-600">
                    {shippingMethod === 'standard' && 'Standard Shipping (5-7 business days)'}
                    {shippingMethod === 'express' && 'Express Shipping (2-3 business days)'}
                    {shippingMethod === 'overnight' && 'Overnight Shipping (Next business day)'}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-base mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'credit-card' && 'Credit Card ending in 3456'}
                    {paymentMethod === 'paypal' && 'PayPal'}
                    {paymentMethod === 'apple-pay' && 'Apple Pay'}
                    {paymentMethod === 'google-pay' && 'Google Pay'}
                    {paymentMethod === 'shop-pay' && 'Shop Pay'}
                    {paymentMethod === 'afterpay' && 'Afterpay (4 installments)'}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} className="gap-2">
                    <Lock className="w-4 h-4" />
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between mb-6">
                <span>Total</span>
                <span className="text-xl text-[#2AC864]">${total.toFixed(2)}</span>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <Label htmlFor="promo" className="mb-2 block">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                  />
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-[#2AC864]" />
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-[#2AC864]" />
                  <span>Free Returns Within 30 Days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#2AC864]" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
