# Hero Banner Variants — Implementation Plan

**Goal:** Produce three visually distinct, enterprise-quality hero banner variants on
separate branches so the team can compare them side-by-side and choose one to merge.

**Status:** Planning

---

## Context

Two hero banners are in scope:

### 1. Homepage hero — `HeroCarousel.tsx` + `_index.tsx`
A cycling image/video carousel. Currently shows a centered logo + search bar overlay,
which reads as a splash screen rather than a storefront. The background cycling
mechanic is solid and stays. What changes is the content block on top of it.

### 2. All Products page hero — `collections.all.tsx`
A static dark page-header (`bg-dark`) with a radial-gradient teal glow and large
heading/subheading text. Currently:
- Does **not** use `collectionImage` even though the loader already fetches it
- Has an **inline style violation** (`style={{ background: 'radial-gradient(...)' }}`)
  that must be fixed regardless of which variant wins
- Has no CTA button

The All Products hero is simpler (static, no carousel) so it does **not** need three
variants — it will be updated in the same branch as the winning homepage variant to
maintain visual consistency. Each variant branch should include a matching upgrade
to `collections.all.tsx`.

---

Existing hero fields on the `hero_slide` metaobject:
- `background_image`, `video_url`, `bg_color`, `sort_order`, `active`

All three variants require per-slide CMS text, so we will add three new fields to the
`hero_slide` metaobject before branching:
- `headline` — Single line text (e.g. *"Live Large in Any Space"*)
- `subheadline` — Single line text (e.g. *"Furniture, power, and essentials for tiny
  homes, vans, and small apartments"*)
- `cta_label` — Single line text (e.g. *"Shop All"*)
- `cta_url` — URL (e.g. `/collections/all`)

These fields are shared by all three variants. The branches differ only in how they
display that content.

---

## Phase 0 — Shopify Admin Setup (do once, before any branch work)

Complete this before writing any code. All three branches will depend on these fields
being present in the metaobject schema.

1. Admin → **Settings** → **Custom data** → **Metaobjects**
2. Open the `hero_slide` type
3. Add four new fields:

| Field key | Type | Required |
|-----------|------|----------|
| `headline` | Single line text | No |
| `subheadline` | Single line text | No |
| `cta_label` | Single line text | No |
| `cta_url` | URL | No |

4. Save the definition
5. Open each active slide entry (Admin → **Content** → **Metaobjects** →
   `hero_slide`) and populate the new fields
6. Verify fields appear in the Storefront API:

```graphql
{
  metaobjects(type: "hero_slide", first: 3) {
    nodes {
      fields { key value }
    }
  }
}
```

---

## Phase 1 — Shared Code Changes (one PR, merged to main first)

Before creating the variant branches, land a single prep PR that:

- Updates `CarouselSlide` interface to include `headline`, `subheadline`,
  `ctaLabel`, `ctaUrl`
- Updates `buildHeroSlides()` in `_index.tsx` to parse the four new fields
- Updates `HERO_SLIDES_QUERY` in `_index.tsx` to request the new fields
- Updates `HeroCarouselProps` to accept the new content fields

**Branch:** `feature/components/hero-banner-prep`
**Commit:** `feat(components): extend hero_slide metaobject schema and CarouselSlide type`

This keeps all three variant branches diff-minimal and conflict-free.

---

## Phase 2 — Three Variant Branches (from main after Phase 1 merges)

Each branch forks from `main` after the prep PR is merged. Each modifies only
`HeroCarousel.tsx` (and its call-site in `_index.tsx` if needed).

---

### Variant A — Centered Editorial
**Branch:** `feature/components/hero-banner-variant-a`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  [full-width background image / video]               │
│                   dark scrim                         │
│                                                      │
│              HEADLINE (3xl–5xl bold)                 │
│        Subheadline (lg, white/80 opacity)            │
│                                                      │
│              [ Shop All → ]                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Remove logo entirely from hero (it lives in the header)
- Remove search bar from hero (it lives in the header)
- Headline: white, bold, 3xl on mobile → 5xl on desktop
- Subheadline: white/80, regular weight, lg
- Single primary CTA button using `bg-primary` (green)
- Content centered vertically and horizontally
- Scrim opacity bumped to 40% for better text contrast
- Slide dots navigation at the bottom center

**Effort:** Low — minimal layout change, highest impact

---

### Variant B — Left-Aligned Panel
**Branch:** `feature/components/hero-banner-variant-b`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                    [background image]│
│ ┌──────────────────────────┐                         │
│ │  HEADLINE (4xl bold)     │                         │
│ │  Subheadline (md)        │                         │
│ │                          │                         │
│ │  [ Shop All → ]          │                         │
│ └──────────────────────────┘                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Text block anchored to the left, takes up ~50% of hero width
- Semi-transparent dark panel behind text (bg-black/50 with subtle backdrop blur)
- No scrim across the full hero — right side of background image is fully visible
- Headline white, 4xl, bold
- Two CTAs: primary (Shop All) + ghost/outline (Browse Categories)
- Panel has `rounded-r-2xl` on desktop, full-width on mobile
- Background image/video still covers full width

**Effort:** Medium — requires layout restructure inside the content block

---

### Variant C — Bottom-Anchored Editorial
**Branch:** `feature/components/hero-banner-variant-c`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│         [background image / video breathes]          │
│                                                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│  HEADLINE (4xl bold, left)       [ Shop All → ]      │
│  Subheadline (sm, white/70)                          │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Background image/video occupies the upper 75% of the hero, no text on top
- Text strip anchored to the bottom: gradient from transparent → bg-black/70
- Headline and CTA on the same row (space-between), headline left / CTA right
- Subheadline below headline, left-aligned, small and muted
- Most "editorial" / high-fashion feel — the image is the story
- Slide dot navigation sits above the text strip

**Effort:** Medium — requires restructuring the layout layers

---

## Phase 3 — Implementation Checklist (per variant)

Each branch must complete the following before requesting review:

**Homepage hero (`HeroCarousel.tsx`):**
- [ ] New layout implemented
- [ ] `CarouselSlide` prop types used correctly (no `any`)
- [ ] Fallback: graceful when `headline`/`subheadline`/`ctaLabel` are null/empty
- [ ] Slide transition still works (crossfade between slides)
- [ ] `prefers-reduced-motion` still respected

**All Products hero (`collections.all.tsx`):**
- [ ] Inline style (`style={{ background: 'radial-gradient(...)' }}`) removed — replaced with Tailwind or a design token
- [ ] `collectionImage` used as a background or decorative element where it exists
- [ ] Visual language consistent with the homepage variant on this branch

**Both:**
- [ ] Mobile layout reviewed at 390px
- [ ] Desktop layout reviewed at 1440px
- [ ] No hardcoded colors — design tokens only (`bg-primary`, `text-white`, etc.)
- [ ] No inline styles (use Tailwind arbitrary values if needed)
- [ ] `pnpm format && pnpm typecheck && pnpm build` all pass

---

## Phase 4 — Review & Decision

Once all three PRs are open:

1. Deploy each branch to a preview URL (Oxygen preview deploys via GitHub PR)
2. Review with Shawn and Darian against live content
3. Pick one variant, merge its PR, close the other two

The "losing" branches do not need to be deleted immediately — they can be kept for
reference or as a starting point if the direction changes.

---

## Branching Summary

| Branch | Forks from | Purpose |
|--------|-----------|---------|
| `feature/components/hero-banner-prep` | `main` | Shared type + query changes |
| `feature/components/hero-banner-variant-a` | `main` (after prep merges) | Centered editorial |
| `feature/components/hero-banner-variant-b` | `main` (after prep merges) | Left-aligned panel |
| `feature/components/hero-banner-variant-c` | `main` (after prep merges) | Bottom-anchored |

## Commit Format

```
feat(components): hero banner variant A — centered editorial layout
feat(components): hero banner variant B — left-aligned panel layout
feat(components): hero banner variant C — bottom-anchored editorial layout
```

---

## Files Touched Per Variant

| File | Prep PR | Variant branches |
|------|---------|-----------------|
| `app/components/home/HeroCarousel.tsx` | Interface update | Layout rewrite |
| `app/routes/_index.tsx` | Query + parser update | Call-site update (if needed) |
| `app/routes/collections.all.tsx` | — | Hero upgrade + inline style fix |

No other files should need changes.
