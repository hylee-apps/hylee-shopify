import { useState } from 'react';
import { Button } from '../ui/button';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface HeaderProps {
  onNavigate?: (route: Route | string) => void;
  onNavigateHome?: () => void;
  onBack?: () => void;
  variant?: 'default' | 'minimal';
}

const categories = [
  { name: "Lorem Ipsum", icon: "📱", count: "2,450+" },
  { name: "Dolor Sit", icon: "👔", count: "3,200+" },
  { name: "Amet Consectetur", icon: "🏠", count: "1,800+" },
  { name: "Adipiscing Elit", icon: "⚽", count: "1,500+" },
  { name: "Sed Do Eiusmod", icon: "💄", count: "2,100+" },
  { name: "Tempor Incididunt", icon: "🍳", count: "980+" }
];

export function Header({ onNavigate, onNavigateHome, onBack, variant = 'default' }: HeaderProps) {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  if (variant === 'minimal') {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onNavigateHome && onNavigateHome()}
              className="text-2xl tracking-tight text-[#2AC864] hover:opacity-80 transition-opacity"
            >
              Hylee
            </button>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => onNavigate && onNavigate('/track-order')}>
                Track Order
              </Button>
              <Button variant="outline" onClick={() => onNavigate && onNavigate('/signin')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigateHome && onNavigateHome()}>
          <img src="https://placehold.co/28x28/71717a/ffffff?text=L" alt="Hylee Logo" className="w-7 h-7 rounded-lg" />
          <span className="text-xl tracking-tight text-slate-900">Hylee</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => onNavigate && onNavigate('/')}
            className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('/products')}
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
                        onNavigate && onNavigate(`/category/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`);
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
          <button className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors cursor-pointer">
            About
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate && onNavigate('/track-order')}
            className="px-4 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors"
          >
            Track Order
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('/signin')}
            className="px-4 py-1.5 text-sm text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('/signup')}
            className="px-4 py-1.5 text-sm border-2 border-[#2AC864] text-[#2AC864] rounded-lg hover:bg-[#2AC864] hover:text-white transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}