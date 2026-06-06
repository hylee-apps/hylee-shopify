//Route change tracking for page views
import { useEffect, useRef } from 'react';
import { useLocation } from '@remix-run/react';
import { pushDataLayer } from '~/utils/data-layer';

interface PageViewOptions {
    /**
     * When true, a new page_view fires when only the query string changes.
     * Set to false for pages that use query params for filters without
     * representing a new logical page (e.g. collection sort/filter).
     */
    trackQueryChanges?: boolean;
    enabled?: boolean;
}

/**
 * Pushes a page_view event to dataLayer on every client-side route change.
 *
 * This hook exists because GTM's built-in History Change trigger only
 * captures pushState/replaceState events, not Remix's RSC-style navigations.
 * By pushing explicitly we guarantee every navigation is captured regardless
 * of how Remix implements it internally.
 *
 * The ref-based deduplication prevents double-fires in React StrictMode
 * (where effects run twice in development).
 */
export function usePageViewTracking({
    trackQueryChanges = false,
    enabled = true,
}: PageViewOptions = {}): void {
    const location = useLocation();
    const prevPathRef = useRef<string | null>(null);

    const key = trackQueryChanges
        ? location.pathname + location.search
        : location.pathname;

    useEffect(() => {
        if (!enabled) return;
        // Deduplicate: don't fire if the effective path hasn't changed
        if (prevPathRef.current === key) return;
        prevPathRef.current = key;

        pushDataLayer({
            event: 'page_view',
            page_path: location.pathname + location.search,
            page_title: typeof document !== 'undefined' ? document.title : '',
        });
    }, [key, enabled, location.pathname, location.search]);
}