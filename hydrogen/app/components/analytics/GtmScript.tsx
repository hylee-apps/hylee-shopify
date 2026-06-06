import { memo } from 'react';

interface GtmScriptProps {
    containerId: string;
    nonce?: string;
    dataLayerName?: string;
    /**
     * Pass a custom server-side GTM container URL to route tag firing through
     * your own server container proxy. Falls back to the Google CDN.
     */
    serverUrl?: string | null;
}

/**
 * Injects the GTM bootstrap script. Must render after GtmConsentDefaults in
 * <head> so consent state is established before any GTM tag fires.
 *
 * dangerouslySetInnerHTML: unavoidable — see GtmConsentDefaults for rationale.
 * The script string is constructed from validated, static values only.
 */
export const GtmScript = memo(function GtmScript({
    containerId,
    nonce,
    dataLayerName = 'dataLayer',
    serverUrl = null,
}: GtmScriptProps) {
    const gtmSrc = serverUrl
        ? `${serverUrl}/gtm.js`
        : 'https://www.googletagmanager.com/gtm.js';

    // The bootstrap is built from an array so the logic is easy to follow
    // and audit — no template literals with embedded expressions.
    const script = [
        `(function(w,d,s,l,i){`,
        `  w[l] = w[l] || [];`,
        `  w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`,
        `  var f = d.getElementsByTagName(s)[0],`,
        `      j = d.createElement(s),`,
        `      dl = l !== 'dataLayer' ? '&l=' + l : '';`,
        `  j.async = true;`,
        `  j.src = '${gtmSrc}?id=' + i + dl;`,
        `  if (f && f.parentNode) { f.parentNode.insertBefore(j, f); }`,
        `})(window, document, 'script', '${dataLayerName}', '${containerId}');`,
    ].join('\n');

    return (
        <script
            id="gtm-bootstrap"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: script }}
        />
    );
});