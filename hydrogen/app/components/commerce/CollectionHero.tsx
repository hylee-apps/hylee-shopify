import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';

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
  /** Optional promotional headline (overrides title in banner) */
  promoHeadline?: string;
  /** Optional promotional CTA label */
  promoCta?: string;
  /** Optional promotional CTA link */
  promoCtaUrl?: string;
  className?: string;
}

/**
 * CollectionHero — promotional gradient banner or collection image hero.
 *
 * When a collection image exists, shows an image-based hero.
 * Otherwise shows a gradient promotional banner matching the PLP Figma design.
 */
export function CollectionHero({
  title,
  description,
  descriptionHtml,
  image,
  promoHeadline,
  promoCta = 'Shop Now',
  promoCtaUrl,
  className,
}: CollectionHeroProps) {
  // Gradient promotional banner (default for collections without images)
  if (!image) {
    const headline = promoHeadline || title;

    return (
      <section
        className={`collection-hero relative w-full overflow-hidden rounded-xl ${className ?? ''}`}
        style={{
          backgroundImage:
            'linear-gradient(37deg, rgb(244, 232, 243) 0%, rgb(243, 239, 246) 52%, rgb(238, 224, 249) 102%)',
        }}
      >
        <div className="flex min-h-[200px] items-center justify-between px-8 py-10 md:min-h-[280px] md:px-12">
          <div className="relative z-10 max-w-md">
            <h1 className="text-2xl font-bold leading-tight text-dark md:text-[34px]">
              {headline}
            </h1>
            {descriptionHtml ? (
              <div
                className="mt-3 text-sm text-text-muted"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            ) : description ? (
              <p className="mt-3 text-sm text-text-muted">{description}</p>
            ) : null}
            {promoCtaUrl && (
              <Link
                to={promoCtaUrl}
                className="mt-5 inline-flex items-center rounded-full bg-dark px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-dark/90"
              >
                {promoCta}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Image-based collection hero
  return (
    <section
      className={`collection-hero relative w-full overflow-hidden rounded-xl ${className ?? ''}`}
    >
      <div className="aspect-[4.8/1] w-full">
        <Image
          data={image}
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-md md:text-5xl">
            {title}
          </h1>
          {descriptionHtml ? (
            <div
              className="mt-3 text-base text-white/90 drop-shadow md:text-lg"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          ) : description ? (
            <p className="mt-3 text-base text-white/90 drop-shadow md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
