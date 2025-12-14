type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

interface FooterProps {
  onNavigate: (route: Route | string) => void;
  variant?: 'default' | 'minimal';
}

export function Footer({ onNavigate, variant = 'default' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              © 2024 Hylee. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</button>
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</button>
              <button className="hover:text-slate-900 transition-colors cursor-pointer">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
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
              <li>
                <button 
                  onClick={() => onNavigate('/category/lorem-ipsum')}
                  className="hover:text-slate-900"
                >
                  Electronics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/category/dolor-sit')}
                  className="hover:text-slate-900"
                >
                  Fashion
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/category/amet-consectetur')}
                  className="hover:text-slate-900"
                >
                  Home & Living
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/products')}
                  className="hover:text-slate-900"
                >
                  All Categories
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><button className="hover:text-slate-900 cursor-pointer">About Us</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Contact</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Careers</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><button className="hover:text-slate-900 cursor-pointer">Help Center</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Shipping Info</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Returns</button></li>
              <li><button className="hover:text-slate-900 cursor-pointer">Terms & Conditions</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          <p>© 2025 Hylee. Connecting small businesses with verified suppliers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}