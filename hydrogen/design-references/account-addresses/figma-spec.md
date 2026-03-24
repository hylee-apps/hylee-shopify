# Address Book Page — Figma Spec

> **Figma File Key**: `Q541sIDD20eXqQSSozFUw4`
> **Node ID**: `19:968`
> **Figma URL**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=19-968
> **Captured**: 2026-03-24
> **Frame Width**: ~1000px (content area inside sidebar layout)

---

## Page Header

- **Title**: "Address Book"
  - Font: Roboto Light (300)
  - Size: 28px
  - Line height: 42px
  - Color: `#111827` (gray-900)
- **Subtitle**: "Manage your contacts and addresses"
  - Font: Roboto Regular (400)
  - Size: 15px
  - Line height: 22.5px
  - Color: `#4b5563` (gray-600)
- **Spacing**: 8px gap between title and subtitle
- **Container padding**: 24px horizontal, 32px top

---

## Category Bar

Horizontal pill navigation for top-level categories: Home, Family, Friends, Work, Other.

- **Container**:
  - `bg-white`
  - `border-2 border-[#a8d5a0]` (light green border)
  - `rounded-[8px]`
  - `px-[18px] py-[10px]`
  - `overflow-auto` (horizontal scrolling on mobile)
  - Full width (left-24px to right-24px)
  - Top offset: 136.5px from top of content area (below header)

- **Each pill (inactive)**:
  - `rounded-[4px]`
  - `px-[16px] py-[12px]`
  - Flex row, `gap-[8px]` between icon and label
  - Icon: Font Awesome 18px `text-[#4b5563]` → **Use Lucide icons** at 18px, `text-gray-600`
  - Label: Roboto Medium (500), 16px, `leading-[24px]`, `text-[#4b5563]`
  - No background

- **Active pill**:
  - `bg-[#2ac864]` (primary green)
  - `rounded-[4px]`
  - Icon + label both `text-white`
  - Same padding/font as inactive

### Category Icons (Lucide mapping)
| Category | Figma (FA) | Lucide |
|----------|-----------|--------|
| Home | house | `Home` |
| Family | users | `Users` |
| Friends | user-friends | `UserPlus` or `Heart` |
| Work | briefcase | `Briefcase` |
| Other | map-marker-alt | `MapPin` |

---

## Subcategory Bar (Family category only)

Horizontal pills for subcategories: Parents, Sibling, Children, Aunt & Uncles, Cousins, Grandparents.

- **Container**:
  - `border-b border-[#e5e7eb]` (gray-200 bottom border)
  - `pt-[16px] pb-[17px]`
  - Flex row, `gap-[24px]`
  - `overflow-auto`
  - Full width

- **Each pill (inactive)**:
  - `rounded-[4px]`
  - `px-[12px] py-[8px]`
  - Font: Roboto Regular (400), 15px, `leading-[22.5px]`
  - Color: `#4b5563` (gray-600)
  - No background

- **Active pill**:
  - `bg-[rgba(42,200,100,0.1)]` → `bg-primary/10`
  - Font: Roboto Medium (500), 15px, `leading-[22.5px]`
  - Color: `#2ac864` (primary green) → `text-primary`
  - `rounded-[4px]`

---

## Relationship Bar

Shown below subcategory bar. Equal-width pills for relationship types within the selected subcategory (e.g., "Son", "Daughter" for Children).

- **Container**:
  - Flex row, `gap-[16px]`
  - Height: 59px
  - Full width, `justify-center`

- **Each pill (inactive)**:
  - `flex-1` (equal width)
  - `border-2 border-transparent`
  - `rounded-[8px]`
  - `p-[18px]`
  - Text: Roboto Medium (500), 15px, `leading-[22.5px]`, `text-[#1f2937]` (gray-800), centered

- **Active pill**:
  - Same as inactive but with visible border (e.g., `border-primary`)
  - Or `bg-primary/10` highlight

---

## Subsection Header

Shown for the selected subcategory/relationship combination.

- **Container**:
  - Flex row, `justify-between`, `items-center`
  - `border-b-2 border-[#2ac864]` (primary green bottom border)
  - `pb-[18px]`
  - Full width

- **Left side** (icon + text):
  - Flex row, `gap-[12px]`, `items-center`
  - **Icon circle**: 40px, `bg-[#2ac864]` (primary), `rounded-[20px]` (full circle)
    - Icon: white, 18px (Lucide icon matching the subcategory)
  - **Title**: Roboto SemiBold (600), 20px, `leading-[30px]`, `text-[#111827]` (gray-900)
  - **Description**: Roboto Regular (400), 13px, `leading-[19.5px]`, `text-[#6b7280]` (gray-500)
    - e.g., "Manage your children's information and addresses"

- **Right side** ("Add" button):
  - `bg-[#4fd1a8]` (brand-accent)
  - `rounded-[8px]`
  - `px-[16px] py-[8px]`
  - Flex row, `gap-[16px]`, centered
  - "+" icon: 14px white
  - Label: Roboto Medium (500), 14px, white, centered
  - e.g., "Add Child"

---

## Stats Bar

Three equal-width stat cards showing counts for the active subsection.

- **Container**: Flex row, `gap-[16px]`, height 79px, full width

- **Each stat card**:
  - `bg-white`
  - `border border-[#e5e7eb]` (gray-200)
  - `rounded-[8px]`
  - `p-[17px]`
  - `flex-1` (equal width)
  - Flex row, `gap-[12px]`, `items-center`

  - **Icon square**: 36px, `rounded-[8px]`
    - Card 1 (Sons): `bg-[rgba(42,200,100,0.1)]`, icon `text-[#2ac864]` (primary)
    - Card 2 (Daughters): `bg-[rgba(242,176,94,0.1)]`, icon `text-[#f2b05e]` (amber)
    - Card 3 (Total): `bg-[rgba(79,209,168,0.1)]`, icon `text-[#4fd1a8]` (brand-accent)
    - Icon size: 16px

  - **Text column**:
    - Label: Roboto Regular (400), 12px, `leading-[18px]`, `text-[#6b7280]` (gray-500), `uppercase`, `tracking-[0.5px]`
    - Value: Roboto SemiBold (600), 18px, `leading-[27px]`, `text-[#111827]` (gray-900)

