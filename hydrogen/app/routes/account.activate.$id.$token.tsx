import {Form, Link, useActionData, useNavigation} from 'react-router';
import {useTranslation} from 'react-i18next';
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
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
}

export default function ActivateAccountPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const {t} = useTranslation('common');
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;

  const activateFeatures = [
    {text: t('activate.features.saveAddresses')},
    {text: t('activate.features.securePayment')},
    {text: t('activate.features.orderHistory')},
    {text: t('activate.features.wishlist')},
  ];

  return (
    <AuthLayout
      gradient={{from: 'rgb(64, 40, 60)', to: 'rgb(38, 153, 166)'}}
      tagline={t('activate.tagline')}
      description={t('activate.taglineDescription')}
      features={activateFeatures}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            {t('activate.heading')}
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            {t('activate.subheading')}
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
            label={t('activate.password.label')}
            name="password"
            type="password"
            placeholder={t('activate.password.placeholder')}
            error={errors?.password}
            hint={t('activate.password.hint')}
            autoComplete="new-password"
          />

          <FormField
            label={t('activate.confirmPassword.label')}
            name="confirmPassword"
            type="password"
            placeholder={t('activate.confirmPassword.placeholder')}
            error={errors?.confirmPassword}
            autoComplete="new-password"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? t('activate.submitting') : t('activate.submit')}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
          {t('activate.footer.alreadyHaveAccount')}{' '}
          <Link
            to="/account/login"
            className="font-medium text-secondary no-underline hover:underline"
          >
            {t('activate.footer.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
