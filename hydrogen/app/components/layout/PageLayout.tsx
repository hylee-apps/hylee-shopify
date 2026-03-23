import {Suspense} from 'react';
import {Outlet, useRouteLoaderData, useLocation, Await} from 'react-router';
import {Header} from './Header';
import {Footer} from './Footer';
import type {RootLoader} from '~/root';

// ============================================================================
// Types
// ============================================================================

export interface PageLayoutProps {
  /** Optional children to render instead of Outlet */
  children?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PageLayout - Main layout wrapper with Header and Footer
 *
 * This component wraps page content with the site Header and Footer.
 * It automatically fetches header/footer data from the root loader.
 *
 * Usage in routes:
 * ```tsx
 * import { PageLayout } from '~/components/layout';
 *
 * export default function SomePage() {
 *   return (
 *     <PageLayout>
 *       <YourContent />
 *     </PageLayout>
 *   );
 * }
 * ```
 */
// Auth routes render their own full-screen layout (no header/footer)
const BARE_LAYOUT_PATHS = [
  '/account/login',
  '/account/register',
  '/account/recover',
  '/account/reset',
  '/account/activate',
];

export function PageLayout({children}: PageLayoutProps) {
  const data = useRouteLoaderData<RootLoader>('root');
  const {pathname} = useLocation();
  const headerVariant = pathname === '/' ? 'home' : 'default';

  // Auth pages use their own AuthLayout — skip header/footer
  if (BARE_LAYOUT_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children ?? <Outlet />}</>;
  }

  // Guard against missing root data
  if (!data) {
    return <>{children ?? <Outlet />}</>;
  }

  const {header, footer, isLoggedIn, cart, categories} = data;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        shop={header?.shop}
        menu={header?.menu}
        isLoggedIn={isLoggedIn}
        cart={cart}
        variant={headerVariant}
        categories={categories}
      />

      <main className="flex-1">{children ?? <Outlet />}</main>

      <Suspense fallback={<Footer shopName={header?.shop?.name ?? 'Hy-lee'} />}>
        <Await resolve={footer}>
          {(resolvedFooter) => (
            <Footer
              menu={resolvedFooter?.menu}
              shopName={header?.shop?.name ?? 'Hy-lee'}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

export default PageLayout;
