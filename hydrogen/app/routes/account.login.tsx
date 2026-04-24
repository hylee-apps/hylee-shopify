import type {Route} from './+types/account.login';
import {redirect, useActionData, useNavigation, Form, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {SocialLoginButtons} from '~/components/auth/SocialLoginButtons';
import {
  loginCustomer,
  setCustomerAccessToken,
  isCustomerLoggedIn,
  validateEmail,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Sign In',
    description: 'Sign in to your Hy-lee account.',
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
  const password = (formData.get('password') as string) ?? '';

  const emailError = validateEmail(email);
  if (emailError) return {errors: {email: emailError}};
  if (!password) return {errors: {password: 'Password is required.'}};

  const result = await loginCustomer(context.storefront, email, password);
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

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <AuthLayout
      gradient={{from: '#2ac864', to: '#2699a6'}}
      tagline="Welcome back"
      description="Sign in to manage your orders, wishlist, and more."
      features={[
        {text: 'Track your orders in real time'},
        {text: 'Save items to your wishlist'},
        {text: 'Faster checkout with saved addresses'},
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827]">
            Sign In
          </h1>
          <p className="text-[15px] text-[#6b7280]">
            Don&apos;t have an account?{' '}
            <Link
              to="/account/register"
              className="font-medium text-secondary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>

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
          <div className="flex flex-col gap-2">
            <FormField
              label="Password"
              name="password"
              placeholder="Your password"
              type="password"
              autoComplete="current-password"
              error={actionData?.errors?.password}
            />
            <div className="flex justify-end">
              <Link
                to="/account/recover"
                className="text-sm text-secondary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </Form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <SocialLoginButtons mode="signin" />
      </div>
    </AuthLayout>
  );
}
