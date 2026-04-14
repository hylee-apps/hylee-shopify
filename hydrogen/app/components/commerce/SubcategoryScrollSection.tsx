'use client';

import {useRef} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';

export type SubcollectionNode = {
  handle: string;
  title: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

interface SubcategoryScrollSectionProps {
  subcollections: SubcollectionNode[];
}

const TILE_SIZE = 180;
const SCROLL_AMOUNT = TILE_SIZE * 3 + 20 * 3; // 3 tiles + gaps per scroll step

/**
 * SubcategoryScrollSection — horizontal scroll row of subcategory tiles.
 *
 * Tiles are 180×180px with object-contain so the entire image is always
 * visible without cropping.
 */
export function SubcategoryScrollSection({
  subcollections,
}: SubcategoryScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!subcollections.length) return null;

  function scrollLeft() {
    scrollRef.current?.scrollBy({left: -SCROLL_AMOUNT, behavior: 'smooth'});
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({left: SCROLL_AMOUNT, behavior: 'smooth'});
  }

  return (
    <section className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-[20px] text-[#111827] leading-[30px]">
          Categories
        </h2>
        {/* Scroll controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll categories left"
            className="flex items-center justify-center size-9 rounded-full bg-white border border-[#d1d5db] text-[#4b5563] hover:bg-gray-50 transition-colors shrink-0"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll categories right"
            className="flex items-center justify-center size-9 rounded-full bg-white border border-[#d1d5db] text-[#4b5563] hover:bg-gray-50 transition-colors shrink-0"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto overflow-y-hidden pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {subcollections.map((sub) => (
          <Link
            key={sub.handle}
            to={`/collections/${sub.handle}`}
            className="flex flex-col items-center gap-3 shrink-0 group"
          >
            {/* Square image tile — 180×180px, object-contain so full image shows */}
            <div
              className="flex items-center justify-center"
              style={{width: TILE_SIZE, height: TILE_SIZE}}
            >
              {sub.image ? (
                <Image
                  data={sub.image}
                  aspectRatio="1/1"
                  sizes={`${TILE_SIZE}px`}
                  className="w-full h-full object-contain rounded-[12px] transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center rounded-[12px] bg-[#f3f4f6] text-[#9ca3af] text-sm font-medium">
                  {sub.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Label */}
            <span
              className="font-medium text-[14px] text-[#374151] text-center leading-[1.3] group-hover:text-[#111827] transition-colors"
              style={{maxWidth: TILE_SIZE}}
            >
              {sub.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
