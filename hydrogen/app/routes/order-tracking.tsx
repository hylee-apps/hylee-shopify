import type {Route} from './+types/order-tracking';
import {redirect, Form, useNavigation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {Search, Package, Loader2, AlertCircle} from 'lucide-react';
import {adminApi, type AdminEnv} from '~/lib/admin-api';
import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Track Your Order — Hy-lee',
    description:
      'Track the status of your order by entering your email and order number.',
  });
}

// ============================================================================
// Types
// ============================================================================

interface AdminOrderNode {
  id: string;
  name: string;
  statusUrl: string;
}

interface AdminOrdersResult {
  orders: {nodes: AdminOrderNode[]};
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
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const rawNumber = (formData.get('orderNumber') as string | null)?.trim();

  if (!email || !rawNumber) {
    return {error: 'missing_fields'};
  }

  // Normalise: strip leading # so the query filter works consistently
  const orderNumber = rawNumber.replace(/^#/, '');

  try {
    const data = await adminApi<AdminOrdersResult>(
      context.env as unknown as AdminEnv,
      `query FindOrder($q: String!) {
        orders(first: 1, query: $q) {
          nodes { id name statusUrl }
        }
      }`,
      {q: `name:#${orderNumber} email:${email}`},
    );

    const order = data?.orders?.nodes?.[0];
    if (!order?.statusUrl) {
      return {error: 'not_found'};
    }

    return redirect(order.statusUrl);
  } catch {
    return {error: 'not_found'};
  }
}

// ============================================================================
// Component
// ============================================================================

export default function OrderTrackingPage({actionData}: Route.ComponentProps) {
  const {t} = useTranslation('common');
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const error = actionData?.error;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary/10">
            <Package size={28} className="text-secondary" />
          </div>
          <CardTitle className="text-2xl">
            {t('orderTracking.heading')}
          </CardTitle>
          <p className="mt-1 text-sm text-text-muted">
            {t('orderTracking.subheading')}
          </p>
        </CardHeader>

        <CardContent>
          <Form method="post" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('orderTracking.emailLabel')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('orderTracking.emailPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orderNumber">
                {t('orderTracking.orderNumberLabel')}
              </Label>
              <Input
                id="orderNumber"
                name="orderNumber"
                type="text"
                required
                placeholder={t('orderTracking.orderNumberPlaceholder')}
              />
              <p className="text-xs text-text-muted">
                {t('orderTracking.orderNumberHint')}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  {error === 'missing_fields'
                    ? t('orderTracking.errorMissingFields')
                    : t('orderTracking.errorNotFound')}
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {isSubmitting
                ? t('orderTracking.submitting')
                : t('orderTracking.submit')}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="size-14 animate-pulse rounded-full bg-gray-200" />
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex flex-col gap-4 px-8 pb-8">
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
