import {useState} from 'react';
import {Link} from 'react-router';
import type {FooterQuery} from 'storefrontapi.generated';
import {cn} from '~/lib/utils';
import {PillInput} from '~/components/ui/pill-input';
import {Button} from '~/components/ui/button';

// ============================================================================
// Types
// ============================================================================

export type FooterVariant = 'default' | 'primary' | 'secondary' | 'tertiary';

export interface FooterProps {
  /** Footer menu from Storefront API */
  menu?: FooterQuery['menu'] | null;
  /** Shop name for copyright */
  shopName: string;
  /** Override footer links (otherwise uses defaults) */
  links?: Array<{title: string; url: string}>;
  /**
   * Color scheme variant.
   * - default:   white bg, colored logo, green-bordered input, filled teal submit button
   * - primary:   green bg (#2ac864), white logo, white-bordered input, white outline button
   * - secondary: teal bg (#2699a6), white logo, white-bordered input, white outline button
   * - tertiary:  mint bg (#2bd9a8), white logo, white-bordered input, white outline button
   */
  variant?: FooterVariant;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LINKS = [
  {title: 'About', url: '/pages/about'},
  {title: 'Terms of Use', url: '/policies/terms-of-service'},
  {title: 'Privacy Policy', url: '/policies/privacy-policy'},
  {title: 'Help', url: '/pages/help'},
  {title: 'Become a Supplier', url: '/pages/become-a-supplier'},
];

// Figma: X, Instagram, YouTube, LinkedIn — 24×24px bare SVG icons, gap-[10px]
// Icons are text-black on ALL variants (including colored backgrounds) per Figma spec
const SOCIAL_LINKS = [
  {
    label: 'X',
    url: 'https://x.com',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    url: 'https://instagram.com',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 011.523.99 4.088 4.088 0 01.99 1.524c.163.46.349 1.26.403 2.43.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.054 1.17-.24 1.97-.403 2.43a4.088 4.088 0 01-.99 1.524 4.088 4.088 0 01-1.524.99c-.46.163-1.26.349-2.43.403-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.17-.054-1.97-.24-2.43-.403a4.088 4.088 0 01-1.524-.99 4.088 4.088 0 01-.99-1.524c-.163-.46-.349-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.054-1.17.24-1.97.403-2.43a4.088 4.088 0 01.99-1.524A4.088 4.088 0 015.15 2.636c.46-.163 1.26-.349 2.43-.403C8.845 2.175 9.225 2.163 12 2.163zm0 1.802c-3.15 0-3.504.013-4.743.069-.985.045-1.52.208-1.876.346-.472.183-.808.403-1.162.756a3.13 3.13 0 00-.756 1.162c-.138.356-.301.891-.346 1.876-.056 1.24-.069 1.593-.069 4.743s.013 3.504.069 4.743c.045.985.208 1.52.346 1.876.183.472.403.808.756 1.162.354.354.69.573 1.162.756.356.138.891.301 1.876.346 1.24.056 1.593.069 4.743.069s3.504-.013 4.743-.069c.985-.045 1.52-.208 1.876-.346.472-.183.808-.403 1.162-.756.354-.354.573-.69.756-1.162.138-.356.301-.891.346-1.876.056-1.24.069-1.593.069-4.743s-.013-3.504-.069-4.743c-.045-.985-.208-1.52-.346-1.876a3.13 3.13 0 00-.756-1.162 3.13 3.13 0 00-1.162-.756c-.356-.138-.891-.301-1.876-.346C15.504 3.978 15.15 3.965 12 3.965zm0 3.067a4.968 4.968 0 110 9.936 4.968 4.968 0 010-9.936zm0 8.19a3.223 3.223 0 100-6.446 3.223 3.223 0 000 6.446zm5.168-8.452a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z',
  },
  {
    label: 'YouTube',
    url: 'https://youtube.com',
    icon: 'M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  },
  {
    label: 'LinkedIn',
    url: 'https://linkedin.com',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

// ============================================================================
// Variant helpers
// ============================================================================

const BG_CLASSES: Record<FooterVariant, string> = {
  default: 'bg-white',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-brand-accent',
};

// ============================================================================
// NewsletterSignup
//
// Figma Input variants (node 659:113):
//   Default footer  → PrimarySubmit input:
//     border-primary, placeholder text-text-muted (#666),
//     FILLED teal button (bg-secondary text-white)
//
//   Primary/Secondary/Tertiary footers → Alternate input:
//     border-white, placeholder text-white,
//     OUTLINE white button (bg-transparent border-white text-white)
// ============================================================================

interface NewsletterSignupProps {
  colored?: boolean;
}

function NewsletterSignup({colored = false}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Wire to Shopify customer/newsletter API
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col gap-[13px] items-center w-[560px] max-w-full">
      {/* Figma: 20px Inter Regular (400), text-black, leading-[1.2], centered — all variants */}
      <h3
        className={cn(
          'text-[20px] font-normal leading-[1.2] text-center',
          colored ? 'text-white' : 'text-black',
        )}
      >
        Sign up for Hylee news &amp; updates!
      </h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <PillInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          hideIcon
          className="min-w-68.75"
        />
        <Button
          type="submit"
          className="h-10 rounded-[25px] px-6.5 text-[14px] font-medium whitespace-nowrap bg-white text-dark hover:bg-white/90"
        >
          {submitted ? 'Sent!' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}

// ============================================================================
// Main Component
// Figma: 1440px frame, px-[122px] py-[59px]
// Row: left col 240px (logo + social) | gap-[78px] | center/right w-[560px]
// ============================================================================

export function Footer({
  menu,
  shopName,
  links,
  variant = 'primary',
}: FooterProps) {
  const displayLinks = links && links.length > 0 ? links : DEFAULT_LINKS;
  const colored = variant !== 'default';

  const logoSrc = colored ? '/logo-white.png' : '/logo-full.png';

  return (
    <footer className={BG_CLASSES[variant]}>
      <div className="max-w-300 mx-auto px-4 sm:px-6 py-12 lg:py-14.75">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[78px] items-start">
          {/* Left column — Logo + social */}
          <div className="flex flex-col gap-3 items-start shrink-0 lg:w-60">
            <Link to="/">
              <img
                src={logoSrc}
                alt={shopName}
                className="h-[101.821px] w-[183px] object-contain"
                loading="lazy"
              />
            </Link>
            {/* Figma: 14px Inter Medium, text-black — all variants */}
            <p
              className={cn(
                'text-[14px] font-medium',
                colored ? 'text-white' : 'text-black',
              )}
            >
              Follow us on social media
            </p>
            {/* Figma: 24×24px bare icons, gap-[10px], text-black — ALL variants */}
            <div className="flex items-center gap-[10px]">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    'flex items-center justify-center size-6 transition-opacity hover:opacity-70',
                    colored ? 'text-white' : 'text-black',
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Center/right — Newsletter + nav links */}
          <div className="flex flex-col items-center flex-1 lg:w-140 gap-3.25">
            <NewsletterSignup colored={colored} />

            {/* Nav links */}
            <nav className="p-[10px]">
              <ul className="flex flex-wrap items-center justify-center">
                {displayLinks.map((link) => (
                  <li key={link.url}>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        'h-10 px-4 py-2.5 text-[14px] font-medium whitespace-nowrap rounded-xl hover:bg-transparent',
                        colored
                          ? 'text-white hover:text-white/70'
                          : 'text-text-muted hover:text-black',
                      )}
                    >
                      <Link to={link.url}>{link.title}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <p
          className={cn(
            'mt-8 pt-6 border-t text-[12px] text-center',
            colored
              ? 'border-white/20 text-white'
              : 'border-border text-text-muted',
          )}
        >
          &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
