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
 * CollectionHero — PLP hero matching Figma node 5024:284 (file LXJLDI1fRXble63hVJcg7A).
 *
 * Layout: 280×200px collection image (rounded-[12px], shadow-md) on the left,
 * title (42px font-light) + description (16px, #4b5563) on the right with 40px gap.
 *
 * Mobile: stacks image above content.
 */
export function CollectionHero({
  title,
  description,
  image,
  className,
}: CollectionHeroProps) {
  return (
    <section
      className={`max-w-350 mx-auto w-full px-6 py-6 ${className ?? ''}`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — image left + content right                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex items-center gap-10">
        {/* Hero Image — 280×200px, rounded-[12px], shadow-md */}
        <div className="shrink-0 w-70 h-50 rounded-[12px] overflow-hidden shadow-md bg-[#f3f4f6]">
          {image ? (
            <Image
              data={image}
              aspectRatio="280/200"
              sizes="280px"
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-[#f3f4f6]" />
          )}
        </div>

        {/* Hero Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <h1
            id="collection-title"
            className="font-light text-[42px] leading-normal text-[#111827]"
          >
            {title}
          </h1>
          {description && (
            <p className="text-[16px] font-normal text-[#4b5563] leading-6 max-w-125 line-clamp-3">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — image stacked above content                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="w-full h-45 rounded-[12px] overflow-hidden shadow-md bg-[#f3f4f6]">
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
        <div className="flex flex-col gap-2">
          <h1 className="font-light text-[32px] leading-tight text-[#111827]">
            {title}
          </h1>
          {description && (
            <p className="text-[15px] font-normal text-[#4b5563] leading-6 line-clamp-3">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
