import {Image} from '@shopify/hydrogen';

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
 * CollectionHero — PLP hero matching Figma node 5024:284.
 *
 * Layout: collection image on the left, bold title vertically centered on the
 * right. Description is intentionally not rendered — title only.
 *
 * Mobile: image stacks above title.
 */
export function CollectionHero({title, image, className}: CollectionHeroProps) {
  return (
    <section
      className={`max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className ?? ''}`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — image left + title vertically centered right              */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex items-center gap-10">
        {/* Hero Image — larger, rounded, subtle shadow */}
        <div className="shrink-0 w-[400px] h-[280px] rounded-[12px] overflow-hidden shadow-md bg-[#f3f4f6]">
          {image ? (
            <Image
              data={image}
              aspectRatio="400/280"
              sizes="400px"
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-[#f3f4f6]" />
          )}
        </div>

        {/* Title only — vertically centered by parent items-center */}
        <h1
          id="collection-title"
          className="font-bold text-[42px] leading-tight text-[#111827]"
        >
          {title}
        </h1>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — image stacked above title                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="w-full h-48 rounded-[12px] overflow-hidden shadow-md bg-[#f3f4f6]">
          {image ? (
            <Image
              data={image}
              aspectRatio="16/9"
              sizes="100vw"
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-[#f3f4f6]" />
          )}
        </div>
        <h1 className="font-bold text-[28px] leading-tight text-[#111827]">
          {title}
        </h1>
      </div>
    </section>
  );
}
