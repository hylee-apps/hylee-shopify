import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.register';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {SocialLoginButtons} from '~/components/auth/SocialLoginButtons';
import {
  isCustomerLoggedIn,
  registerCustomer,
  loginCustomer,
  setCustomerAccessToken,
  validateRegistration,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Create Account',
    description: 'Create your Hy-lee account.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  if (isCustomerLoggedIn(context.session)) {
    return redirect('/account');
  }
  return {};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const firstName = (formData.get('firstName') as string) ?? '';
  const lastName = (formData.get('lastName') as string) ?? '';
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';

  // Validate all fields
  const errors = validateRegistration(formData);
  if (Object.keys(errors).length) {
    return Response.json(
      {errors, fields: {firstName, lastName, email}},
      {status: 400},
    );
  }

  // Create customer
  const result = await registerCustomer(context.storefront, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    password,
  });

  if ('errors' in result) {
    const shopifyErrors: Record<string, string> = {};
    for (const err of result.errors) {
      if (err.code === 'TAKEN' || err.code === 'CUSTOMER_DISABLED') {
        shopifyErrors.form =
          'An account with this email already exists. Check your inbox for an activation email, or try signing in.';
      } else if (err.field?.includes('email')) {
        shopifyErrors.email = err.message;
      } else if (err.field?.includes('password')) {
        shopifyErrors.password = err.message;
      } else {
        shopifyErrors.form =
          err.message || 'Registration failed. Please try again.';
      }
    }
    return Response.json(
      {errors: shopifyErrors, fields: {firstName, lastName, email}},
      {status: 400},
    );
  }

  // Auto-login after registration
  const loginResult = await loginCustomer(context.storefront, email, password);
  if ('errors' in loginResult) {
    // Registration succeeded but auto-login failed — redirect to login page
    return redirect('/account/login');
  }

  setCustomerAccessToken(
    context.session,
    loginResult.data.accessToken,
    loginResult.data.expiresAt,
  );

  return redirect('/account');
}

// ============================================================================
// Register Features (left panel)
// ============================================================================

const REGISTER_FEATURES = [
  {text: 'Save shipping addresses'},
  {text: 'Secure payment storage'},
  {text: 'Order history tracking'},
  {text: 'Wishlist and favorites'},
];

// ============================================================================
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
  fields?: Record<string, string>;
}

export default function RegisterPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;
  const fields = actionData?.fields;

  return (
    <AuthLayout
      gradient={{from: 'rgb(64, 40, 60)', to: 'rgb(38, 153, 166)'}}
      tagline="Join Hylee Today"
      description="Create an account for a personalized shopping experience."
      features={REGISTER_FEATURES}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            Create Account
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            Fill in your details to get started
          </p>
        </div>

        {/* Social Login */}
        <SocialLoginButtons mode="signup" />

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[13px] text-[#9ca3af]">
            or sign up with email
          </span>
          <div className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        {/* Form-level error */}
        {errors?.form && (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.form}
          </div>
        )}

        {/* Form */}
        <Form method="post" className="flex flex-col gap-5">
          {/* First + Last Name row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <FormField
                label="First Name"
                name="firstName"
                placeholder="John"
                defaultValue={fields?.firstName}
                error={errors?.firstName}
                autoComplete="given-name"
              />
            </div>
            <div className="flex-1">
              <FormField
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                defaultValue={fields?.lastName}
                error={errors?.lastName}
                autoComplete="family-name"
              />
            </div>
          </div>

          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={fields?.email}
            error={errors?.email}
            autoComplete="email"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password (min 8 characters)"
            error={errors?.password}
            hint="Must contain at least 8 characters, 1 number, and 1 special character"
            autoComplete="new-password"
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            error={errors?.confirmPassword}
            autoComplete="new-password"
          />

          {/* Terms checkbox */}
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                name="acceptsTerms"
                value="true"
                className="mt-[3px] size-[13px] shrink-0 rounded-[2.5px] border-[#767676] accent-secondary"
              />
              <span className="text-[14px] leading-[19.6px] text-[#4b5563]">
                I agree to the{' '}
                <Link
                  to="/policies/terms-of-service"
                  className="text-secondary no-underline hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/policies/privacy-policy"
                  className="text-secondary no-underline hover:underline"
                >
                  Privacy Policy
                </Link>
                . I consent to receiving marketing emails.
              </span>
            </label>
            {errors?.acceptsTerms && (
              <p className="ml-5 text-xs text-red-500">{errors.acceptsTerms}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
          Already have an account?{' '}
          <Link
            to="/account/login"
            className="font-medium text-secondary no-underline hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
