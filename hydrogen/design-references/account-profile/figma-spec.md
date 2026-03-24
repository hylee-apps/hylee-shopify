# Account Profile / Settings Page — Figma Spec

> **File**: `Q541sIDD20eXqQSSozFUw4` (Account Pages)
> **Node**: `2:995`
> **Captured**: 2026-03-24

## Page Layout

- **Title**: "Profile Information" — font-light (300), 28px, `#1f2937`, leading-[42px]
- **Main content width**: 840px (flex-1 in responsive context)
- **Min height**: 600px
- **Gap between cards**: 24px
- **Padding bottom**: 24px

## Card 1: Personal Information

### Card Container
- Background: white
- Border: 1px solid `#e5e7eb` (`border-border`)
- Border radius: 12px (`rounded-xl`)
- Shadow: `0px 1px 2px 0px rgba(0,0,0,0.05)` (`shadow-sm`)
- Overflow: clip

### Card Header
- Padding: 20px top, 21px bottom, 24px horizontal
- Border bottom: 1px solid `#e5e7eb`
- Title: "Personal Information" — bold (700), 18px, `#111827`, leading-[27px]

### Card Body
- Padding: 24px all sides
- Gap: 32px between avatar section and form

### Avatar Section (data-node-id 2:1046)
- **Layout**: flex, gap-24px, align-center
- **Avatar circle** (data-node-id 2:1047):
  - Size: 100×100px
  - Border radius: 50px (fully round)
  - Background: `linear-gradient(135deg, #2699a6 0%, #2bd9a8 100%)` (secondary → brand-accent)
  - Initials: font-medium (500), 40px, white, leading-[60px]
- **Right side** (data-node-id 2:1049):
  - "Change Photo" button:
    - Background: white
    - Border: 1px solid `#d1d5db`
    - Border radius: 8px
    - Padding: 13px vertical, 25px horizontal
    - Gap: 8px (icon + text)
    - Icon: camera (Font Awesome in Figma → Lucide `Camera` in project)
    - Text: font-medium (500), 15px, `#374151`
  - Hint text: "JPG, GIF or PNG. Max size 2MB" — 13px, `#6b7280`, leading-[19.5px]
  - Gap between button and hint: 7.75px (~8px)

### Form Fields

**Shared input styling:**
- Background: white
- Border: 1px solid `#d1d5db` (gray-300)
- Border radius: 8px (`rounded-lg`)
- Padding: 13px vertical, 17px horizontal
- Font: 15px, black (`text-black` for values, `#757575` for placeholder)
- Focus: not specified in Figma — use project defaults (`focus:border-secondary focus:ring-1 focus:ring-secondary`)

**Shared label styling:**
- Font: medium (500), 14px, `#374151` (gray-700), leading-[21px]

**Field layout:**
1. **First Name + Last Name**: flex row, gap-16px, each flex-1; margin-bottom 20px
2. **Email Address**: full width, no top margin
3. **Phone Number**: full width, padding-top 20px
4. **Date of Birth**: full width, padding-y 20px; native date input with calendar picker icon

**Save Changes button:**
- Background: `#2699a6` (`bg-secondary`)
- Text: white, font-medium (500), 15px
- Padding: 12px vertical, 24px horizontal
- Border radius: 8px (`rounded-lg`)
- Width: fit-content

## Card 2: Change Password

### Card Container
- Same as Card 1 (white, border, rounded-xl, shadow-sm)
- Additional: gap-24px between header and form body, pb-[25px]

### Card Header
- Same styling as Card 1 header
- Title: "Change Password"

### Form Body
- Width: 790px in Figma → use `px-6` (24px) padding within card (840 - 24*2 - 2px border ≈ 790)
- Padding: 0 top (header gap handles it), 0 bottom within form

**Fields:**
1. **Current Password**: full width, placeholder "Enter current password"
2. **New Password + Confirm New Password**: flex row, gap-16px, each flex-1; padding-y 20px
3. **Update Password** button: same styling as "Save Changes"

## Responsive Translation

- **Desktop (≥1024px)**: 840px main content (flex-1 within sidebar layout max-w-[1200px])
- **Tablet (640px–1023px)**: full width, form rows stay side-by-side
- **Mobile (<640px)**: First/Last name stack to single column; New/Confirm password stack to single column; avatar section stacks vertically

## Token Mapping

| Figma Value | Tailwind Class |
|------------|----------------|
| `#2699a6` | `bg-secondary`, `text-secondary` |
| `#2bd9a8` | `--color-brand-accent` |
| `#1f2937` | `text-gray-800` |
| `#111827` | `text-gray-900` |
| `#374151` | `text-gray-700` |
| `#6b7280` | `text-gray-500` |
| `#d1d5db` | `border-gray-300` |
| `#e5e7eb` | `border-border` (`--color-border`) |
| `#757575` | `placeholder:text-gray-500` (closest) |
| `rgba(0,0,0,0.05)` | `shadow-sm` |

## Deviations from Figma (Documented)

- **Font**: Figma uses Roboto; project uses Roboto (loaded in root.tsx — no change needed)
- **Icons**: Figma uses Font Awesome; implementation uses Lucide React (project convention)
- **Photo upload**: Will be rendered as a disabled/placeholder button initially (photo upload requires file handling infrastructure)
- **Date of Birth**: Shopify Customer API does not natively support DOB — will be stored as metafield or rendered as disabled placeholder
- **Email field**: Shopify Storefront API `customerUpdate` does NOT support email changes — field will be read-only with helper text
