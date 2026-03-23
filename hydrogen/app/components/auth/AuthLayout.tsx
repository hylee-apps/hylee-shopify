import {Link} from 'react-router';

// ============================================================================
// Types
// ============================================================================

interface AuthFeature {
  text: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  gradient: {from: string; to: string};
  tagline: string;
  description: string;
  features: AuthFeature[];
}

// ============================================================================
// Check Icon SVG
// ============================================================================

function CheckIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-[#2bd9a8]"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function AuthLayout({
  children,
  gradient,
  tagline,
  description,
  features,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div
        className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden p-8 lg:flex"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      >
        {/* Subtle radial overlay */}
        <div
          className="pointer-events-none absolute inset-[-50%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-6 text-center">
            <Link
              to="/"
              className="inline-block text-[48px] font-bold leading-[72px] tracking-[-1px] text-white no-underline"
            >
              Hylee
            </Link>
          </div>

          {/* Tagline */}
          <h2 className="mb-2 text-center text-[24px] font-light leading-[36px] text-white opacity-95">
            {tagline}
          </h2>

          {/* Description */}
          <p className="mb-10 text-center text-[16px] leading-[24px] text-white">
            {description}
          </p>

          {/* Features */}
          <div className="flex flex-col gap-4">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex w-6 items-center justify-center">
                  <CheckIcon />
                </div>
                <span className="text-[16px] leading-[24px] text-white">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
