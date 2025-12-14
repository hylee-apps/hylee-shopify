import { useState } from 'react';
import { Mail, Lock, User, Check, ArrowRight, Shield, Package, Headphones, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

interface SignUpProps {
  onNavigate: (path: string) => void;
}

export function SignUp({ onNavigate }: SignUpProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    marketingEmails: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'passwordless'>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock sign-up - in real app would call API
    console.log('Sign up with:', formData);
    alert('Account created successfully! Redirecting to verification...');
    // Would navigate to verification page in real app
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Sign up with ${provider}`);
    alert(`Sign up with ${provider} - OAuth flow would start here`);
  };

  const handlePasswordlessSignup = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Verification email sent! Check your inbox to complete sign-up.');
  };

  const valueProps = [
    {
      icon: Package,
      title: 'Exclusive B2B Pricing',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing'
    },
    {
      icon: Shield,
      title: 'Simplified Procurement',
      description: 'Ut enim ad minim veniam quis nostrud exercitation'
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Duis aute irure dolor in reprehenderit voluptate'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <img src="https://placehold.co/28x28/71717a/ffffff?text=L" alt="Hylee Logo" className="w-7 h-7 rounded-lg" />
            <span className="text-xl tracking-tight text-slate-900">Hylee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Already have an account?</span>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('/signin')}
              className="border-2 border-[#2AC864] text-[#2AC864] hover:bg-[#2AC864] hover:text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Sign Up Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-3xl text-slate-900 mb-2">Create Your Account</h1>
              <p className="text-slate-600">Join Hylee to access exclusive B2B pricing and features</p>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 h-12 border-slate-300 hover:border-slate-400"
                onClick={() => handleSocialLogin('Google')}
              >
                <img src="https://placehold.co/20x20/71717a/ffffff?text=G" alt="Google" className="w-5 h-5" />
                Continue with Google
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-center gap-2 h-12 border-slate-300 hover:border-slate-400"
                  onClick={() => handleSocialLogin('Facebook')}
                >
                  <img src="https://placehold.co/20x20/71717a/ffffff?text=F" alt="Facebook" className="w-5 h-5" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-center gap-2 h-12 border-slate-300 hover:border-slate-400"
                  onClick={() => handleSocialLogin('LinkedIn')}
                >
                  <img src="https://placehold.co/20x20/71717a/ffffff?text=L" alt="LinkedIn" className="w-5 h-5" />
                  LinkedIn
                </Button>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or sign up with</span>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'email'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('passwordless')}
                className={`flex-1 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'passwordless'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passwordless
              </button>
            </div>

            {/* Email & Password Form */}
            {activeTab === 'email' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm text-slate-700 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm text-slate-700 mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-slate-700 mb-1.5">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptTerms: checked as boolean })
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                      I agree to the{' '}
                      <button type="button" className="text-[#2AC864] hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-[#2AC864] hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="marketing"
                      checked={formData.marketingEmails}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, marketingEmails: checked as boolean })
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor="marketing" className="text-sm text-slate-600 leading-tight">
                      Send me promotional emails and product updates (GDPR compliant)
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#2AC864] hover:bg-[#24b056] text-white mt-6"
                  disabled={!formData.acceptTerms}
                >
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {/* Passwordless Form */}
            {activeTab === 'passwordless' && (
              <form onSubmit={handlePasswordlessSignup} className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-600">
                    We'll send you a secure link to create your account without a password. 
                    Simply click the link in your email to get started.
                  </p>
                </div>

                <div>
                  <label htmlFor="passwordless-email" className="block text-sm text-slate-700 mb-1.5">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="passwordless-email"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="passwordless-terms" className="mt-0.5" required />
                  <label htmlFor="passwordless-terms" className="text-sm text-slate-600 leading-tight">
                    I agree to the{' '}
                    <button type="button" className="text-[#2AC864] hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-[#2AC864] hover:underline">
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#2AC864] hover:bg-[#24b056] text-white"
                >
                  Send Magic Link
                  <Mail className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}
          </div>

          {/* Right Side - Value Propositions */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl text-slate-900 mb-4">Why Join Hylee?</h2>
              <p className="text-slate-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <div className="space-y-6">
              {valueProps.map((prop, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-6 bg-white rounded-xl border border-slate-200 hover:border-[#2AC864] hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#2AC864] to-[#2699A6] rounded-xl flex items-center justify-center">
                    <prop.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 mb-1">{prop.title}</h3>
                    <p className="text-sm text-slate-600">{prop.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <Check className="w-5 h-5 text-[#2AC864] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">
                    <span className="text-slate-900">Trusted by 10,000+ businesses</span> - 
                    Lorem ipsum dolor sit amet consectetur adipiscing elit
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#2AC864] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">
                    <span className="text-slate-900">GDPR Compliant</span> - 
                    Ut enim ad minim veniam quis nostrud exercitation
                  </p>
                </div>
              </div>
            </div>
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