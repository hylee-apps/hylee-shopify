import type {Route} from './+types/account.welcome';
import {redirect, Form, useNavigation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import {
  readAddressBook,
  writeAddressBook,
  setSurveyCompleted,
} from '~/lib/address-book-graphql';
import type {AddressBook} from '~/lib/address-book';
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
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  // Check session flag first (set when user completes/skips survey)
  if (context.session.get('surveyCompleted') === 'true') {
    return redirect('/account');
  }

  // Fall back to metafield check
  try {
    const {surveyCompleted} = await readAddressBook(context);
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
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'skip') {
    try {
      const {customerId} = await readAddressBook(context);
      await setSurveyCompleted(context, customerId);
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
    const {book, customerId} = await readAddressBook(context);
    const updatedBook: AddressBook = {
      ...book,
      surveyResponse: {
        source: source as 'social_media' | 'search' | 'referral' | 'other',
        ...(platform ? {platform} : {}),
        ...(referrerPhone ? {referrerPhone} : {}),
        answeredAt: new Date().toISOString(),
      },
    };
    await writeAddressBook(context, customerId, updatedBook);
    await setSurveyCompleted(context, customerId);
  } catch (err) {
    console.warn('[welcome] Could not persist survey data to metafields:', err);
  }

  context.session.set('surveyCompleted', 'true');
  return redirect('/account');
}

// ============================================================================
// Social Media Platforms
// ============================================================================

const SOCIAL_PLATFORMS = [
  {value: 'instagram', label: 'Instagram'},
  {value: 'tiktok', label: 'TikTok'},
  {value: 'facebook', label: 'Facebook'},
  {value: 'x', label: 'X (Twitter)'},
  {value: 'youtube', label: 'YouTube'},
  {value: 'linkedin', label: 'LinkedIn'},
  {value: 'other', label: 'Other'},
];

// ============================================================================
// Component
// ============================================================================

export default function AccountWelcome({actionData}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [source, setSource] = useState<string>('');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Welcome to Hy-lee!
          </CardTitle>
          <p className="text-center text-sm text-text-muted">
            Quick question — how did you hear about us?
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
                  Social Media
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="search" id="search" />
                <Label htmlFor="search" className="cursor-pointer">
                  Google / Bing Search
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="referral" id="referral" />
                <Label htmlFor="referral" className="cursor-pointer">
                  Referred by a Friend
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">
                  Other
                </Label>
              </div>
            </RadioGroup>

            {/* Conditional: Social Media → Platform Select */}
            {source === 'social_media' && (
              <div className="mt-4">
                <Label htmlFor="platform">Which platform?</Label>
                <Select name="platform">
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((p) => (
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
                  Your friend&apos;s phone number
                </Label>
                <Input
                  id="referrerPhone"
                  name="referrerPhone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-primary">
                  Your friend gets 20% off!
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Continue to Your Account'}
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
              Skip
            </button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