### Stats Labels by Subcategory
| Subcategory | Stat 1 | Stat 2 | Stat 3 |
|-------------|--------|--------|--------|
| Children | Sons | Daughters | Total Children |
| Parents | Mothers | Fathers | Total Parents |
| Siblings | Brothers | Sisters | Total Siblings |
| Aunt & Uncles | Aunts | Uncles | Total |
| Cousins | Male | Female | Total Cousins |
| Grandparents | Grandmothers | Grandfathers | Total Grandparents |

---

## "Child Contacts" Section Header

- Flex row, `gap-[8px]`, `items-center`
- Icon: list icon, 16px, `text-[#9ca3af]` (gray-400)
- Text: Roboto Medium (500), 16px, `leading-[24px]`, `text-[#374151]` (gray-700)

---

## Contact Cards Grid

- **Layout**: 2-column grid with 16px gap (8px gap in Figma between the two card columns)
  - On Figma: each card is ~50% width minus gap
  - Cards start below "Child Contacts" header

### Contact Card

- **Container**:
  - `bg-white`
  - `border border-[#e5e7eb]` (gray-200)
  - `rounded-[12px]`
  - `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]` (shadow-sm)
  - `overflow-clip`
  - `p-px` (1px padding for border rendering)

- **Card Header**:
  - `bg-[#f9fafb]` (gray-50)
  - `border-b border-[#e5e7eb]`
  - `px-[20px] pt-[16px] pb-[17px]`
  - Flex row, `justify-between`, `items-center`

  - **Name**: Roboto SemiBold (600), 16px, `leading-[24px]`, `text-[#111827]`

  - **Action buttons**: Flex row, `gap-[8px]`
    - **Edit button**: 32px square, `bg-[#4fd1a8]` (brand-accent), `rounded-[8px]`
      - Icon: pencil/edit, 13px, white, centered
    - **Delete button**: 32px square, `bg-[#fee2e2]` (red-100), `rounded-[8px]`
      - Icon: trash, 13px, `text-[#1f2937]` (gray-800), centered

- **Card Body**:
  - `p-[20px]`
  - Flex column, `gap-[16px]`

  - **Info Row** (repeated for Address, Phone, Email):
    - `border-b border-[#f3f4f6]` (gray-100) — except last row
    - Flex between main info and side label
    - Padding-bottom implicit from gap

    - **Main info** (left):
      - **Label**: Roboto Regular (400), 12px, `leading-[18px]`, `text-[#6b7280]` (gray-500), `uppercase`, `tracking-[0.5px]`
      - **Value**: Roboto Regular (400), 14px, `leading-[22.4px]`, `text-[#374151]` (gray-700)
      - Gap between label and value: 4px
      - Address value is multi-line (street + city/state/zip)

    - **Side label** (right-aligned):
      - Roboto Regular (400), 11px, `leading-[16.5px]`, `text-[#9ca3af]` (gray-400), `uppercase`, `tracking-[0.5px]`, `text-right`
      - e.g., "Other Address", "Other Numbers", "Other Email"
      - Acts as a clickable link/button to show additional entries

---

## Add New Contact Card (Empty State / CTA)

- **Container**:
  - `bg-[#f9fafb]` (gray-50)
  - `border border-[#d1d5db] border-dashed` (gray-300 dashed)
  - `rounded-[12px]`
  - `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
  - `min-h-[200px]`
  - Flex column, `items-center justify-center`

- **Icon circle**: 60px, `bg-white`, `rounded-full`, `shadow-sm`
  - "+" icon: 24px, `text-[#4fd1a8]` (brand-accent)
  - Bottom margin: 12px

- **Title**: "Add New Contact"
  - Roboto Medium (500), 16px, `leading-[24px]`, `text-[#374151]` (gray-700)
  - Bottom margin: 4px

- **Subtitle**: "Add a new address to this category"
  - Roboto Regular (400), 14px, `leading-[21px]`, `text-[#6b7280]` (gray-500)

---

## Implementation Notes

### Figma vs Project Convention Deviations

| Item | Figma | Implementation | Reason |
|------|-------|---------------|--------|
| Icons | Font Awesome | Lucide React | Project convention |
| Font | Roboto | Roboto | No change — already loaded in root.tsx |
| Category bar border | `#a8d5a0` | `border-[#a8d5a0]` (custom) | No existing token for this light green; use arbitrary value |
| Stats icon colors | Custom per stat | Arbitrary Tailwind values | No tokens for amber `#f2b05e` or brand-accent `#4fd1a8` in stats context |
| Relationship bar | Shows if subcategory has relationship types | Conditional render | Only render when `FAMILY_SUBCATEGORIES` entry has relationships |

### Responsive Translation

- **Desktop (>=1024px)**: Full layout with sidebar (280px) + main content, 2-column contact grid
- **Tablet (640–1023px)**: No sidebar, full-width content, 2-column contact grid
- **Mobile (<640px)**: No sidebar, full-width, 1-column contact grid, category bar scrollable horizontally
- Category bar: `overflow-x-auto` with `flex-nowrap`
- Subcategory bar: `overflow-x-auto` with `flex-nowrap`
- Stats bar: stack to `flex-col` on mobile
- Contact cards: `grid-cols-1 sm:grid-cols-2`
