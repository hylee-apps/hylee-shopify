// ============================================================================
// api.reviews — Product Review Submission
// ============================================================================
//
// Requires the Admin API app to have `write_products` scope in addition to the
// existing `write_customers` scope so that product metafields can be written.
// Update the app in the Shopify Dev Dashboard if needed:
//   Partners → Apps → [your app] → Configuration → Admin API scopes
//   Add: read_products, write_products
//
// Reviews are stored as a JSON array in a product metafield:
//   namespace: "custom"
//   key:       "reviews_json"
//   type:      "json"
//
// Each review object shape:
//   { id, customerId, initials, name, face (1|2|3), body, createdAt }
// ============================================================================

import type {Route} from './+types/api.reviews';
import {getCustomerAccessToken, isCustomerLoggedIn} from '~/lib/customer-auth';
import {adminApi, type AdminEnv} from '~/lib/admin-api';

// ============================================================================
// Types
// ============================================================================

export interface ProductReview {
  id: string;
  customerId: string;
  initials: string;
  name: string;
  /** 1 = Happy, 2 = Neutral, 3 = Unhappy */
  face: 1 | 2 | 3;
  body: string;
  createdAt: string;
}

// ============================================================================
// GraphQL
// ============================================================================

const CUSTOMER_GID_QUERY = `#graphql
  query ReviewCustomerGid($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
    }
  }
` as const;

const PRODUCT_REVIEWS_QUERY = `
  query ProductReviewsMetafield($productId: ID!) {
    product(id: $productId) {
      reviewsMeta: metafield(namespace: "custom", key: "reviews_json") {
        value
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `
  mutation ReviewsMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id }
      userErrors { field message }
    }
  }
`;

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  if (!isCustomerLoggedIn(context.session)) {
    return Response.json(
      {error: 'You must be logged in to write a review.'},
      {status: 401},
    );
  }

  const formData = await request.formData();
  const productId = (formData.get('productId') as string | null)?.trim();
  const faceRaw = formData.get('face') as string | null;
  const body = (formData.get('body') as string | null)?.trim();

  const face = faceRaw ? (parseInt(faceRaw, 10) as 1 | 2 | 3) : null;

  if (!productId || !body || face == null || ![1, 2, 3].includes(face)) {
    return Response.json({error: 'Missing required fields.'}, {status: 400});
  }

  if (body.length > 1000) {
    return Response.json(
      {error: 'Review must be 1000 characters or less.'},
      {status: 400},
    );
  }

  // Resolve customer identity
  const token = getCustomerAccessToken(context.session)!;
  const {customer} = (await context.storefront.query(CUSTOMER_GID_QUERY, {
    variables: {customerAccessToken: token},
  })) as {
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  };

  if (!customer) {
    return Response.json(
      {error: 'Could not load customer data.'},
      {status: 400},
    );
  }

  const firstName = customer.firstName ?? '';
  const lastName = customer.lastName ?? '';
  const initials =
    `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
  const displayName = lastName
    ? `${firstName} ${lastName[0]}.`
    : firstName || 'Anonymous';

  // Read existing reviews via Admin API
  const env = context.env as unknown as AdminEnv;
  let existingReviews: ProductReview[] = [];

  try {
    const data = await adminApi<{
      product: {reviewsMeta: {value: string} | null} | null;
    }>(env, PRODUCT_REVIEWS_QUERY, {productId});

    const raw = data.product?.reviewsMeta?.value;
    if (raw) {
      existingReviews = JSON.parse(raw) as ProductReview[];
    }
  } catch {
    // No existing reviews or read failed — start fresh
  }

  // Prevent duplicate reviews from the same customer
  const alreadyReviewed = existingReviews.some(
    (r) => r.customerId === customer.id,
  );
  if (alreadyReviewed) {
    return Response.json(
      {error: 'You have already reviewed this product.'},
      {status: 409},
    );
  }

  const newReview: ProductReview = {
    id: crypto.randomUUID(),
    customerId: customer.id,
    initials,
    name: displayName,
    face,
    body,
    createdAt: new Date().toISOString(),
  };

  const updatedReviews = [newReview, ...existingReviews];

  // Write back via Admin API
  const writeResult = await adminApi<{
    metafieldsSet: {
      metafields: Array<{id: string}>;
      userErrors: Array<{field: string[]; message: string}>;
    };
  }>(env, METAFIELDS_SET_MUTATION, {
    metafields: [
      {
        ownerId: productId,
        namespace: 'custom',
        key: 'reviews_json',
        value: JSON.stringify(updatedReviews),
        type: 'json',
      },
    ],
  });

  const userErrors = writeResult.metafieldsSet?.userErrors;
  if (userErrors?.length) {
    return Response.json(
      {error: userErrors.map((e) => e.message).join(', ')},
      {status: 500},
    );
  }

  return Response.json({success: true, review: newReview});
}
