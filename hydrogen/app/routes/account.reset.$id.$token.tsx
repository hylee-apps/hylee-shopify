import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useParams,
} from 'react-router';
import {useTranslation} from 'react-i18next';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.reset.$id.$token';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {
  isCustomerLoggedIn,
  resetCustomerPassword,
  setCustomerAccessToken,
  validatePassword,
} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Reset Password',
    description: 'Set a new password for your Hy-lee account.',
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

  // Reset password via Storefront API
  const result = await resetCustomerPassword(
    context.storefront,
    id!,
    token!,
    password,
  );

  if ('errors' in result) {
    const message =
      result.errors[0]?.message ??
      'Password reset failed. The link may have expired.';
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
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
}

export default function ResetPasswordPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const {t} = useTranslation('common');
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;

  const resetFeatures = [
    {text: t('reset.features.trackOrders')},
    {text: t('reset.features.easyReturns')},
    {text: t('reset.features.fasterCheckout')},
    {text: t('reset.features.exclusiveOffers')},
  ];

  return (
    <AuthLayout
      gradient={{from: 'rgb(66, 133, 244)', to: 'rgb(43, 217, 168)'}}
      tagline={t('reset.tagline')}
      description={t('reset.taglineDescription')}
      features={resetFeatures}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            {t('reset.heading')}
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            {t('reset.subheading')}
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
            label={t('reset.newPassword.label')}
            name="password"
            type="password"
            placeholder={t('reset.newPassword.placeholder')}
            error={errors?.password}
            hint={t('reset.newPassword.hint')}
            autoComplete="new-password"
          />

          <FormField
            label={t('reset.confirmPassword.label')}
            name="confirmPassword"
            type="password"
            placeholder={t('reset.confirmPassword.placeholder')}
            error={errors?.confirmPassword}
            autoComplete="new-password"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? t('reset.submitting') : t('reset.submit')}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
          {t('reset.footer.rememberPassword')}{' '}
          <Link
            to="/account/login"
            className="font-medium text-secondary no-underline hover:underline"
          >
            {t('reset.footer.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
