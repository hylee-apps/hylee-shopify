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

const SCROLL_AMOUNT = 140; // 120px tile + 20px gap

/**
 * SubcategoryScrollSection — horizontal scroll row of subcategory tiles.
 *
 * Figma: file LXJLDI1fRXble63hVJcg7A, node 5006:698
 * - "Categories" heading (20px medium #111827) + prev/next circular arrow buttons
 * - Horizontal overflow scroll, scrollbar hidden
 * - Each tile: 120×120px square rounded-[8px] image + 13px label below
 */
export function SubcategoryScrollSection({
  subcollections,
}: SubcategoryScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!subcollections.length) return null;

  function scrollLeft() {
    scrollRef.current?.scrollBy({left: -SCROLL_AMOUNT * 3, behavior: 'smooth'});
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({left: SCROLL_AMOUNT * 3, behavior: 'smooth'});
  }

  return (
    <section className="max-w-350 mx-auto w-full px-6 pb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-medium text-[20px] text-[#111827] leading-[30px]">
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
            className="flex flex-col items-center gap-[11px] shrink-0 group"
          >
            {/* Square image tile — 120×120px, rounded-[8px] */}
            <div className="size-[120px] rounded-[8px] bg-[#f3f4f6] shadow-sm overflow-hidden">
              {sub.image ? (
                <Image
                  data={sub.image}
                  aspectRatio="1/1"
                  sizes="120px"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center text-[#9ca3af] text-xs font-medium">
                  {sub.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Label */}
            <span className="font-medium text-[13px] text-[#374151] text-center leading-[1.3] max-w-[120px] group-hover:text-[#111827] transition-colors">
              {sub.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
