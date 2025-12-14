import { useState } from 'react';
import { Home } from './components/Home';
import { Products } from './components/Products';
import { ProductDetails } from './components/ProductDetails';
import { CategoryPage } from './components/CategoryPage';
import { SubCategoryPage } from './components/SubCategoryPage';
import { SignUp } from './components/SignUp';
import { Account } from './components/Account';
import { Checkout } from './components/Checkout';
import { OrderConfirmation } from './components/OrderConfirmation';
import { TrackOrder } from './components/TrackOrder';
import { OrderDetail } from './components/OrderDetail';

type Route = '/' | '/products' | `/products/${string}` | `/category/${string}` | `/category/${string}/${string}` | '/signup' | '/signin' | '/account' | '/checkout' | '/order-confirmation' | '/track-order' | `/orders/${string}`;

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('/');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = (route: Route, query?: string) => {
    setCurrentRoute(route);
    if (query !== undefined) {
      setSearchQuery(query);
    }
  };

  // Parse route to determine current page
  const getPageType = () => {
    if (currentRoute === '/') return 'home';
    if (currentRoute === '/products') return 'products';
    if (currentRoute === '/signup') return 'signup';
    if (currentRoute === '/signin') return 'signin';
    if (currentRoute === '/account') return 'account';
    if (currentRoute === '/checkout') return 'checkout';
    if (currentRoute === '/order-confirmation') return 'order-confirmation';
    if (currentRoute === '/track-order') return 'track-order';
    if (currentRoute.startsWith('/products/')) return 'product-detail';
    if (currentRoute.startsWith('/category/')) {
      const parts = currentRoute.split('/').filter(Boolean);
      return parts.length === 2 ? 'category' : 'subcategory';
    }
    if (currentRoute.startsWith('/orders/')) return 'order-detail';
    return 'home';
  };

  // Extract IDs from routes
  const extractIds = () => {
    if (currentRoute.startsWith('/products/')) {
      return { productId: currentRoute.split('/products/')[1] };
    }
    if (currentRoute.startsWith('/category/')) {
      const parts = currentRoute.split('/').filter(Boolean);
      return {
        categoryId: parts[1],
        subCategoryId: parts[2]
      };
    }
    if (currentRoute.startsWith('/orders/')) {
      return { orderId: currentRoute.split('/orders/')[1] };
    }
    return {};
  };

  const pageType = getPageType();
  const { productId, categoryId, subCategoryId, orderId } = extractIds();

  return (
    <div className="min-h-screen bg-white">
      {pageType === 'home' && (
        <Home 
          onSearch={(query) => navigate('/products', query)} 
          onNavigate={navigate}
        />
      )}
      
      {pageType === 'products' && (
        <Products 
          searchQuery={searchQuery} 
          onNavigateHome={() => navigate('/')}
          onProductClick={(id) => navigate(`/products/${id}` as Route)}
          onNavigate={navigate}
        />
      )}
      
      {pageType === 'product-detail' && productId && (
        <ProductDetails 
          productId={productId}
          onBack={() => navigate('/products')}
          onNavigateHome={() => navigate('/')}
          onNavigate={navigate}
        />
      )}
      
      {pageType === 'category' && categoryId && (
        <CategoryPage
          categoryId={categoryId}
          onNavigate={navigate}
          onProductClick={(id) => navigate(`/products/${id}` as Route)}
        />
      )}
      
      {pageType === 'subcategory' && categoryId && subCategoryId && (
        <SubCategoryPage
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          onNavigate={navigate}
          onProductClick={(id) => navigate(`/products/${id}` as Route)}
        />
      )}
      
      {pageType === 'signup' && (
        <SignUp onNavigate={navigate} />
      )}
      
      {pageType === 'signin' && (
        <SignUp onNavigate={navigate} />
      )}
      
      {pageType === 'account' && (
        <Account onNavigate={navigate} />
      )}
      
      {pageType === 'checkout' && (
        <Checkout onNavigate={navigate} />
      )}
      
      {pageType === 'order-confirmation' && (
        <OrderConfirmation onNavigate={navigate} />
      )}
      
      {pageType === 'track-order' && (
        <TrackOrder onNavigate={navigate} />
      )}
      
      {pageType === 'order-detail' && orderId && (
        <OrderDetail 
          orderId={orderId}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}