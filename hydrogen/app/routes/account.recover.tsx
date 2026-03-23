import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.recover';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {
  isCustomerLoggedIn,
  recoverCustomer,
  validateEmail,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Reset Password',
    description: 'Reset your Hy-lee account password.',
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
  const email = (formData.get('email') as string) ?? '';

  const emailError = validateEmail(email);
  if (emailError) {
    return Response.json({errors: {email: emailError}, email}, {status: 400});
  }

  // Always show success to prevent email enumeration
  await recoverCustomer(context.storefront, email).catch(() => {
    // Silently ignore errors
  });

  return Response.json({success: true, email});
}

// ============================================================================
// Recover Features (reuse login features)
// ============================================================================

const RECOVER_FEATURES = [
  {text: 'Track orders in real-time'},
  {text: 'Easy returns and exchanges'},
  {text: 'Faster checkout experience'},
  {text: 'Exclusive offers and discounts'},
];

// ============================================================================
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
  success?: boolean;
  email?: string;
}

export default function RecoverPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;
  const success = actionData?.success;

  return (
    <AuthLayout
      gradient={{from: 'rgb(66, 133, 244)', to: 'rgb(43, 217, 168)'}}
      tagline="Welcome Back"
      description="Sign in to access your orders, track deliveries, and manage your account."
      features={RECOVER_FEATURES}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            Reset Password
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
              If an account exists for <strong>{actionData?.email}</strong>,
              you&apos;ll receive a password reset link shortly.
            </div>
            <Link
              to="/account/login"
              className="text-[15px] font-medium text-secondary no-underline hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <Form method="post" className="flex flex-col gap-5">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                defaultValue={actionData?.email}
                error={errors?.email}
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </Form>

            {/* Footer */}
            <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
              Remember your password?{' '}
              <Link
                to="/account/login"
                className="font-medium text-secondary no-underline hover:underline"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
