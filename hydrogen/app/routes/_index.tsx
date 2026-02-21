'use client';

import {Link, Form} from 'react-router';
import {Plus, Search} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';
import {Skeleton} from '~/components/ui/skeleton';
import {Separator} from '~/components/ui/separator';
import type {Route} from './+types/_index';

// ============================================================================
// Meta
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return [
    {title: 'Hy-lee | Home'},
    {
      name: 'description',
      content:
        'Discover unique products from trusted vendors worldwide. Shop electronics, fashion, home goods, and more.',
    },
  ];
}

// ============================================================================
// Product Card
// Figma: Card=ProductMedium — flex-col gap-2.5 p-2.5, 313×451px total
// Image: 293×316px placeholder  |  Add btn: bg-secondary rounded-[25px] h-10
// Price: $superscript-12px + amount-24px  |  Title: 14px Inter Medium
// ============================================================================

function ProductCard() {
  return (
    // Card overrides: strip default gap-6 / rounded-xl / border / py-6 / shadow-sm
    <Card className="gap-2.5 p-2.5 shrink-0 rounded-sm border-0 shadow-none bg-transparent">
      {/* Image placeholder — 293×316px; animate-none = static (not loading state) */}
      <Skeleton className="h-[316px] w-[293px] rounded-sm bg-surface animate-none" />

      {/* Add button — Figma: bg-secondary, rounded-[25px], h-10, px-5 */}
      <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-[25px] h-10 px-5 has-[>svg]:px-10 gap-2.5 self-start">
        {/* Figma: plus icon 25×25px */}
        <Plus size={25} />
        <span className="text-[14px] font-medium">Add</span>
      </Button>

      {/* Price — $ at 12px (top-left), amount at 24px, SemiBold, tracking-[0.5px] */}
      <div className="relative h-7 w-16 font-semibold text-black tracking-[0.5px] whitespace-nowrap shrink-0">
        <span className="absolute left-2 top-0 text-[24px] leading-6">
          <sup>$</sup>0.00
        </span>
      </div>

      {/* Product title — 14px Inter Medium */}
      <p className="text-[14px] font-medium text-black">Product Title</p>
    </Card>
  );
}

// ============================================================================
// Product Section
// Compact header row (title left + "See all" right) above card row.
// Matches Walmart-style: ~20px bold, no underline, no double-heading.
// ============================================================================

