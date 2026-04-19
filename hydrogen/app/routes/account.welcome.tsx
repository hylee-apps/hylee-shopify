import type {Route} from './+types/account.welcome';
import {redirect, Form, useNavigation} from 'react-router';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';

import {
  readAddressBook,
  writeAddressBook,
  setSurveyCompleted,
} from '~/lib/address-book-graphql';
import type {AddressBook} from '~/lib/address-book';

const CUSTOMER_ID_QUERY = `#graphql
  query WelcomeCustomerId {
    customer { id }
  }
` as const;
import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Welcome to Hy-lee!',
    description: 'Tell us how you heard about us.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  // Check session flag first (set when user completes/skips survey)
  if (context.session.get('surveyCompleted') === 'true') {
    return redirect('/account');
  }

  // Fall back to metafield check
  try {
    const {data} = await context.customerAccount.query(CUSTOMER_ID_QUERY);
    const customerId = data?.customer?.id ?? undefined;
    const {surveyCompleted} = await readAddressBook(context, customerId);
    if (surveyCompleted) {
      context.session.set('surveyCompleted', 'true');
      return redirect('/account');
    }
  } catch {
    // Metafield read failed — continue to show survey
  }

  return {};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  await context.customerAccount.handleAuthStatus();

  const {data: idData} = await context.customerAccount.query(CUSTOMER_ID_QUERY);
  const customerId = idData?.customer?.id ?? undefined;

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'skip') {
    try {
      if (customerId) await setSurveyCompleted(context, customerId);
    } catch (err) {
      console.warn(
        '[welcome] Could not persist survey_completed metafield:',
        err,
      );
    }
    context.session.set('surveyCompleted', 'true');
    return redirect('/account');
  }

  const source = formData.get('source') as string | null;
  const platform = formData.get('platform') as string | null;
  const referrerPhone = formData.get('referrerPhone') as string | null;

  if (!source) {
    return {error: 'Please select how you heard about us.'};
  }

  try {
    const {book} = await readAddressBook(context, customerId);
    const updatedBook: AddressBook = {
      ...book,
      surveyResponse: {
        source: source as 'social_media' | 'search' | 'referral' | 'other',
        ...(platform ? {platform} : {}),
        ...(referrerPhone ? {referrerPhone} : {}),
        answeredAt: new Date().toISOString(),
      },
    };
    if (customerId) {
      await writeAddressBook(context, customerId, updatedBook);
      await setSurveyCompleted(context, customerId);
    }
  } catch (err) {
    console.warn('[welcome] Could not persist survey data to metafields:', err);
  }

  context.session.set('surveyCompleted', 'true');
  return redirect('/account');
}

// ============================================================================
// Component
// ============================================================================

export default function AccountWelcome({actionData}: Route.ComponentProps) {
  const navigation = useNavigation();
  const {t} = useTranslation('common');
  const isSubmitting = navigation.state === 'submitting';
  const [source, setSource] = useState<string>('');

  const socialPlatforms = [
    {value: 'instagram', label: t('welcome.platform.instagram')},
    {value: 'tiktok', label: t('welcome.platform.tiktok')},
    {value: 'facebook', label: t('welcome.platform.facebook')},
    {value: 'x', label: t('welcome.platform.x')},
    {value: 'youtube', label: t('welcome.platform.youtube')},
    {value: 'linkedin', label: t('welcome.platform.linkedin')},
    {value: 'other', label: t('welcome.platform.other')},
  ];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t('welcome.heading')}
          </CardTitle>
          <p className="text-center text-sm text-text-muted">
            {t('welcome.question')}
          </p>
        </CardHeader>

        <CardContent>
          <Form method="post">
            <input type="hidden" name="intent" value="submit" />

            {actionData?.error && (
              <p className="mb-4 text-sm text-destructive">
                {actionData.error}
              </p>
            )}

            <RadioGroup
              name="source"
              value={source}
              onValueChange={setSource}
              className="gap-4"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="social_media" id="social_media" />
                <Label htmlFor="social_media" className="cursor-pointer">
                  {t('welcome.source.socialMedia')}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="search" id="search" />
                <Label htmlFor="search" className="cursor-pointer">
                  {t('welcome.source.search')}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="referral" id="referral" />
                <Label htmlFor="referral" className="cursor-pointer">
                  {t('welcome.source.referral')}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">
                  {t('welcome.source.other')}
                </Label>
              </div>
            </RadioGroup>

            {/* Conditional: Social Media → Platform Select */}
            {source === 'social_media' && (
              <div className="mt-4">
                <Label htmlFor="platform">{t('welcome.platform.label')}</Label>
                <Select name="platform">
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue
                      placeholder={t('welcome.platform.placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {socialPlatforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conditional: Referral → Phone Input */}
            {source === 'referral' && (
              <div className="mt-4">
                <Label htmlFor="referrerPhone">
                  {t('welcome.referrer.label')}
                </Label>
                <Input
                  id="referrerPhone"
                  name="referrerPhone"
                  type="tel"
                  placeholder={t('welcome.referrer.placeholder')}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-primary">
                  {t('welcome.referrer.discount')}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('welcome.submitting') : t('welcome.submit')}
              </Button>
            </div>
          </Form>

          {/* Skip link — separate form to avoid validation */}
          <Form method="post" className="mt-3">
            <input type="hidden" name="intent" value="skip" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-center text-sm text-text-muted transition-colors hover:text-primary"
            >
              {t('welcome.skip')}
            </button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
