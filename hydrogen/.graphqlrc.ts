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
        '!./app/graphql/customer-account/*.{ts,tsx,js,jsx}',
        '!./app/routes/account*.{ts,tsx,js,jsx}',
        '!./app/lib/address-book-graphql.{ts,tsx}',
      ],
    },
    'customer-account': {
      schema: getSchema('customer-account'),
      documents: [
        './app/graphql/customer-account/*.{ts,tsx,js,jsx}',
        './app/routes/account*.{ts,tsx,js,jsx}',
        './app/lib/address-book-graphql.{ts,tsx}',
      ],
    },
  },
};

export default graphqlConfig;