function ProductSection({
  categoryLabel,
  seeAllUrl,
}: {
  categoryLabel: string;
  seeAllUrl: string;
}) {
  return (
    <div className="flex flex-col pb-4 w-full overflow-x-auto">
      {/* Shared container — width = cards content, centered on page */}
      <div className="mx-auto w-fit">
        {/* Header — spans exactly the cards width */}
        <div className="flex items-center justify-between py-3">
          <h2 className="text-[20px] font-bold text-black leading-tight">
            {categoryLabel}
          </h2>
          <Link
            to={seeAllUrl}
            className="text-[14px] font-medium text-secondary hover:underline shrink-0 pl-6"
          >
            See all
          </Link>
        </div>

        {/* Cards row */}
        <div className="flex gap-2.5">
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// Full homepage layout per Figma node 201:155 (1440×2554px)
// ============================================================================

export default function Homepage() {
  return (
    <>
      {/* ================================================================ */}
      {/* HERO — Figma node 203:267                                        */}
      {/* bg-hero (#14b8a6), h-[422px], shadow, centered logo + search    */}
      {/* ================================================================ */}
      <section
        className="relative flex flex-col h-[522px] items-center justify-center px-4 sm:px-[157px] py-[59px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full shrink-0 mb-8 bg-cover bg-center bg-hero"
        style={{backgroundImage: "url('/hero-bg.jpg')"}}
      >
        {/* Teal scrim over the photo */}
        <div
          className="absolute inset-0 bg-hero/10 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col gap-[17px] items-center justify-center overflow-clip px-4 sm:px-[221px] py-[17px] w-full">
          {/* White full Hylee logo — Figma: Logo=Alternate, 183×101.821px */}
          <img
            src="/logo-white.png"
            alt="Hylee"
            className="h-[101.821px] w-[183px] object-cover shrink-0"
            loading="eager"
          />
          {/* Search form — Figma: white bg, border-secondary, rounded-[25px], h-10, max-w-[683px] */}
          <Form
            action="/search"
            method="get"
            className="flex items-center bg-white border border-secondary rounded-[25px] h-10 px-3.5 w-full max-w-[683px] overflow-hidden"
          >
            <input
              type="search"
              name="q"
              placeholder="Search Our Products"
              autoComplete="off"
              className="flex-1 text-[14px] font-medium text-dark placeholder:text-black/50 bg-transparent outline-none focus:outline-none focus:ring-0 border-none min-w-0"
            />
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 flex items-center pl-2 focus:outline-none"
            >
              <Search size={28} className="text-text-muted" />
            </button>
          </Form>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PRODUCTS CONTAINER — Figma node 218:476 (1440×1778px)           */}
      {/* ================================================================ */}
      <div className="flex flex-col items-start w-full gap-10">
        {/* What's New — Figma node 218:337 */}
        <ProductSection
          categoryLabel="What's New"
          seeAllUrl="/collections/what-s-new"
        />

        {/* Summer/Winter/Fall Collection — Figma node 218:384 */}
        <ProductSection
          categoryLabel="Summer/Winter/Fall Collection"
          seeAllUrl="/collections/summer-collection"
        />

        {/* ============================================================== */}
        {/* PROMOTIONS & DISCOUNTS — Figma node 218:430                    */}
        {/* Section header h-25 xl:px-[122px], card frame 861×314px        */}
        {/* ============================================================== */}
        <Separator className="w-full" />
        <div className="flex flex-col pb-8 w-full">
          <div className="mx-auto w-full max-w-[920px] px-4">
            {/* Section header */}
            <div className="flex items-center py-3">
              <h2 className="text-[20px] font-bold text-black leading-tight">
                Promotions &amp; Discounts
              </h2>
            </div>

            {/* Masonry grid: featured (left half) + 4 badges (right 2×2) */}
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[340px]">
              {/* Featured promo — spans 2 cols, full height */}
              <div className="col-span-2 row-span-2 bg-secondary rounded-xl p-8 flex flex-col justify-between text-white">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">
                    Limited Time
                  </p>
                  <p className="text-[72px] font-black leading-none mt-2">
                    20%
                  </p>
                  <p className="text-[32px] font-bold leading-none -mt-2">
                    OFF
                  </p>
                  <p className="text-[15px] mt-4 opacity-90 max-w-[200px] leading-snug">
                    Select Home Appliances — through March 1st
                  </p>
                </div>
                <Button className="bg-white text-secondary hover:bg-white/90 rounded-[100px] w-fit px-6 h-10 text-[14px] font-semibold">
                  Shop the Sale
                </Button>
              </div>

              {/* Badge: New Arrivals */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-70">
                    New Arrivals
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Up to 30% off
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Fashion &amp; Accessories
                  </p>
                </div>
                <Link
                  to="/collections/new"
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  Shop now →
                </Link>
              </div>

              {/* Badge: Flash Sale */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 opacity-70">
                    Flash Sale
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    $15 off $75+
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Code: FLASH15
                  </p>
                </div>
                <Link
                  to="/collections/sale"
                  className="text-[12px] font-semibold text-amber-700 hover:underline"
                >
                  Claim offer →
                </Link>
              </div>

              {/* Badge: Bundle Deal */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-70">
                    Bundle Deal
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Buy 2, Get 1
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Free on select items
                  </p>
                </div>
                <Link
                  to="/collections/bundles"
                  className="text-[12px] font-semibold text-secondary hover:underline"
                >
                  Shop now →
                </Link>
              </div>

              {/* Badge: Members Only */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 opacity-70">
                    Members Only
                  </p>
                  <p className="text-[20px] font-bold text-black leading-tight mt-1">
                    Extra 10% off
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">
                    Sign in to unlock
                  </p>
                </div>
                <Link
                  to="/account"
                  className="text-[12px] font-semibold text-rose-600 hover:underline"
                >
                  Sign in →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
