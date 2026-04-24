import type {Route} from './+types/account.payment-methods';
import {redirect, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Zap,
  EyeOff,
  ShoppingBag,
} from 'lucide-react';

import {cn} from '~/lib/utils';
import {requireAuth} from '~/lib/customer-auth';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Payment Methods',
    description: 'Payment methods and security information on Hy-lee.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  requireAuth(context.session);
  return {};
}

// ============================================================================
// Card brand badges — mirrors pattern from checkout.payment.tsx
// ============================================================================

function CardBadge({label, className}: {label: string; className?: string}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded border px-2 text-[11px] font-bold tracking-wide',
        className,
      )}
    >
      {label}
    </span>
  );
}

// ============================================================================
// Digital wallet row
// ============================================================================

function WalletRow({
  label,
  description,
  badge,
}: {
  label: string;
  description: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex w-[90px] shrink-0 justify-start">{badge}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-gray-800">{label}</span>
        <span className="text-sm leading-relaxed text-text-muted">
          {description}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Security point row
// ============================================================================

function SecurityPoint({
  icon: Icon,
  heading,
  body,
}: {
  icon: React.ElementType;
  heading: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
        <Icon size={18} className="text-secondary" />
      </div>
      <div className="flex flex-col gap-0.5 pt-0.5">
        <span className="text-[15px] font-semibold text-gray-800">
          {heading}
        </span>
        <span className="text-sm leading-relaxed text-text-muted">{body}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PaymentMethodsPage() {
  const {t} = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-[28px] font-light leading-[42px] text-gray-800">
        {t('account.paymentMethods.pageTitle')}
      </h1>

      {/* Accepted Payment Methods */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.paymentMethods.acceptedTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {t('account.paymentMethods.acceptedBody')}
          </p>
        </div>

        <div className="divide-y divide-gray-100 px-6">
          {/* Credit & Debit Cards */}
          <div className="py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {t('account.paymentMethods.cards')}
            </p>
            <div className="flex flex-wrap gap-2">
              <CardBadge
                label="VISA"
                className="border-[#1a1f71]/20 bg-[#1a1f71]/5 text-[#1a1f71]"
              />
              <CardBadge
                label="MC"
                className="border-[#eb001b]/20 bg-[#eb001b]/5 text-[#b91c1c]"
              />
              <CardBadge
                label="AMEX"
                className="border-[#007bc1]/20 bg-[#007bc1]/5 text-[#007bc1]"
              />
              <CardBadge
                label="DISC"
                className="border-[#e65c00]/20 bg-[#e65c00]/5 text-[#c2410c]"
              />
              <CardBadge
                label="DEBIT"
                className="border-gray-300 bg-gray-50 text-gray-600"
              />
              <CardBadge
                label="PREPAID"
                className="border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Digital Wallets */}
          <div className="py-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {t('account.paymentMethods.digitalWallets')}
            </p>
            <div className="divide-y divide-gray-50">
              <WalletRow
                label="Shop Pay"
                description={t('account.paymentMethods.shopPayDesc')}
                badge={
                  <span className="inline-flex h-7 items-center rounded-md bg-[#5a31f4] px-2.5 text-[11px] font-bold tracking-wide text-white">
                    Shop Pay
                  </span>
                }
              />
              <WalletRow
                label="Apple Pay"
                description={t('account.paymentMethods.applePayDesc')}
                badge={
                  <span className="inline-flex h-7 items-center rounded-md bg-black px-2.5 text-[11px] font-semibold tracking-wide text-white">
                    Apple Pay
                  </span>
                }
              />
              <WalletRow
                label="Google Pay"
                description={t('account.paymentMethods.googlePayDesc')}
                badge={
                  <span className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-white px-2.5 text-[11px] font-semibold tracking-wide text-gray-700 shadow-sm">
                    G Pay
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* How Your Payment Is Protected */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.paymentMethods.howItWorksTitle')}
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <SecurityPoint
            icon={Lock}
            heading={t('account.paymentMethods.point1Heading')}
            body={t('account.paymentMethods.point1Body')}
          />
          <SecurityPoint
            icon={ShieldCheck}
            heading={t('account.paymentMethods.point2Heading')}
            body={t('account.paymentMethods.point2Body')}
          />
          <SecurityPoint
            icon={Zap}
            heading={t('account.paymentMethods.point3Heading')}
            body={t('account.paymentMethods.point3Body')}
          />
          <SecurityPoint
            icon={EyeOff}
            heading={t('account.paymentMethods.point4Heading')}
            body={t('account.paymentMethods.point4Body')}
          />
        </div>

        <div className="border-t border-gray-100 px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-secondary/90"
          >
            <ShoppingBag size={16} />
            {t('account.paymentMethods.shopNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[42px] w-56 animate-pulse rounded bg-gray-200" />

      {/* Accepted methods skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="px-6 py-5">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-gray-100" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-7 w-14 animate-pulse rounded border bg-gray-100"
              />
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 px-6 py-5">
          <div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-100" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="h-7 w-[90px] animate-pulse rounded-md bg-gray-200" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="size-9 shrink-0 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-6 py-5">
          <div className="h-[46px] w-36 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
