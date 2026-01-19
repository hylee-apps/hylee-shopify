# Creating Products in Shopify Admin

This guide explains how to create products in the Shopify admin that work correctly with the Hylee theme.

## Quick Start

1. Go to **Products** in your Shopify admin
2. Click **Add product**
3. Fill in the required fields (see below)
4. Add images, variants, and tags
5. Click **Save**

---

## Required Product Fields

| Field                | Description                      | Example                                 |
| -------------------- | -------------------------------- | --------------------------------------- |
| **Title**            | Product name                     | "Wireless Bluetooth Headphones"         |
| **Description**      | HTML content for product details | `<p>Premium headphones with ANC...</p>` |
| **Price**            | Selling price                    | 79.99                                   |
| **Compare at price** | Original price (for sales)       | 99.99                                   |
| **Vendor**           | Brand/supplier name              | "TechSound Pro"                         |

---

## Product Images

- **Featured image**: First image shown in grids (600x600 recommended)
- **Gallery images**: Additional views for PDP (800x800+ recommended)
- **Alt text**: Always add descriptive alt text for accessibility

### Image Recommendations

- Minimum: 600x600px
- Optimal: 1200x1200px
- Format: JPG or WebP
- Background: White or transparent

---

## Product Tags

Tags control badges and filtering. Use these conventions:

| Tag             | Effect                             |
| --------------- | ---------------------------------- |
| `new`           | Shows "New" badge on product cards |
| `bestseller`    | Shows "Bestseller" badge           |
| `free-shipping` | Shows "Free Shipping" indicator    |
| `sale`          | (Use compare_at_price instead)     |

### Category Tags

- `electronics`
- `home-garden`
- `fashion`
- `beauty`
- `kitchen`
- `sports-outdoors`

---

## Product Variants

### Setting Up Variants

1. In the product editor, scroll to **Variants**
2. Click **Add options like size or color**
3. Add option name (e.g., "Color", "Size")
4. Enter values separated by commas

### Common Options

- **Color**: Black, White, Navy Blue
- **Size**: XS, S, M, L, XL, XXL
- **Capacity**: 24oz, 32oz, 40oz

### Variant Pricing

Each variant can have its own:

- Price
- Compare at price
- SKU
- Inventory quantity

---

## Metafields Setup

The theme uses these metafields for enhanced functionality:

### Reviews Metafields

1. Go to **Settings > Custom data > Products**
2. Add metafield definitions:

| Namespace | Key      | Type    | Description             |
| --------- | -------- | ------- | ----------------------- |
| `reviews` | `rating` | Decimal | Star rating (1.0 - 5.0) |
| `reviews` | `count`  | Integer | Number of reviews       |

### Bulk Pricing Metafields (Optional)

| Namespace | Key             | Type    | Description          |
| --------- | --------------- | ------- | -------------------- |
| `bulk`    | `price`         | Money   | Bulk/wholesale price |
| `bulk`    | `minimum_order` | Integer | Minimum quantity     |

---

## Collections

### Creating Collections

1. Go to **Products > Collections**
2. Click **Create collection**
3. Choose collection type:
   - **Manual**: Hand-pick products
   - **Automated**: Use conditions (tags, vendor, price, etc.)

### Recommended Collections

- `electronics` - All electronics products
- `home-garden` - Home & garden items
- `fashion` - Clothing and accessories
- `beauty-health` - Beauty and wellness
- `kitchen-dining` - Kitchen items
- `sports-outdoors` - Sports equipment
- `new-arrivals` - Products tagged "new"
- `deals-promotions` - Sale items

---

## Inventory Management

1. Enable **Track quantity** for each variant
2. Set initial inventory count
3. Optionally enable **Continue selling when out of stock**

### Stock Status Display

- **In Stock**: Shows green indicator
- **Sold Out**: Shows disabled add-to-cart button

---

## SEO Settings

At the bottom of each product:

1. Click **Edit website SEO**
2. Set:
   - **Page title**: Optimized title (< 60 chars)
   - **Meta description**: Product summary (< 160 chars)
   - **URL handle**: URL-friendly slug

---

## Testing Your Products

After creating products:

1. View on storefront to verify display
2. Check product card in collection grid
3. Verify product detail page (PDP)
4. Test variant selection
5. Test add to cart functionality

---

## Troubleshooting

### Product not showing in collection

- Verify product is **Active** (not Draft)
- Check collection conditions match product
- Ensure product is available on Online Store channel

### Images not displaying

- Check image file size (< 20MB)
- Verify image format (JPG, PNG, WebP)
- Clear browser cache

### Variants not working

- Ensure all variants have prices set
- Check inventory is tracked and available
- Verify variant options are saved

---

## Mock Products (Development)

For local development without real products:

1. Homepage shows mock products via `mock-collection` section
2. Click any mock product to go to `/pages/mock-product#product-1`
3. URL hash (`#product-1` through `#product-8`) controls which product displays

To remove mock products for production:

1. Remove `mock-collection` from `templates/index.json` order array
2. Delete the mock-collection section definition
