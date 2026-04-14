import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
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
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
  success?: boolean;
  email?: string;
}

export default function RecoverPage() {
  const {t} = useTranslation();
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;
  const success = actionData?.success;

  const recoverFeatures = [
    {text: t('auth.recover.features.trackOrders')},
    {text: t('auth.recover.features.easyReturns')},
    {text: t('auth.recover.features.fasterCheckout')},
    {text: t('auth.recover.features.exclusiveOffers')},
  ];

  return (
    <AuthLayout
      gradient={{from: 'rgb(66, 133, 244)', to: 'rgb(43, 217, 168)'}}
      tagline={t('auth.recover.tagline')}
      description={t('auth.recover.description')}
      features={recoverFeatures}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            {t('auth.recover.title')}
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            {t('auth.recover.subtitle')}
          </p>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
              {t('auth.recover.success', {email: actionData?.email})}
            </div>
            <Link
              to="/account/login"
              className="text-[15px] font-medium text-secondary no-underline hover:underline"
            >
              {t('auth.recover.backToSignIn')}
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <Form method="post" className="flex flex-col gap-5">
              <FormField
                label={t('auth.recover.emailLabel')}
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
                {isSubmitting
                  ? t('auth.recover.submitting')
                  : t('auth.recover.submitButton')}
              </button>
            </Form>

            {/* Footer */}
            <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
              {t('auth.recover.rememberPassword')}{' '}
              <Link
                to="/account/login"
                className="font-medium text-secondary no-underline hover:underline"
              >
                {t('auth.recover.signIn')}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
