import type {Route} from './+types/account.reset.$id.$token';
import {redirect, useActionData, useNavigation, Form, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {
  resetCustomerPassword,
  setCustomerAccessToken,
  validatePassword,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Set New Password',
    description: 'Choose a new password for your Hy-lee account.',
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

export async function action({request, context, params}: Route.ActionArgs) {
  const {id, token} = params;
  const formData = await request.formData();
  const password = (formData.get('password') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

  const passwordError = validatePassword(password);
  if (passwordError) return {errors: {password: passwordError}};
  if (password !== confirmPassword) {
    return {errors: {confirmPassword: 'Passwords do not match.'}};
  }

  const result = await resetCustomerPassword(
    context.storefront,
    id!,
    token!,
    password,
  );

  if ('errors' in result) {
    return {errors: {general: result.errors[0].message}};
  }

  setCustomerAccessToken(
    context.session,
    result.data.accessToken,
    result.data.expiresAt,
  );

  return redirect('/account', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ResetPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <AuthLayout
      gradient={{from: '#2ac864', to: '#2699a6'}}
      tagline="Create a new password"
      description="Your new password must be at least 8 characters."
      features={[
        {text: 'At least 8 characters'},
        {text: 'At least 1 number'},
        {text: 'At least 1 special character'},
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827]">
            Set New Password
          </h1>
          <p className="text-[15px] text-[#6b7280]">
            Choose a strong password for your account.
          </p>
        </div>

        {actionData?.errors?.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionData.errors.general}
          </div>
        )}

        <Form method="post" className="flex flex-col gap-4">
          <FormField
            label="New password"
            name="password"
            placeholder="Min. 8 characters"
            type="password"
            autoComplete="new-password"
            error={actionData?.errors?.password}
          />
          <FormField
            label="Confirm new password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            type="password"
            autoComplete="new-password"
            error={actionData?.errors?.confirmPassword}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save Password'}
          </button>
        </Form>

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
