// ============================================================================
// GraphQL Mutations (Storefront API)
// ============================================================================

const CUSTOMER_ACCESS_TOKEN_CREATE = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const CUSTOMER_CREATE = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const CUSTOMER_RECOVER = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const CUSTOMER_RESET = `#graphql
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const CUSTOMER_ACTIVATE = `#graphql
  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {
    customerActivate(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

const CUSTOMER_ACCESS_TOKEN_DELETE = `#graphql
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors {
        field
        message
      }
    }
  }
` as const;

// ============================================================================
// GraphQL Queries (Storefront API)
// ============================================================================

const CUSTOMER_QUERY = `#graphql
  query CustomerDetails($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      createdAt
      defaultAddress {
        id
        formatted
      }
    }
  }
` as const;

// ============================================================================
// Types
// ============================================================================

// Use minimal interfaces to avoid coupling to Hydrogen's complex generics.
// The session interface matches AppSession's public API (get/set/unset).
interface SessionLike {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  unset: (key: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StorefrontClient = {
  mutate: (...args: any[]) => Promise<any>;
  query: (...args: any[]) => Promise<any>;
};

interface LoginResult {
  accessToken: string;
  expiresAt: string;
}

interface LoginError {
  code: string;
  field: string[];
  message: string;
}

export interface StorefrontCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  defaultAddress: {id: string; formatted: string[]} | null;
}

interface RegisterResult {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ============================================================================
// Session Helpers
// ============================================================================

const SESSION_KEY_TOKEN = 'customerAccessToken';
const SESSION_KEY_EXPIRES = 'customerAccessTokenExpiresAt';

export function getCustomerAccessToken(session: SessionLike): string | null {
  const token = session.get(SESSION_KEY_TOKEN);
  const expiresAt = session.get(SESSION_KEY_EXPIRES);

  if (!token) return null;

  // Check if token has expired
  if (expiresAt && new Date(expiresAt) < new Date()) {
    session.unset(SESSION_KEY_TOKEN);
    session.unset(SESSION_KEY_EXPIRES);
    return null;
  }

  return token;
}

export function setCustomerAccessToken(
  session: SessionLike,
  accessToken: string,
  expiresAt: string,
) {
  session.set(SESSION_KEY_TOKEN, accessToken);
  session.set(SESSION_KEY_EXPIRES, expiresAt);
}

export function clearCustomerAccessToken(session: SessionLike) {
  session.unset(SESSION_KEY_TOKEN);
  session.unset(SESSION_KEY_EXPIRES);
}

export function isCustomerLoggedIn(session: SessionLike): boolean {
  return getCustomerAccessToken(session) !== null;
}

/**
 * Require authentication — returns the access token or redirects to the
 * sign-in-required screen. Use in loaders/actions: `const token = requireAuth(session);`
 */
export function requireAuth(session: SessionLike): string {
  const token = getCustomerAccessToken(session);
  if (!token) {
    throw new Response(null, {
      status: 302,
      headers: {Location: '/account/unavailable'},
    });
  }
  return token;
}

/**
 * Fetch authenticated customer data via Storefront API.
 */
export async function getAuthenticatedCustomer(
  storefront: StorefrontClient,
  session: SessionLike,
) {
  const token = requireAuth(session);
  const {customer} = (await storefront.query(CUSTOMER_QUERY, {
    variables: {customerAccessToken: token},
  })) as {customer: StorefrontCustomer | null};

  if (!customer) {
    // Token is invalid or expired — clear it and redirect to login
    clearCustomerAccessToken(session);
    throw new Response(null, {
      status: 302,
      headers: {Location: '/account/login'},
    });
  }

  return customer;
}

// ============================================================================
// Auth Operations
// ============================================================================

export async function loginCustomer(
  storefront: StorefrontClient,
  email: string,
  password: string,
): Promise<{data: LoginResult} | {errors: LoginError[]}> {
  const result = await storefront.mutate(CUSTOMER_ACCESS_TOKEN_CREATE, {
    variables: {input: {email, password}},
  });
  const {customerAccessTokenCreate} = result as {
    customerAccessTokenCreate: {
      customerAccessToken: {accessToken: string; expiresAt: string} | null;
      customerUserErrors: LoginError[];
    };
  };

  const errors = customerAccessTokenCreate?.customerUserErrors;
  if (errors?.length) {
    return {errors};
  }

  const token = customerAccessTokenCreate?.customerAccessToken;
  if (!token) {
    return {
      errors: [
        {
          code: 'UNKNOWN',
          field: [],
          message: 'Login failed. Please try again.',
        },
      ],
    };
  }

  return {data: token};
}

export async function registerCustomer(
  storefront: StorefrontClient,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptsMarketing?: boolean;
  },
): Promise<{data: RegisterResult} | {errors: LoginError[]}> {
  const registerResult = await storefront.mutate(CUSTOMER_CREATE, {
    variables: {input},
  });
  const {customerCreate} = registerResult as {
    customerCreate: {
      customer: RegisterResult['customer'] | null;
      customerUserErrors: LoginError[];
    };
  };

  const errors = customerCreate?.customerUserErrors;
  if (errors?.length) {
    return {errors};
  }

  const customer = customerCreate?.customer;
  if (!customer) {
    return {
      errors: [
        {
          code: 'UNKNOWN',
          field: [],
          message: 'Registration failed. Please try again.',
        },
      ],
    };
  }

  return {data: {customer}};
}

export async function recoverCustomer(
  storefront: StorefrontClient,
  email: string,
): Promise<{success: boolean; errors?: LoginError[]}> {
  const recoverResult = await storefront.mutate(CUSTOMER_RECOVER, {
    variables: {email},
  });
  const {customerRecover} = recoverResult as {
    customerRecover: {
      customerUserErrors: LoginError[];
    };
  };

  const errors = customerRecover?.customerUserErrors;
  if (errors?.length) {
    return {success: false, errors};
  }

  return {success: true};
}

export async function resetCustomerPassword(
  storefront: StorefrontClient,
  customerId: string,
  resetToken: string,
  password: string,
): Promise<{data: LoginResult} | {errors: LoginError[]}> {
  // Shopify expects a global GID for the customer ID
  const gid = customerId.startsWith('gid://')
    ? customerId
    : `gid://shopify/Customer/${customerId}`;

  const result = await storefront.mutate(CUSTOMER_RESET, {
    variables: {
      id: gid,
      input: {resetToken, password},
    },
  });
  const {customerReset} = result as {
    customerReset: {
      customerAccessToken: {accessToken: string; expiresAt: string} | null;
      customerUserErrors: LoginError[];
    };
  };

  const errors = customerReset?.customerUserErrors;
  if (errors?.length) {
    return {errors};
  }

  const token = customerReset?.customerAccessToken;
  if (!token) {
    return {
      errors: [
        {
          code: 'UNKNOWN',
          field: [],
          message: 'Password reset failed. The link may have expired.',
        },
      ],
    };
  }

  return {data: token};
}

export async function activateCustomer(
  storefront: StorefrontClient,
  customerId: string,
  activationToken: string,
  password: string,
): Promise<{data: LoginResult} | {errors: LoginError[]}> {
  const gid = customerId.startsWith('gid://')
    ? customerId
    : `gid://shopify/Customer/${customerId}`;

  const result = await storefront.mutate(CUSTOMER_ACTIVATE, {
    variables: {
      id: gid,
      input: {activationToken, password},
    },
  });
  const {customerActivate} = result as {
    customerActivate: {
      customerAccessToken: {accessToken: string; expiresAt: string} | null;
      customerUserErrors: LoginError[];
    };
  };

  const errors = customerActivate?.customerUserErrors;
  if (errors?.length) {
    return {errors};
  }

  const token = customerActivate?.customerAccessToken;
  if (!token) {
    return {
      errors: [
        {
          code: 'UNKNOWN',
          field: [],
          message: 'Account activation failed. The link may have expired.',
        },
      ],
    };
  }

  return {data: token};
}

export async function deleteCustomerAccessToken(
  storefront: StorefrontClient,
  customerAccessToken: string,
): Promise<void> {
  await storefront.mutate(CUSTOMER_ACCESS_TOKEN_DELETE, {
    variables: {customerAccessToken},
  });
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/\d/.test(password)) return 'Password must contain at least 1 number.';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least 1 special character.';
  }
  return null;
}

export function validateRegistration(
  formData: FormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const acceptsTerms = formData.get('acceptsTerms');

  if (!firstName?.trim()) errors.firstName = 'First name is required.';
  if (!lastName?.trim()) errors.lastName = 'Last name is required.';

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!acceptsTerms)
    errors.acceptsTerms = 'You must agree to the Terms of Service.';

  return errors;
}
