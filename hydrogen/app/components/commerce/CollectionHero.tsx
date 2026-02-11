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
  className?: string;
}

/**
 * CollectionHero — migrated from theme/snippets/collection-hero.liquid
 *
 * Displays collection title, description, and optional hero image.
 */
export function CollectionHero({
  title,
  description,
  descriptionHtml,
  image,
  className,
}: CollectionHeroProps) {
  if (image) {
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

  return (
    <section className={`collection-hero py-6 ${className ?? ''}`}>
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
      {descriptionHtml ? (
        <div
          className="mt-2 text-base text-slate-600"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      ) : description ? (
        <p className="mt-2 text-base text-slate-600">{description}</p>
      ) : null}
    </section>
  );
}
