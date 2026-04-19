import type {IGraphQLConfig} from 'graphql-config';
import {getSchema} from '@shopify/hydrogen-codegen';

/**
 * GraphQL Config
 * @see https://the-guild.dev/graphql/config/docs/user/usage
 * @type {IGraphQLConfig}
 */
const graphqlConfig: IGraphQLConfig = {
  projects: {
    default: {
      schema: getSchema('storefront'),
      documents: [
        './*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}',
        '!./app/routes/account.tsx',
        '!./app/routes/account._index.tsx',
        '!./app/routes/account.addresses.tsx',
        '!./app/routes/account.notifications.tsx',
        '!./app/routes/account.orders._index.tsx',
        '!./app/routes/account.orders.$id.tsx',
        '!./app/routes/account.orders.$id_.return.tsx',
        '!./app/routes/account.orders.$id_.return_.reason.tsx',
        '!./app/routes/account.orders.$id_.return_.resolve.tsx',
        '!./app/routes/account.orders.$id_.return_.shipping.tsx',
        '!./app/routes/account.settings.tsx',
        '!./app/routes/account.welcome.tsx',
        '!./app/routes/account.wishlist.tsx',
      ],
    },
    'customer-account': {
      schema: getSchema('customer-account'),
      documents: [
        './app/routes/account.tsx',
        './app/routes/account._index.tsx',
        './app/routes/account.addresses.tsx',
        './app/routes/account.notifications.tsx',
        './app/routes/account.orders._index.tsx',
        './app/routes/account.orders.$id.tsx',
        './app/routes/account.orders.$id_.return.tsx',
        './app/routes/account.orders.$id_.return_.reason.tsx',
        './app/routes/account.orders.$id_.return_.resolve.tsx',
        './app/routes/account.orders.$id_.return_.shipping.tsx',
        './app/routes/account.settings.tsx',
        './app/routes/account.welcome.tsx',
      ],
    },
  },
};

export default graphqlConfig;
