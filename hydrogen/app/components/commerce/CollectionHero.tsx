import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation();
  return (
    <section
      className={`max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className ?? ''}`}
    >
      {/*
        Single responsive layout — flex-col on mobile, flex-row on desktop.
        One <h1> in the DOM at all breakpoints, satisfying the one-h1-per-page rule.
      */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
        {/* Hero image */}
        <div className="w-full h-48 shrink-0 rounded-[12px] overflow-hidden shadow-md bg-[#f3f4f6] lg:w-[400px] lg:h-[280px]">
          {image ? (
            <Image
              data={image}
              aspectRatio="16/9"
              sizes="(min-width: 1024px) 400px, 100vw"
              className="w-full h-full object-cover"
              loading="eager"
              alt={image.altText ?? t('collectionHero.imageAlt', {title})}
            />
          ) : (
            <div className="w-full h-full bg-[#f3f4f6]" />
          )}
        </div>

        {/* Single H1 — responsive size, one DOM node */}
        <h1
          id="collection-title"
          className="font-bold text-[28px] leading-tight text-[#111827] lg:text-[42px]"
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
