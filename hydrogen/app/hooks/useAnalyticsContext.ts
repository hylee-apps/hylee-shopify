import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router';
import {pushDataLayer} from '~/utils/data-layer';
import type {PageType} from '~/types/data-layer';

function getPageType(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname.startsWith('/collections')) return 'collection';
  if (pathname === '/cart') return 'cart';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/account')) return 'account';
  if (pathname.startsWith('/blogs/')) return 'blog';
  return 'other';
}

interface AnalyticsContextOptions {
  enabled?: boolean;
  isLoggedIn?: boolean;
}

/**
 * Fires dl_page on every client-side route change and dl_user once per session.
 * dl_page gives GTM route-level context (page.type, page.path, etc.).
 * dl_user fires once with authentication state for user segmentation.
 */
export function useAnalyticsContext({
  enabled = true,
  isLoggedIn = false,
}: AnalyticsContextOptions = {}): void {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const userFiredRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    pushDataLayer({
      event: 'dl_page',
      page: {
        type: getPageType(location.pathname),
        path: location.pathname + location.search,
        title: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
    });
  }, [location.pathname, location.search, enabled]);

  useEffect(() => {
    if (!enabled || userFiredRef.current) return;
    userFiredRef.current = true;

    pushDataLayer({
      event: 'dl_user',
      user: {
        id: null,
        email_hashed: null,
        phone_hashed: null,
        is_authenticated: isLoggedIn,
        status: isLoggedIn ? 'returning' : 'guest',
        lifetime_orders: 0,
        lifetime_value: 0,
        days_since_last_order: null,
        predicted_ltv: null,
        customer_tags: [],
        acquisition_source: null,
      },
    });
  }, [enabled, isLoggedIn]);
}
