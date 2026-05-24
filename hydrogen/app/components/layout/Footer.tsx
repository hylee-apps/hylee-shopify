import {useState} from 'react';
import {Link} from 'react-router';
import type {FooterQuery} from 'storefrontapi.generated';
import {cn} from '~/lib/utils';
import {PillInput} from '~/components/ui/pill-input';
import {Button} from '~/components/ui/button';
import {useTranslation} from 'react-i18next';

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
   * - primary:   dark green bg (#55962D), white logo, white-bordered input, white outline button
   * - secondary: teal bg (#2699a6), white logo, white-bordered input, white outline button
   * - tertiary:  mint bg (#2bd9a8), white logo, white-bordered input, white outline button
   */
  variant?: FooterVariant;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialPinterest?: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LINK_KEYS = [
  {key: 'footer.links.about', url: '/about'},
  {key: 'footer.links.contact', url: '/contact'},
  {key: 'footer.links.faq', url: '/faq'},
  {key: 'footer.links.trackOrder', url: '/order-tracking'},
  {key: 'footer.links.termsOfUse', url: '/policies/terms-of-service'},
  {key: 'footer.links.privacyPolicy', url: '/policies/privacy-policy'},
  {key: 'footer.links.returnPolicy', url: '/policies/return-policy'},
  {key: 'footer.links.becomeSupplier', url: '/pages/become-a-supplier'},
];

// Instagram, Facebook, Pinterest — 24×24px bare SVG icons, gap-[10px]
// Icons are text-black on ALL variants (including colored backgrounds) per Figma spec
const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    url: 'https://instagram.com',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 011.523.99 4.088 4.088 0 01.99 1.524c.163.46.349 1.26.403 2.43.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.054 1.17-.24 1.97-.403 2.43a4.088 4.088 0 01-.99 1.524 4.088 4.088 0 01-1.524.99c-.46.163-1.26.349-2.43.403-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.17-.054-1.97-.24-2.43-.403a4.088 4.088 0 01-1.524-.99 4.088 4.088 0 01-.99-1.524c-.163-.46-.349-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.054-1.17.24-1.97.403-2.43a4.088 4.088 0 01.99-1.524A4.088 4.088 0 015.15 2.636c.46-.163 1.26-.349 2.43-.403C8.845 2.175 9.225 2.163 12 2.163zm0 1.802c-3.15 0-3.504.013-4.743.069-.985.045-1.52.208-1.876.346-.472.183-.808.403-1.162.756a3.13 3.13 0 00-.756 1.162c-.138.356-.301.891-.346 1.876-.056 1.24-.069 1.593-.069 4.743s.013 3.504.069 4.743c.045.985.208 1.52.346 1.876.183.472.403.808.756 1.162.354.354.69.573 1.162.756.356.138.891.301 1.876.346 1.24.056 1.593.069 4.743.069s3.504-.013 4.743-.069c.985-.045 1.52-.208 1.876-.346.472-.183.808-.403 1.162-.756.354-.354.573-.69.756-1.162.138-.356.301-.891.346-1.876.056-1.24.069-1.593.069-4.743s-.013-3.504-.069-4.743c-.045-.985-.208-1.52-.346-1.876a3.13 3.13 0 00-.756-1.162 3.13 3.13 0 00-1.162-.756c-.356-.138-.891-.301-1.876-.346C15.504 3.978 15.15 3.965 12 3.965zm0 3.067a4.968 4.968 0 110 9.936 4.968 4.968 0 010-9.936zm0 8.19a3.223 3.223 0 100-6.446 3.223 3.223 0 000 6.446zm5.168-8.452a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z',
  },
  {
    label: 'Facebook',
    url: 'https://facebook.com',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Pinterest',
    url: 'https://pinterest.com',
    icon: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z',
  },
];

// ============================================================================
// Variant helpers
// ============================================================================

const BG_CLASSES: Record<FooterVariant, string> = {
  default: 'bg-white',
  primary: 'bg-[#55962D]',
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
  const {t} = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Wire to Shopify customer/newsletter API
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col gap-[13px] items-center w-full sm:w-[560px] sm:max-w-full">
      <h3
        className={cn(
          'text-[20px] font-normal leading-[1.2] text-center',
          colored ? 'text-white' : 'text-black',
        )}
      >
        {t('footer.newsletter.heading')}
      </h3>
      {/* Stacks vertically on phones so the input + submit don't force the
          footer wider than the viewport. Side-by-side at sm+ matches Figma. */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center"
      >
        <PillInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('footer.newsletter.placeholder')}
          required
          hideIcon
          className="w-full sm:min-w-68.75"
        />
        <Button
          type="submit"
          className="h-10 w-full rounded-[25px] px-6.5 text-[14px] font-medium whitespace-nowrap bg-white text-dark hover:bg-white/90 sm:w-auto"
        >
          {submitted
            ? t('footer.newsletter.sent')
            : t('footer.newsletter.submit')}
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
  socialFacebook,
  socialInstagram,
  socialPinterest,
}: FooterProps) {
  const {t} = useTranslation();
  const defaultLinks = DEFAULT_LINK_KEYS.map(({key, url}) => ({
    title: t(key),
    url,
  }));
  const displayLinks = links && links.length > 0 ? links : defaultLinks;
  const colored = variant !== 'default';

  const logoSrc = colored ? '/logo-white.png' : '/logo-full.png';

  return (
    <footer className={BG_CLASSES[variant]}>
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-14.75">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[78px] items-center lg:items-start">
          {/* Left column — Logo + social (bottom on mobile, first on desktop) */}
          <div className="order-3 lg:order-1 flex flex-col gap-3 items-center lg:items-start shrink-0 lg:w-60">
            <Link to="/">
              <img
                src={logoSrc}
                alt={shopName}
                className="h-[60px] w-[108px] lg:h-[101.821px] lg:w-[183px] object-contain"
                loading="lazy"
              />
            </Link>
            {/* Social icons — hidden when all URLs are null */}
            {(socialInstagram ?? socialFacebook ?? socialPinterest) && (
              <>
                <p
                  className={cn(
                    'text-[14px] font-medium',
                    colored ? 'text-white' : 'text-black',
                  )}
                >
                  {t('footer.followUs')}
                </p>
                <div className="flex items-center gap-[10px]">
                  {SOCIAL_LINKS.map((social) => {
                    const url =
                      social.label === 'Instagram'
                        ? socialInstagram
                        : social.label === 'Facebook'
                          ? socialFacebook
                          : socialPinterest;
                    if (!url) return null;
                    return (
                      <a
                        key={social.label}
                        href={url}
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
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Center/right — Newsletter + nav links (stacked; order flips on mobile) */}
          <div className="order-1 lg:order-2 flex flex-col items-center flex-1 lg:w-140 gap-3.25">
            {/* Nav links — first on mobile, second on desktop */}
            <nav className="order-1 lg:order-2 p-[10px]">
              <ul className="flex flex-wrap items-center justify-center">
                {displayLinks.map((link) => (
                  <li key={link.url}>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        'h-10 px-4 py-2.5 text-[15px] font-semibold whitespace-nowrap rounded-xl hover:bg-transparent',
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

            {/* Newsletter — second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 w-full flex justify-center">
              <NewsletterSignup colored={colored} />
            </div>
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
          {t('footer.copyright', {
            year: new Date().getFullYear(),
            name: shopName,
          })}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
