import {getSeoMeta} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Lock} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export function meta() {
  return getSeoMeta({
    title: 'Sign In Required — Hy-lee',
    description: 'You must be signed in to access this page.',
  });
}

export default function AccountUnavailablePage() {
  const {t} = useTranslation();

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-full bg-secondary/10">
          <Lock size={36} className="text-secondary" />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-light leading-[42px] text-gray-900">
            {t('unavailable.heading', 'Sign In Required')}
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500">
            {t(
              'unavailable.body',
              'You need to be signed in to access this page. Please sign in or create an account to continue.',
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Link
            to="/account/login"
            className="flex flex-1 items-center justify-center rounded-[8px] bg-secondary px-6 py-[13px] text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {t('unavailable.signIn', 'Sign In')}
          </Link>
          <Link
            to="/account/register"
            className="flex flex-1 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-6 py-[13px] text-[15px] font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            {t('unavailable.register', 'Create Account')}
          </Link>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="text-[13px] text-gray-400 transition-colors hover:text-secondary"
        >
          {t('unavailable.backHome', '← Back to Home')}
        </Link>
      </div>
    </div>
  );
}
