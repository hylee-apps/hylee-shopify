# Footer — Figma Design Spec

## Source

- **File key**: `eWh354xJwjwpuedg2yjkFl`
- **File name**: Home - Nav - Project Launch
- **Node ID**: `1796:105`

## Overall Frame
- **Dimensions**: 1440 × 266px
- **Background**: white → `bg-white`
- **Padding**: 122px horizontal, 59px vertical
- **Layout**: absolute positioning in Figma → translate to flex

---

## Layout (responsive translation)

The Figma uses absolute positioning within a 148px content area. Translates to:

### Left Column (240px)
- **Logo**: `Logo=Default` (full "HyLee"), 183 × 102px
  - Asset: `/logo-full.png`
  - Fit: `object-cover`
- **"Follow us on social media"**: 14px Inter Medium, text-black
  - Gap: 5px below logo
- **Social icons**: 4 icons, 20 × 20px each, gap-[10px]
  - Icons: black at 20% opacity (placeholder squares in Figma)
  - Gap: 5px below text

### Right Area (positioned at ~left-318 in Figma, centered in content)

**Newsletter heading:**
- "Sign Up for HyLee news & updates!"
- 20px Inter Regular (400), text-black, line-height 1.2

**Newsletter input (below heading):**
- Input field: 270 × 41px, border-1 `--secondary` (#2699a6), rounded-[25px], bg-white
- Placeholder: 14px Inter Medium, text-black/50
- Submit button: 100 × 40px, bg-secondary, rounded-[25px]
  - Text: 14px Inter Medium, white

**Nav links (below newsletter):**
- Row of 5 links, flex, p-[10px] wrapper
- Each link: h-[40px], px-[16px], py-[10px], rounded-[8px]
- Text: 14px Inter Medium, #666 → `text-text-muted`
- Links: About, Terms of Use, Privacy Policy, Help, Become a Supplier

---

## Design Tokens

| Token | Value | Tailwind |
|-------|-------|----------|
| `--secondary` | `#2699a6` | `*-secondary` |
| text color | `#666` | `text-text-muted` |
| heading color | `#000` | `text-black` |

## Typography

- **Heading**: 20px Inter Regular (400) → `text-[20px] font-normal`
- **Body/links**: 14px Inter Medium (500) → `text-[14px] font-medium`
- **Placeholder**: 14px Inter Medium, rgba(0,0,0,0.5) → `text-black/50`

## Key Differences from Current Implementation

1. **Newsletter input border**: 1px secondary (was 2px primary)
2. **Submit button**: `bg-secondary` teal (was `bg-primary` green), `rounded-[25px]` (was rounded-full)
3. **Heading**: 20px font-normal text-black (was text-xl font-normal text-text)
4. **Social icons**: 20×20px squares with gap-[10px] (was 28px circles with gap-2.5)
5. **"Follow us" text**: text-black (was text-text)
6. **Logo**: Full "HyLee" at 183×102px (current uses conditional logoUrl)
7. **Nav links**: Consistent h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted (was text-sm)
