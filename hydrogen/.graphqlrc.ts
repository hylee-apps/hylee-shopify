import {pluckConfig, preset} from '@shopify/hydrogen-codegen';

export default {
  projects: {
    default: {
      schema: 'node_modules/@shopify/hydrogen/storefront.schema.json',
      documents: [
        './*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}',
        '!./app/graphql/customer-account/*.{ts,tsx,js,jsx}',
      ],
      extensions: {
        codegen: {
          pluckConfig,
          generates: preset.buildGeneratesSection({
            storefrontApiVersion: '2025-10',
          }),
        },
      },
    },
    'customer-account': {
      schema: 'node_modules/@shopify/hydrogen/customer-account.schema.json',
      documents: ['./app/graphql/customer-account/*.{ts,tsx,js,jsx}'],
      extensions: {
        codegen: {
          pluckConfig,
          generates: preset.buildGeneratesSection({
            customerAccountApiVersion: '2025-10',
          }),
        },
      },
    },
  },
};
