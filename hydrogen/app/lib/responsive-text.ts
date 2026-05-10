import {cva, type VariantProps} from 'class-variance-authority';

/**
 * Responsive typography recipe. Replaces ad-hoc `text-[Npx]` strings scattered
 * across pages so a single source defines how each role scales from mobile up.
 *
 * Sizes track Figma desktop frames at the `lg` step; `sm` and base steps are
 * derived for tablet and phone. Pair with `font-semibold`/`font-medium` etc. at
 * the call site — this recipe owns size + line-height only.
 */
export const headingText = cva('', {
  variants: {
    size: {
      // Hero / homepage marquee
      display: 'text-[28px] leading-[1.1] sm:text-[36px] lg:text-[48px]',
      h1: 'text-[24px] leading-tight sm:text-[28px] lg:text-[32px]',
      h2: 'text-[20px] leading-snug sm:text-[22px] lg:text-[24px]',
      h3: 'text-[18px] leading-snug sm:text-[18px] lg:text-[20px]',
      'body-lg': 'text-base leading-relaxed sm:text-[17px] lg:text-[18px]',
      body: 'text-sm leading-relaxed sm:text-base',
    },
  },
  defaultVariants: {
    size: 'body',
  },
});

export type HeadingTextProps = VariantProps<typeof headingText>;
