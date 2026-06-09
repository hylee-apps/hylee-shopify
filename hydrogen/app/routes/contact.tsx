import {useTranslation} from 'react-i18next';
import {Mail, Clock, CheckCircle, AlertCircle} from 'lucide-react';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';
import {Button} from '~/components/ui/button';
import {useFetcher} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';
import type {Route} from './+types/contact';

export async function loader({request}: LoaderFunctionArgs) {
  return {canonicalUrl: `${new URL(request.url).origin}/contact`};
}

export function meta({data}: Route.MetaArgs) {
  const canonical = data?.canonicalUrl
    ? [{tagName: 'link', rel: 'canonical', href: data.canonicalUrl}]
    : [];
  return [
    {title: 'Contact Us | Hy-lee'},
    {
      name: 'description',
      content:
        "Get in touch with the Hy-lee support team. We're here to help with orders, products, and anything else.",
    },
    ...canonical,
  ];
}

// TODO: wire up to Klaviyo or Shopify Email once Darian configures the integration.
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');

  if (!name || !email || !subject || !message) {
    return {success: false as const};
  }

  return {success: true as const};
}

export default function ContactPage() {
  const {t} = useTranslation();
  const fetcher = useFetcher<typeof action>();

  const status =
    fetcher.state !== 'idle'
      ? 'submitting'
      : fetcher.data?.success === true
        ? 'success'
        : fetcher.data?.success === false
          ? 'error'
          : 'idle';

  return (
    <div className="min-h-screen bg-surface">
      <PageBreadcrumbs current={t('contactPage.title')} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="sr-only">{t('contactPage.title')}</h1>
          <p className="mt-2 text-[16px] text-text-muted">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* ── Contact Form ── */}
          <div className="flex-1 w-full bg-white rounded-[16px] border border-border p-8 shadow-sm">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle size={48} className="text-primary" />
                <h2 className="text-[24px] font-bold text-text">
                  {t('contactPage.successTitle')}
                </h2>
                <p className="text-[15px] text-text-muted max-w-sm">
                  {t('contactPage.successBody')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetcher.load('/contact')}
                  className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  {t('contactPage.sendAnother')}
                </Button>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <AlertCircle size={48} className="text-destructive" />
                <h2 className="text-[24px] font-bold text-text">
                  {t('contactPage.errorTitle')}
                </h2>
                <p className="text-[15px] text-text-muted max-w-sm">
                  {t('contactPage.errorBody')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetcher.load('/contact')}
                  className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  {t('contactPage.sendAnother')}
                </Button>
              </div>
            ) : (
              <fetcher.Form method="post" className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-[14px] font-semibold text-text"
                  >
                    {t('contactPage.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={t('contactPage.namePlaceholder')}
                    className="w-full rounded-[8px] border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[14px] font-semibold text-text"
                  >
                    {t('contactPage.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t('contactPage.emailPlaceholder')}
                    className="w-full rounded-[8px] border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subject"
                    className="text-[14px] font-semibold text-text"
                  >
                    {t('contactPage.subject')}
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder={t('contactPage.subjectPlaceholder')}
                    className="w-full rounded-[8px] border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-[14px] font-semibold text-text"
                  >
                    {t('contactPage.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder={t('contactPage.messagePlaceholder')}
                    className="w-full rounded-[8px] border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="self-start rounded-full px-8 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-semibold"
                >
                  {status === 'submitting'
                    ? t('contactPage.submitting')
                    : t('contactPage.submit')}
                </Button>
              </fetcher.Form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="lg:w-[280px] shrink-0 flex flex-col gap-6">
            <h2 className="text-[20px] font-bold text-text">
              {t('contactPage.infoHeading')}
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">
                  {t('contactPage.infoEmailLabel')}
                </p>
                <a
                  href={`mailto:${t('contactPage.infoEmail')}`}
                  className="text-[15px] font-medium text-secondary hover:underline"
                >
                  {t('contactPage.infoEmail')}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">
                  {t('contactPage.infoHoursLabel')}
                </p>
                <p className="text-[15px] font-medium text-text">
                  {t('contactPage.infoHours')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
