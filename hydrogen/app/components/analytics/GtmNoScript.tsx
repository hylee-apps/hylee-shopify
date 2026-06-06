import {memo} from 'react';

interface GtmNoScriptProps {
  containerId: string;
  serverUrl?: string | null;
}

/**
 * GTM noscript fallback. Renders a plain iframe — no dangerouslySetInnerHTML
 * required because React renders the iframe declaratively from typed props.
 * Place immediately after the opening <body> tag.
 */
export const GtmNoScript = memo(function GtmNoScript({
  containerId,
  serverUrl = null,
}: GtmNoScriptProps) {
  const src = serverUrl
    ? `${serverUrl}/ns.html?id=${containerId}`
    : `https://www.googletagmanager.com/ns.html?id=${containerId}`;

  return (
    <noscript>
      <iframe
        src={src}
        title="Google Tag Manager"
        aria-hidden="true"
        height="0"
        width="0"
        style={{display: 'none', visibility: 'hidden'}}
      />
    </noscript>
  );
});
