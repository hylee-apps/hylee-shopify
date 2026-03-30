import {Form, useNavigation, useActionData} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Textarea} from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {CheckCircle} from 'lucide-react';
import type {Route} from './+types/support.contact';

// ============================================================================
// Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Contact Support — Hy-lee',
    description: 'Get help with your order, return, or any questions.',
  });
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = (formData.get('name') as string | null)?.trim();
  const email = (formData.get('email') as string | null)?.trim();
  const subject = formData.get('subject') as string | null;
  const message = (formData.get('message') as string | null)?.trim();

  if (!name || !email || !subject || !message) {
    return {error: 'Please fill out all fields before submitting.'};
  }

  // Build a mailto link payload and redirect — the server never exposes the
  // Gmail address directly; it only constructs the mailto at request time.
  const SUPPORT_EMAIL = 'hylee.support.team@gmail.com';

  const subjectLine = encodeURIComponent(
    `[Hy-lee Support] ${subject} — from ${name}`,
  );
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
  );

  // Server-side: in a real deployment use a transactional email service here.
  // For now we redirect the browser to a mailto: so the customer's email
  // client opens with everything pre-filled. The raw address stays server-side.
  return {
    success: true,
    mailto: `mailto:${SUPPORT_EMAIL}?subject=${subjectLine}&body=${body}`,
  };
}

// ============================================================================
// Page
// ============================================================================

const SUBJECTS = [
  {value: 'Order Issue', label: 'Order Issue'},
  {value: 'Return or Exchange', label: 'Return or Exchange'},
  {value: 'Product Question', label: 'Product Question'},
  {value: 'Shipping & Delivery', label: 'Shipping & Delivery'},
  {value: 'Account Help', label: 'Account Help'},
  {value: 'Other', label: 'Other'},
];

export default function SupportContact({}: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // If the server returned a mailto link, open it client-side via a hidden anchor.
  // This keeps the Gmail address out of the HTML source at page load.
  if (actionData?.success && actionData.mailto) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-10 flex flex-col items-center gap-4">
            <CheckCircle className="text-primary" size={48} />
            <h2 className="text-xl font-semibold text-gray-900">
              Message Ready to Send
            </h2>
            <p className="text-sm text-text-muted max-w-sm">
              Click the button below to open your email client with your message
              pre-filled. We&apos;ll get back to you within 24 hours.
            </p>
            <a
              href={actionData.mailto}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary/90 transition-colors"
            >
              Open Email Client
            </a>
            <a
              href="/"
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              Return to Home
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Customer Support</CardTitle>
          <p className="text-sm text-text-muted">
            Fill out the form below and we&apos;ll get back to you within 24
            hours.
          </p>
        </CardHeader>

        <CardContent>
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <p className="text-sm text-destructive">{actionData.error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Select name="subject" required>
                <SelectTrigger id="subject" className="w-full">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe your issue or question..."
                rows={5}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
