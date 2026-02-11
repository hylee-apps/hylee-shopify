import {Suspense} from 'react';
import {Outlet, useRouteLoaderData, Await} from 'react-router';
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
export function PageLayout({children}: PageLayoutProps) {
  const data = useRouteLoaderData<RootLoader>('root');

  // Guard against missing root data
  if (!data) {
    return <>{children ?? <Outlet />}</>;
  }

  const {header, footer, isLoggedIn, cart} = data;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        shop={header?.shop}
        menu={header?.menu}
        isLoggedIn={isLoggedIn}
        cart={cart}
      />

      <main className="flex-1">{children ?? <Outlet />}</main>

      <Suspense
        fallback={
          <Footer
            shopName={header?.shop?.name ?? 'Hy-lee'}
            logoUrl={header?.shop?.brand?.logo?.image?.url}
            description="Premium wholesale marketplace for small businesses worldwide"
          />
        }
      >
        <Await resolve={footer}>
          {(resolvedFooter) => (
            <Footer
              menu={resolvedFooter?.menu}
              shopName={header?.shop?.name ?? 'Hy-lee'}
              logoUrl={header?.shop?.brand?.logo?.image?.url}
              description="Premium wholesale marketplace for small businesses worldwide"
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

export default PageLayout;
