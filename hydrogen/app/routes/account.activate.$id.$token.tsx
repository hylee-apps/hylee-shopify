import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.activate.$id.$token';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {
  isCustomerLoggedIn,
  activateCustomer,
  setCustomerAccessToken,
  validatePassword,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Activate Account',
    description: 'Activate your Hy-lee account and set your password.',
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

export async function action({request, context, params}: Route.ActionArgs) {
  const {id, token} = params;
  const formData = await request.formData();
  const password = (formData.get('password') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

  // Validate
  const errors: Record<string, string> = {};
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(errors).length) {
    return Response.json({errors}, {status: 400});
  }

  // Activate account via Storefront API
  const result = await activateCustomer(
    context.storefront,
    id!,
    token!,
    password,
  );

  if ('errors' in result) {
    const message =
      result.errors[0]?.message ??
      'Account activation failed. The link may have expired.';
    return Response.json({errors: {form: message}}, {status: 400});
  }

  // Auto-login with the new token
  setCustomerAccessToken(
    context.session,
    result.data.accessToken,
    result.data.expiresAt,
  );

  return redirect('/account');
}

// ============================================================================
// Features (left panel)
// ============================================================================

const ACTIVATE_FEATURES = [
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
}

export default function ActivateAccountPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;

  return (
    <AuthLayout
      gradient={{from: 'rgb(64, 40, 60)', to: 'rgb(38, 153, 166)'}}
      tagline="Almost There!"
      description="Set your password to activate your account and start shopping."
      features={ACTIVATE_FEATURES}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            Activate Your Account
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            Choose a password to complete your account setup.
          </p>
        </div>

        {/* Form-level error */}
        {errors?.form && (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.form}
          </div>
        )}

        {/* Form */}
        <Form method="post" className="flex flex-col gap-5">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Activating...' : 'Activate Account'}
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
