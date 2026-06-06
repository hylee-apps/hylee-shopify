const GTM_PATTERN = /^GTM-[A-Z0-9]{4,10}$/;
const GA4_PATTERN = /^G-[A-Z0-9]{6,12}$/;

export interface AnalyticsConfig {
  enabled: boolean;
  gtm: {
    containerId: string;
    dataLayerName: string;
    serverUrl: string | null; // null = use Google CDN
  };
  ga4: {
    measurementId: string;
    apiSecret: string | null; // Measurement Protocol (server-side); null = not configured
    debugMode: boolean;
  };
}

function validatePattern(
  value: string,
  pattern: RegExp,
  label: string,
): boolean {
  if (!pattern.test(value)) {
    console.warn(
      `[Analytics] Invalid ${label}: "${value}" — analytics disabled`,
    );
    return false;
  }
  return true;
}

interface CmsAnalyticsValues {
  gtmContainerId?: string | null;
  ga4MeasurementId?: string | null;
  ga4ApiSecret?: string | null;
}

export function getAnalyticsConfig({
  gtmContainerId: cmsGtmContainerId,
  ga4MeasurementId: cmsGa4MeasurementId,
  ga4ApiSecret: cmsGa4ApiSecret,
}: CmsAnalyticsValues = {}): AnalyticsConfig {
  const env = process.env.NODE_ENV;

  const disabled: AnalyticsConfig = {
    enabled: false,
    gtm: {containerId: '', dataLayerName: 'dataLayer', serverUrl: null},
    ga4: {measurementId: '', apiSecret: null, debugMode: false},
  };

  if (env === 'test') return disabled;

  // CMS (Shopify Admin metafields) take precedence over env vars.
  const containerId = cmsGtmContainerId ?? process.env.GTM_CONTAINER_ID ?? '';
  const measurementId =
    cmsGa4MeasurementId ?? process.env.GA4_MEASUREMENT_ID ?? '';
  const apiSecret = cmsGa4ApiSecret ?? process.env.GA4_API_SECRET ?? null;

  if (!measurementId) {
    console.warn(
      '[Analytics] GA4 measurement ID not configured — analytics disabled',
    );
    return disabled;
  }

  if (
    containerId &&
    !validatePattern(containerId, GTM_PATTERN, 'GTM_CONTAINER_ID')
  )
    return disabled;
  if (!validatePattern(measurementId, GA4_PATTERN, 'GA4_MEASUREMENT_ID'))
    return disabled;

  return {
    enabled: true,
    gtm: {
      containerId,
      dataLayerName: 'dataLayer',
      serverUrl: process.env.GTM_SERVER_CONTAINER_URL ?? null,
    },
    ga4: {
      measurementId,
      apiSecret,
      debugMode: env !== 'production',
    },
  };
}
