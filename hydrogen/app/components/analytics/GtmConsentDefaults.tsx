//Fires before GTM initialises to set consent defaults and prevent accidental data collection in the interim.
import {memo} from 'react';
import type {ConsentPayload} from '~/types/data-layer';

interface GtmConsentDefaultsProps {
  /**
   * Per-request CSP nonce. Must match the nonce on your Content-Security-Policy
   * script-src header. Required for CSP compliance — omit only if you are not
   * enforcing CSP (not recommended for production).
   */
  nonce?: string;
  /**
   * Milliseconds GTM will wait for a consent update before firing tags with
   * their current (denied) state. 500ms is sufficient for most consent banners.
   */
  waitMs?: number;
  /**
   * Override specific consent states. Useful for regions where certain consent
   * types are not required (e.g. functionality_storage in non-GDPR markets).
   * All states default to 'denied' when not specified.
   */
  overrides?: Partial<ConsentPayload>;
}

const DENIED_BY_DEFAULT: ConsentPayload = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
};

/**
 * Injects the Consent Mode v2 default state before GTM loads.
 * Renders a single inline <script> — dangerouslySetInnerHTML is unavoidable
 * here for the same reason it is in GtmScript: React strips inline script
 * content by design. The injected string is constructed entirely from typed
 * constants and validated props — no user input is interpolated.
 */
export const GtmConsentDefaults = memo(function GtmConsentDefaults({
  nonce,
  waitMs = 500,
  overrides = {},
}: GtmConsentDefaultsProps) {
  const payload: ConsentPayload = {...DENIED_BY_DEFAULT, ...overrides};

  const script = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    `gtag('consent','default',${JSON.stringify({...payload, wait_for_update: waitMs})});`,
    // Region-level overrides can be appended here if needed, e.g.:
    // gtag('consent','default',{analytics_storage:'granted',region:['US-CA']});
  ].join('\n');

  return (
    <script
      id="gtm-consent-defaults"
      nonce={nonce}
      dangerouslySetInnerHTML={{__html: script}}
    />
  );
});
