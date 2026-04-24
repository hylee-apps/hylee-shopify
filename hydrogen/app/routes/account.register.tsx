import type {Route} from './+types/account.register';
import {redirect, useActionData, useNavigation, Form, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {SocialLoginButtons} from '~/components/auth/SocialLoginButtons';
import {
  registerCustomer,
  loginCustomer,
  setCustomerAccessToken,
  isCustomerLoggedIn,
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
  const validationErrors = validateRegistration(formData);
  if (Object.keys(validationErrors).length > 0) {
    return {errors: validationErrors};
  }

  const firstName = (formData.get('firstName') as string) ?? '';
  const lastName = (formData.get('lastName') as string) ?? '';
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';
  const acceptsMarketing = formData.get('acceptsMarketing') === 'on';

  const registerResult = await registerCustomer(context.storefront, {
    firstName,
    lastName,
    email,
    password,
    acceptsMarketing,
  });

  if ('errors' in registerResult) {
    return {errors: {general: registerResult.errors[0].message}};
  }

  // Auto-login after successful registration
  const loginResult = await loginCustomer(context.storefront, email, password);
  if ('data' in loginResult) {
    setCustomerAccessToken(
      context.session,
      loginResult.data.accessToken,
      loginResult.data.expiresAt,
    );
  }

  return redirect('/account', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

// ============================================================================
// Component
// ============================================================================

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors ?? {};

  return (
    <AuthLayout
      gradient={{from: '#2699a6', to: '#2ac864'}}
      tagline="Join Hy-lee"
      description="Create an account to unlock exclusive deals and faster checkout."
      features={[
        {text: 'Exclusive member-only discounts'},
        {text: 'Order tracking and history'},
        {text: 'Easy returns and refunds'},
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827]">
            Create Account
          </h1>
          <p className="text-[15px] text-[#6b7280]">
            Already have an account?{' '}
            <Link
              to="/account/login"
              className="font-medium text-secondary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {errors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <Form method="post" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First name"
              name="firstName"
              placeholder="Jane"
              autoComplete="given-name"
              error={errors.firstName}
            />
            <FormField
              label="Last name"
              name="lastName"
              placeholder="Smith"
              autoComplete="family-name"
              error={errors.lastName}
            />
          </div>
          <FormField
            label="Email address"
            name="email"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            error={errors.email}
          />
          <FormField
            label="Password"
            name="password"
            placeholder="Min. 8 characters"
            type="password"
            autoComplete="new-password"
            error={errors.password}
            hint="Must contain at least 1 number and 1 special character."
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="acceptsMarketing"
                className="mt-0.5 size-4 rounded border-gray-300 text-secondary accent-secondary"
              />
              <span className="text-[14px] leading-[20px] text-[#374151]">
                Send me deals and promotions from Hy-lee
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="acceptsTerms"
                className="mt-0.5 size-4 rounded border-gray-300 accent-secondary"
              />
              <span className="text-[14px] leading-[20px] text-[#374151]">
                I agree to the{' '}
                <Link
                  to="/policies/terms-of-service"
                  className="text-secondary hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/policies/privacy-policy"
                  className="text-secondary hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptsTerms && (
              <p className="text-xs text-red-500">{errors.acceptsTerms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </Form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <SocialLoginButtons mode="signup" />
      </div>
    </AuthLayout>
  );
}
