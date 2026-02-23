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
      <div className="hidden lg:flex h-65 w-full">
        {/* Image */}
        <div className="h-full w-82 shrink-0">
          <img
            src="/hero-plp.png"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        {/* Title — centered within this div */}
        <div className="flex flex-1 items-center justify-center">
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
        <div className="px-4 py-6">
          <h1 className="text-3xl font-normal text-[#1d1b20]">{title}</h1>
        </div>
      </div>
    </section>
  );
}
