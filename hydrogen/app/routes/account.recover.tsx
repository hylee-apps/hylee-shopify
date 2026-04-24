import type {Route} from './+types/account.recover';
import {useActionData, useNavigation, Form, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {recoverCustomer, validateEmail} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Reset Password',
    description: 'Request a password reset for your Hy-lee account.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  return {};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = (formData.get('email') as string) ?? '';

  const emailError = validateEmail(email);
  if (emailError) return {errors: {email: emailError}, success: false};

  const result = await recoverCustomer(context.storefront, email);
  if (!result.success) {
    return {
      errors: {general: result.errors?.[0]?.message ?? 'Something went wrong.'},
      success: false,
    };
  }

  return {success: true, errors: {}};
}

// ============================================================================
// Component
// ============================================================================

export default function RecoverPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const submitted = actionData?.success === true;

  return (
    <AuthLayout
      gradient={{from: '#2699a6', to: '#2ac864'}}
      tagline="Reset your password"
      description="We'll send a reset link to your email address."
      features={[
        {text: 'Secure password reset link'},
        {text: 'Link expires after 24 hours'},
        {text: 'Contact support if you need help'},
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827]">
            Forgot Password?
          </h1>
          <p className="text-[15px] text-[#6b7280]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <p className="font-medium">Check your inbox</p>
            <p className="mt-1">
              If an account exists for that email, a reset link has been sent.
            </p>
          </div>
        ) : (
          <>
            {actionData?.errors?.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionData.errors.general}
              </div>
            )}

            <Form method="post" className="flex flex-col gap-4">
              <FormField
                label="Email address"
                name="email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                error={actionData?.errors?.email}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </Form>
          </>
        )}

        <div className="text-center">
          <Link
            to="/account/login"
            className="text-sm font-medium text-secondary hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
