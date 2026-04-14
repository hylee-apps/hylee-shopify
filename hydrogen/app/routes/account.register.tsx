import {Form, Link, useActionData, useNavigation} from 'react-router';
import {redirect} from 'react-router';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Route} from './+types/account.register';
import {AuthLayout} from '~/components/auth/AuthLayout';
import {FormField} from '~/components/auth/FormField';
import {SocialLoginButtons} from '~/components/auth/SocialLoginButtons';
import {
  isCustomerLoggedIn,
  registerCustomer,
  loginCustomer,
  setCustomerAccessToken,
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
  const firstName = (formData.get('firstName') as string) ?? '';
  const lastName = (formData.get('lastName') as string) ?? '';
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';

  // Validate all fields
  const errors = validateRegistration(formData);
  if (Object.keys(errors).length) {
    return Response.json(
      {errors, fields: {firstName, lastName, email}},
      {status: 400},
    );
  }

  // Create customer
  const result = await registerCustomer(context.storefront, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    password,
  });

  if ('errors' in result) {
    const shopifyErrors: Record<string, string> = {};
    for (const err of result.errors) {
      if (err.code === 'TAKEN' || err.code === 'CUSTOMER_DISABLED') {
        shopifyErrors.form =
          'An account with this email already exists. Check your inbox for an activation email, or try signing in.';
      } else if (err.field?.includes('email')) {
        shopifyErrors.email = err.message;
      } else if (err.field?.includes('password')) {
        shopifyErrors.password = err.message;
      } else {
        shopifyErrors.form =
          err.message || 'Registration failed. Please try again.';
      }
    }
    return Response.json(
      {errors: shopifyErrors, fields: {firstName, lastName, email}},
      {status: 400},
    );
  }

  // Auto-login after registration
  const loginResult = await loginCustomer(context.storefront, email, password);
  if ('errors' in loginResult) {
    // Registration succeeded but auto-login failed — redirect to login page
    return redirect('/account/login');
  }

  setCustomerAccessToken(
    context.session,
    loginResult.data.accessToken,
    loginResult.data.expiresAt,
  );

  return redirect('/account');
}

// ============================================================================
// Component
// ============================================================================

interface ActionData {
  errors?: Record<string, string>;
  fields?: Record<string, string>;
}

export default function RegisterPage() {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors;
  const fields = actionData?.fields;
  const {t} = useTranslation();

  const registerFeatures = [
    {text: t('auth.register.features.saveAddresses')},
    {text: t('auth.register.features.securePayment')},
    {text: t('auth.register.features.orderHistory')},
    {text: t('auth.register.features.wishlist')},
  ];

  return (
    <AuthLayout
      gradient={{from: 'rgb(64, 40, 60)', to: 'rgb(38, 153, 166)'}}
      tagline={t('auth.register.tagline')}
      description={t('auth.register.description')}
      features={registerFeatures}
    >
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="text-center text-[28px] font-light text-[#111827]">
            {t('auth.register.title')}
          </h1>
          <p className="text-center text-[15px] text-[#6b7280]">
            {t('auth.register.subtitle')}
          </p>
        </div>

        {/* Social Login */}
        <SocialLoginButtons mode="signup" />

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[13px] text-[#9ca3af]">
            {t('auth.register.orSignUpWithEmail')}
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
          {/* First + Last Name row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <FormField
                label={t('auth.register.firstNameLabel')}
                name="firstName"
                placeholder="John"
                defaultValue={fields?.firstName}
                error={errors?.firstName}
                autoComplete="given-name"
              />
            </div>
            <div className="flex-1">
              <FormField
                label={t('auth.register.lastNameLabel')}
                name="lastName"
                placeholder="Doe"
                defaultValue={fields?.lastName}
                error={errors?.lastName}
                autoComplete="family-name"
              />
            </div>
          </div>

          <FormField
            label={t('auth.register.emailLabel')}
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={fields?.email}
            error={errors?.email}
            autoComplete="email"
          />

          <FormField
            label={t('auth.register.passwordLabel')}
            name="password"
            type="password"
            placeholder={t('auth.register.passwordPlaceholder')}
            error={errors?.password}
            hint={t('auth.register.passwordHint')}
            autoComplete="new-password"
          />

          <FormField
            label={t('auth.register.confirmPasswordLabel')}
            name="confirmPassword"
            type="password"
            placeholder={t('auth.register.confirmPasswordLabel')}
            error={errors?.confirmPassword}
            autoComplete="new-password"
          />

          {/* Terms checkbox */}
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                name="acceptsTerms"
                value="true"
                className="mt-[3px] size-[13px] shrink-0 rounded-[2.5px] border-[#767676] accent-secondary"
              />
              <span className="text-[14px] leading-[19.6px] text-[#4b5563]">
                {t('auth.register.termsConsent')
                  .split(t('auth.register.termsOfService'))
                  .reduce<React.ReactNode[]>((acc, part, i) => {
                    if (i === 0) {
                      return [
                        part,
                        <Link
                          key="terms"
                          to="/policies/terms-of-service"
                          className="text-secondary no-underline hover:underline"
                        >
                          {t('auth.register.termsOfService')}
                        </Link>,
                      ];
                    }
                    const [before, after] = part.split(
                      t('auth.register.privacyPolicy'),
                    );
                    return [
                      ...acc,
                      before,
                      <Link
                        key="privacy"
                        to="/policies/privacy-policy"
                        className="text-secondary no-underline hover:underline"
                      >
                        {t('auth.register.privacyPolicy')}
                      </Link>,
                      after,
                    ];
                  }, [])}
              </span>
            </label>
            {errors?.acceptsTerms && (
              <p className="ml-5 text-xs text-red-500">{errors.acceptsTerms}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[48px] w-full rounded-[8px] bg-secondary text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting
              ? t('auth.register.submitting')
              : t('auth.register.submitButton')}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center text-[15px] text-[#6b7280]">
          {t('auth.register.hasAccount')}{' '}
          <Link
            to="/account/login"
            className="font-medium text-secondary no-underline hover:underline"
          >
            {t('auth.register.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
