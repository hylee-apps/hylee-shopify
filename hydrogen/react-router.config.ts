import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';

export default {
  presets: [hydrogenPreset()],
  // Allow the mini-oxygen dev proxy origin to pass the CSRF check on form
  // actions. Without this, POSTing from localhost through the proxy triggers
  // "x-forwarded-host header does not match origin header" errors.
  // @ts-expect-error — allowedActionOrigins exists at runtime but is missing from the Config type in react-router 7.9.x
  allowedActionOrigins: [
    'localhost',
    '*.tryhydrogen.dev',
    '*.trycloudflare.com',
  ],
} satisfies Config;
