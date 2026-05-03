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
        apiSecret: string;        // Measurement Protocol (server-side)
        debugMode: boolean;
    };
}

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`[Analytics] Missing required env var: ${key}`);
    return value;
}

function validatePattern(value: string, pattern: RegExp, label: string): void {
    if (!pattern.test(value)) {
        throw new Error(`[Analytics] Invalid ${label}: "${value}"`);
    }
}

let _config: AnalyticsConfig | null = null;

export function getAnalyticsConfig(): AnalyticsConfig {
    if (_config) return _config;

    const env = process.env.NODE_ENV;

    // Analytics is disabled in test environments entirely.
    // In development it loads but uses debugMode to avoid polluting GA4.
    if (env === 'test') {
        _config = {
            enabled: false,
            gtm: { containerId: '', dataLayerName: 'dataLayer', serverUrl: null },
            ga4: { measurementId: '', apiSecret: '', debugMode: false },
        };
        return _config;
    }

    const containerId = requireEnv('GTM_CONTAINER_ID');
    const measurementId = requireEnv('GA4_MEASUREMENT_ID');
    const apiSecret = requireEnv('GA4_API_SECRET');

    validatePattern(containerId, GTM_PATTERN, 'GTM_CONTAINER_ID');
    validatePattern(measurementId, GA4_PATTERN, 'GA4_MEASUREMENT_ID');

    _config = {
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

    return _config;
}