import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Mail, Clock, CheckCircle, AlertCircle} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {Button} from '~/components/ui/button';
import {Link} from 'react-router';

export function meta() {
  return [
    {title: 'Contact Us | Hy-lee'},
    {
      name: 'description',
      content:
        "Get in touch with the Hy-lee support team. We're here to help with orders, products, and anything else.",
    },
  ];
}

export default function ContactPage() {
  const {t} = useTranslation();
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    try {
      // Shopify Contact Form API endpoint
      const body = new URLSearchParams({
        'contact[name]': formData.name,
        'contact[email]': formData.email,
        'contact[body]': `Subject: ${formData.subject}\n\n${formData.message}`,
      });
      const res = await fetch('/contact#contact_form', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function handleReset() {
    setFormData({name: '', email: '', subject: '', message: ''});
    setStatus('idle');
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumbs */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="h-10 px-4 rounded-xl hover:bg-accent inline-flex items-center"
              >
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#111827] font-medium h-10 px-4 inline-flex items-center">
                {t('contactPage.title')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#111827] leading-tight tracking-tight">
            {t('contactPage.title')}
          </h1>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* ── Contact Form ── */}
          <div className="flex-1 w-full bg-white rounded-[16px] border border-[#e5e7eb] p-8 shadow-sm">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle size={48} className="text-primary" />
                <h2 className="text-[24px] font-bold text-[#111827]">
                  {t('contactPage.successTitle')}
                </h2>
                <p className="text-[15px] text-[#6b7280] max-w-sm">
                  {t('contactPage.successBody')}
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  {t('contactPage.sendAnother')}
                </Button>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <AlertCircle size={48} className="text-destructive" />
                <h2 className="text-[24px] font-bold text-[#111827]">
                  {t('contactPage.errorTitle')}
                </h2>
                <p className="text-[15px] text-[#6b7280] max-w-sm">
                  {t('contactPage.errorBody')}
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  {t('contactPage.sendAnother')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-[14px] font-semibold text-[#374151]"
                  >
                    {t('contactPage.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contactPage.namePlaceholder')}
                    className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[14px] font-semibold text-[#374151]"
                  >
                    {t('contactPage.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contactPage.emailPlaceholder')}
                    className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subject"
                    className="text-[14px] font-semibold text-[#374151]"
                  >
                    {t('contactPage.subject')}
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t('contactPage.subjectPlaceholder')}
                    className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-[14px] font-semibold text-[#374151]"
                  >
                    {t('contactPage.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contactPage.messagePlaceholder')}
                    className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors resize-none"
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
              </form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="lg:w-[280px] shrink-0 flex flex-col gap-6">
            <h2 className="text-[20px] font-bold text-[#111827]">
              {t('contactPage.infoHeading')}
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">
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
                <p className="text-[13px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">
                  {t('contactPage.infoHoursLabel')}
                </p>
                <p className="text-[15px] font-medium text-[#374151]">
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
