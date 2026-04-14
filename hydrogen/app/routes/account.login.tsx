import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.login';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {SocialLoginButtons} from '~/components/auth/SocialLoginButtons';
import {
  isCustomerLoggedIn,
  loginCustomer,
  setCustomerAccessToken,
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

  // Validate
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Password is required.';

  if (Object.keys(errors).length) {
    return Response.json({errors, email}, {status: 400});
  }

  // Attempt login
  const result = await loginCustomer(context.storefront, email, password);

  if ('errors' in result) {
    const message =
      result.errors[0]?.code === 'UNIDENTIFIED_CUSTOMER'
        ? 'Invalid email or password. Please try again.'
        : (result.errors[0]?.message ?? 'Login failed. Please try again.');
    return Response.json({errors: {form: message}, email}, {status: 400});
  }

  // Set session token and redirect
  setCustomerAccessToken(
    context.session,
    result.data.accessToken,
    result.data.expiresAt,
  );

  return redirect('/account');
}

// ============================================================================
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
  email?: string;
}

export default function LoginPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;
  const {t} = useTranslation();

  const loginFeatures = [
    {text: t('auth.login.features.trackOrders')},
    {text: t('auth.login.features.easyReturns')},
    {text: t('auth.login.features.fasterCheckout')},
    {text: t('auth.login.features.exclusiveOffers')},
  ];

  return (
    <AuthLayout
      gradient={{from: 'rgb(66, 133, 244)', to: 'rgb(43, 217, 168)'}}
      tagline={t('auth.login.tagline')}
      description={t('auth.login.description')}
      features={loginFeatures}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            {t('auth.login.title')}
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Social Login */}
        <SocialLoginButtons mode="signin" />

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[13px] text-[#9ca3af]">
            {t('auth.login.orSignInWithEmail')}
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
          <FormField
            label={t('auth.login.emailLabel')}
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={actionData?.email}
            error={errors?.email}
            autoComplete="email"
          />

          <FormField
            label={t('auth.login.passwordLabel')}
            name="password"
            type="password"
            placeholder={t('auth.login.passwordLabel')}
            error={errors?.password}
            autoComplete="current-password"
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                className="size-4 rounded-[2.5px] border-[#767676] accent-secondary"
              />
              <span className="text-[14px] text-[#4b5563]">
                {t('auth.login.rememberMe')}
              </span>
            </label>
            <Link
              to="/account/recover"
              className="text-[14px] font-medium text-secondary no-underline hover:underline"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-[#56972d] text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting
              ? t('auth.login.submitting')
              : t('auth.login.submitButton')}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
          {t('auth.login.noAccount')}{' '}
          <Link
            to="/account/register"
            className="font-medium text-secondary no-underline hover:underline"
          >
            {t('auth.login.createAccount')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
