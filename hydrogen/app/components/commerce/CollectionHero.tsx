export interface CollectionHeroProps {
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  /** @deprecated Not shown in Figma design — kept for prop compatibility */
  promoHeadline?: string;
  /** @deprecated Not shown in Figma design — kept for prop compatibility */
  promoCta?: string;
  /** @deprecated Not shown in Figma design — kept for prop compatibility */
  promoCtaUrl?: string;
  className?: string;
}

/**
 * CollectionHero — PLP hero matching Figma node 2766:608.
 *
 * Desktop: collection image on the left (328×260px) + collection title on
 * the right (57px Regular, #1d1b20, tracking-[-0.25px]).
 * Mobile: image stacked above title.
 *
 * Figma: file d52sF4D2B0bIzt3A4z3UjE, node 2766:608
 * Total frame: 1440×260px. Image: absolute left-0 top-0, 328×260px.
 * Title: absolute left-521 top-98. Gap image→title = 193px.
 */
export function CollectionHero({title, image, className}: CollectionHeroProps) {
  return (
    <section className={`w-full overflow-hidden ${className ?? ''}`}>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — Figma exact layout                                        */}
      {/* ------------------------------------------------------------------ */}
      {/*
       * 3-column grid: [image | title | spacer]
       * Left and right columns are always equal (min(480px, 35%)), so the
       * center column is mathematically centered on the page at every width.
       * The image and title live in separate columns — overlap is impossible.
       */}
      <div
        className="hidden lg:grid h-[260px] w-full"
        style={{
          gridTemplateColumns: 'min(480px, 35%) 1fr min(480px, 35%)',
          gridTemplateRows: '260px',
        }}
      >
        {/* Left: hero image */}
        <div className="h-full">
          <img
            src="/hero-plp.png"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        {/* Center: title — justify-center here = centered on the full page */}
        <div className="flex items-center justify-center min-w-0 px-4">
          <h1 className="text-[57px] font-normal leading-[64px] tracking-[-0.25px] text-[#1d1b20] text-center">
            {title}
          </h1>
        </div>

        {/* Right: invisible spacer that mirrors image column width */}
        <div aria-hidden="true" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — stacked layout                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden">
        <div className="h-[200px] w-full">
          <img
            src="/hero-plp.png"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <div className="px-4 py-6">
          <h1 className="text-3xl font-normal text-[#1d1b20]">{title}</h1>
        </div>
      </div>
    </section>
  );
}
