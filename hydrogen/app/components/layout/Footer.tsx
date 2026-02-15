import {Link} from 'react-router';
import type {FooterQuery} from 'storefrontapi.generated';

// ============================================================================
// Types
// ============================================================================

export interface FooterProps {
  /** Footer menu from Storefront API */
  menu?: FooterQuery['menu'] | null;
  /** Shop name for copyright */
  shopName: string;
  /** Logo URL (optional) */
  logoUrl?: string;
  /** Override footer links (otherwise uses defaults) */
  links?: Array<{title: string; url: string}>;
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

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    url: 'https://facebook.com',
    icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  },
  {
    label: 'Instagram',
    url: 'https://instagram.com',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 011.523.99 4.088 4.088 0 01.99 1.524c.163.46.349 1.26.403 2.43.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.054 1.17-.24 1.97-.403 2.43a4.088 4.088 0 01-.99 1.524 4.088 4.088 0 01-1.524.99c-.46.163-1.26.349-2.43.403-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.17-.054-1.97-.24-2.43-.403a4.088 4.088 0 01-1.524-.99 4.088 4.088 0 01-.99-1.524c-.163-.46-.349-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.054-1.17.24-1.97.403-2.43a4.088 4.088 0 01.99-1.524A4.088 4.088 0 015.15 2.636c.46-.163 1.26-.349 2.43-.403C8.845 2.175 9.225 2.163 12 2.163zm0 1.802c-3.15 0-3.504.013-4.743.069-.985.045-1.52.208-1.876.346-.472.183-.808.403-1.162.756a3.13 3.13 0 00-.756 1.162c-.138.356-.301.891-.346 1.876-.056 1.24-.069 1.593-.069 4.743s.013 3.504.069 4.743c.045.985.208 1.52.346 1.876.183.472.403.808.756 1.162.354.354.69.573 1.162.756.356.138.891.301 1.876.346 1.24.056 1.593.069 4.743.069s3.504-.013 4.743-.069c.985-.045 1.52-.208 1.876-.346.472-.183.808-.403 1.162-.756.354-.354.573-.69.756-1.162.138-.356.301-.891.346-1.876.056-1.24.069-1.593.069-4.743s-.013-3.504-.069-4.743c-.045-.985-.208-1.52-.346-1.876a3.13 3.13 0 00-.756-1.162 3.13 3.13 0 00-1.162-.756c-.356-.138-.891-.301-1.876-.346C15.504 3.978 15.15 3.965 12 3.965zm0 3.067a4.968 4.968 0 110 9.936 4.968 4.968 0 010-9.936zm0 8.19a3.223 3.223 0 100-6.446 3.223 3.223 0 000 6.446zm5.168-8.452a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z',
  },
  {
    label: 'X',
    url: 'https://x.com',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'TikTok',
    url: 'https://tiktok.com',
    icon: 'M16.6 5.82A4.278 4.278 0 0115.54 3h-3.09v12.4a2.592 2.592 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-1.88.09-3.24-1.48z',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function Footer({
  menu,
  shopName,
  logoUrl,
  links,
}: FooterProps) {
  // Use provided links, otherwise always use hardcoded Figma links
  const displayLinks = links && links.length > 0 ? links : DEFAULT_LINKS;

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-[59px]">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-20">
          {/* Left: Logo + social media */}
          <div className="shrink-0 space-y-3">
            <Link to="/">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={shopName}
                  className="h-[59px] w-auto"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-bold text-dark">{shopName}</span>
              )}
            </Link>
            <p className="text-sm font-medium text-text">
              Follow us on social media
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-dark/10 hover:bg-primary/80 transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-dark"
                    aria-hidden="true"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Footer links with vertical dividers - centered */}
          <nav className="flex flex-1 items-start justify-center pt-1">
            <ul className="flex flex-wrap items-center">
              {displayLinks.map((link, index) => (
                <li
                  key={link.url}
                  className={`${index > 0 ? 'border-l border-text-muted/40' : ''}`}
                >
                  <Link
                    to={link.url}
                    className="block px-4 text-sm font-medium text-text-muted hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
