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
    <section
      className={`w-full overflow-hidden bg-surface-alt ${className ?? ''}`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — Figma exact layout                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex relative w-full items-center">
        {/* Image — 400px wide, natural aspect ratio */}
        <img
          src="/hero-plp.png"
          alt=""
          className="w-100 shrink-0 object-contain"
          loading="eager"
        />

        {/* Title — centered horizontally and vertically over the image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[57px] font-normal leading-16 tracking-[-0.25px] text-[#1d1b20] text-center">
            {title}
          </h1>
        </div>
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
        <div className="px-4 py-6 flex items-center justify-center">
          <h1 className="text-3xl font-normal text-[#1d1b20] text-center">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
