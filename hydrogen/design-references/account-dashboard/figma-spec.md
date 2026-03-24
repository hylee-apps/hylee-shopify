# Account Dashboard — Figma Spec

- **Figma URL**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=2-530
- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `2:530`
- **Captured**: 2026-03-23

## Layout

Two-column layout within a centered container:

- **Page container**: `max-w-[1200px]`, `px-[24px]`, `py-[32px]`, `gap-[32px]`, centered
- **Sidebar**: `w-[280px]`, sticky `top-0`
- **Main content**: `w-[840px]`, `min-h-[600px]`, `gap-[24px]` between sections

## Left Sidebar (`aside.account-sidebar`)

- **Container**: bg-white, border 1px #e5e7eb, rounded-[12px], shadow-sm, sticky top-0, `px-[25px] pt-[25px] pb-[33px]`, gap-[24px]
- **Avatar section**: 169px height, border-bottom #e5e7eb
  - **Avatar circle**: 80px, centered, gradient `135deg from #2699a6 to #2bd9a8`, rounded-full
  - **Initials**: 32px, font-medium, white, centered
  - **Name**: 18px, font-semibold, #1f2937, centered, top offset 92px
  - **Email**: 14px, font-normal, #6b7280, centered, top offset 123px

- **Navigation**: flex-col, gap-[8px]
  - **Nav item**: px-[16px] py-[12px], rounded-[8px], gap-[12px] between icon+label
  - **Active item**: bg `rgba(38,153,166,0.1)` (secondary/10), text #2699a6
  - **Inactive item**: text #4b5563
  - **Icon**: 20px wide container, 15px font-awesome icon
  - **Label**: 15px, font-medium

- **Nav items**: Dashboard, My Orders, Wishlist, Addresses, Payment Methods, Notifications, Settings
- **Sign Out**: separated by border-t #e5e7eb, pt-[25px], text #dc2626 (red)

## Main Content (`main.account-main`)

### 1. Welcome Banner (`div.welcome-banner`)
- Gradient: `135deg from #2699a6 to #2bd9a8`
- Padding: 32px, rounded-[16px]
- **Title**: "Welcome back, John!" — 24px, font-light, white
- **Subtitle**: "Here's what's happening with your account today." — 16px, font-normal, white, opacity-90

### 2. Stats Row (`div.account-stats`)
- 3 cards in a row, gap-[20px], h-[123px]
- **Stat card**: bg-white, border 1px #e5e7eb, rounded-[12px], shadow-sm, p-[25px], w-[266.66px], gap-[4px]
  - **Value**: 32px, font-bold, #2699a6 (secondary), centered
  - **Label**: 14px, font-normal, #6b7280, centered
- Stats: "Total Orders" (12), "Active Orders" (3), "Saved Addresses" (2)

### 3. Recent Orders Card (`div.card`)
- bg-white, border 1px #e5e7eb, rounded-[12px], shadow-sm, overflow-clip
- **Header**: border-bottom #e5e7eb, px-[24px] py-[20px], flex justify-between
  - Title: "Recent Orders" — 18px, font-bold, #111827
  - Link: "View All" — 15px, font-medium, #2699a6
- **Body**: p-[24px]
  - **Order row**: flex justify-between, py-[16px], border-bottom #f3f4f6 (except last)
    - **Left**: 60px square icon container (bg #f3f4f6, rounded-[8px]) + text block (gap-[16px])
      - Order ID: 16px, font-medium, #1f2937
      - Details: 14px, font-normal, #6b7280 (date + amount)
    - **Right**: status + date column, gap-[8px]
      - Status badge: px-[12px] py-[4px], rounded-[12px], 13px font-medium
        - "In Transit": bg `rgba(38,153,166,0.1)`, text #2699a6
        - "Delivered": bg `rgba(42,200,100,0.1)`, text #2ac864
      - Date/ETA: 13px, font-normal, #6b7280, text-right

### 4. Saved for Later Card (`div.card`)
- Same card styling as Recent Orders
- **Header**: "Saved for Later" title + "View Wishlist" link
- **Body**: 3-column product grid, gap-[16px], centered
  - **Product**: w-[252.66px]
    - Image placeholder: square, bg #f3f4f6, rounded-[8px], centered icon
    - Product name: 14px, font-medium, #1f2937, centered
    - Price: 14px, font-semibold, #2699a6, centered

## Typography Notes
- Figma uses **Roboto** — project uses **Inter**. Use Inter (project convention).
- Font weights: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)

## Token Mapping
| Figma Value | Tailwind Class |
|-------------|---------------|
| #2699a6 | `text-secondary`, `bg-secondary` |
| #2ac864 | `text-primary`, `bg-primary` |
| #1f2937 | `text-gray-800` |
| #111827 | `text-gray-900` |
| #4b5563 | `text-gray-600` |
| #6b7280 | `text-text-muted` |
| #9ca3af | `text-gray-400` |
| #e5e7eb | `border-border` |
| #f3f4f6 | `bg-surface` or `bg-gray-100` |
| #dc2626 | `text-red-600` |
| rgba(38,153,166,0.1) | `bg-secondary/10` |
| rgba(42,200,100,0.1) | `bg-primary/10` |

## Responsive Translation
- Figma frame is fixed 1920px. Container is 1200px centered.
- Sidebar: fixed 280px → keep fixed on desktop, hidden on mobile with hamburger toggle
- Main: 840px → `flex-1` on desktop, full-width on mobile
- Stats: 3 fixed-width cards → `grid-cols-1 md:grid-cols-3` with `flex-1`
- Product grid: 3 fixed-width → responsive grid
