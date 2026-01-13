# Orders Page Enhancement Plan

> **Status:** ✅ COMPLETE  
> **Created:** January 12, 2026  
> **Completed:** January 13, 2026  
> **Inspiration:** Amazon Orders Page UX

## Overview

Refactor existing Orders implementation to use component snippets, add Buy Again/Reorder functionality with bottom-right toast notifications, enhance accessibility, add skeleton loading states with sessionStorage filter persistence, and integrate header "Orders and Returns" link.

## Current State

The Orders page is **fully enhanced** with all planned features:

- ✅ Order history with search, tabs, filtering
- ✅ Order detail page with tracking progress
- ✅ Order confirmation page
- ✅ Responsive CSS
- ✅ Component snippets (badge.liquid, button.liquid, skeleton.liquid)
- ✅ Buy Again and Reorder All functionality
- ✅ Toast notification system
- ✅ Skeleton loading states
- ✅ sessionStorage filter persistence
- ✅ Header "Orders & Returns" link
- ✅ Accessibility enhancements (skip links, ARIA, focus management)
- ✅ Mobile responsiveness (touch targets, scroll indicators)

## Enhancement Goals

1. **Component Consistency** - Refactor to use existing snippets (`badge.liquid`, `button.liquid`, `skeleton.liquid`)
2. **Buy Again Functionality** - Direct add-to-cart without redirect
3. **Reorder All** - Single-click add entire order to cart
4. **Loading States** - Skeleton placeholders during filter/search
5. **Filter Persistence** - sessionStorage for tab/filter state
6. **Header Integration** - "Orders and Returns" link for logged-in users
7. **Accessibility** - WCAG AA compliance throughout
8. **Mobile Polish** - Touch-friendly, optimized images

---

## Steps

### Step 1: Refactor Status Badges to Use `badge.liquid`

**Files to modify:**

- `theme/sections/customer-orders.liquid` (lines 144-161, 327-335, 416-419)

**Status mapping:**
| Fulfillment Status | Badge Variant | Icon |
|-------------------|---------------|------|
| `fulfilled` | `success` | `check-circle` |
| `partial` | `info` | `truck` |
| (default) | `warning` | `clock` |
| `digital` | `secondary` | `download` |

**Example replacement:**

```liquid
{%- capture icon_html -%}{% render 'icon', name: 'check-circle', size: 16 %}{%- endcapture -%}
{% render 'badge', text: 'Delivered', variant: 'success', icon: icon_html %}
```

---

### Step 2: Refactor Buttons to Use `button.liquid`

**Files to modify:**

- `theme/sections/customer-orders.liquid` (lines 186-198, 249, 378, 434)
- `theme/sections/order-detail.liquid` (lines 21-25, 248-257, 280-311)

**Button types:**
| Button | Variant | Data Attribute |
|--------|---------|----------------|
| Buy it again | `primary` | `data-buy-again` |
| View your item | `outline` | - |
| Reorder These Items | `outline` | `data-reorder-all` |
| Download Invoice | `outline` | `data-download-invoice` |
| Start Shopping | `primary` | - |

**Example:**

```liquid
{%- capture icon_html -%}{% render 'icon', name: 'shopping-cart', size: 16 %}{%- endcapture -%}
{% render 'button',
  text: 'Buy it again',
  variant: 'primary',
  size: 'sm',
  icon: icon_html,
  class: 'customer-orders__item-btn',
  data_attributes: 'data-buy-again data-variant-id="' | append: item.variant.id | append: '"'
%}
```

---

### Step 3: Add Skeleton Loading Placeholder

**Files to modify:**

- `theme/snippets/skeleton.liquid` - Add `order-card` type
- `theme/sections/customer-orders.liquid` - Add skeleton container at line ~101
- `theme/assets/section-customer-orders.css` - Add skeleton styles

**New skeleton type in `skeleton.liquid`:**

```liquid
{% when 'order-card' %}
  <div class="skeleton skeleton--order-card">
    <div class="skeleton__header">
      <div class="skeleton__line skeleton__line--md" style="width: 30%;"></div>
      <div class="skeleton__line skeleton__line--sm" style="width: 20%;"></div>
    </div>
    <div class="skeleton__body">
      <div class="skeleton__image" style="width: 80px; height: 80px;"></div>
      <div class="skeleton__content">
        <div class="skeleton__line" style="width: 60%;"></div>
        <div class="skeleton__line skeleton__line--sm" style="width: 40%;"></div>
      </div>
    </div>
  </div>
{% endwhen %}
```

**Container in customer-orders.liquid:**

```liquid
<div class="customer-orders__skeleton" data-orders-skeleton hidden aria-hidden="true">
  {% for i in (1..3) %}
    {% render 'skeleton', type: 'order-card' %}
  {% endfor %}
</div>
```

---

### Step 4: Implement Buy Again and Reorder All Functionality

**File to modify:** `theme/assets/component-scripts.js`

**New functions to add (~line 315):**

```javascript
// ===========================================
// BUY AGAIN / REORDER FUNCTIONALITY
// ===========================================

function initBuyAgain() {
  document.querySelectorAll('[data-buy-again]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.dataset.variantId;
      const quantity = parseInt(btn.dataset.quantity) || 1;
      const productName = btn.dataset.productName || 'Item';

      btn.classList.add('btn--loading');
      btn.disabled = true;

      try {
        await addToCart(variantId, quantity);
        showToast(`${productName} added to cart!`, 'success');
      } catch (error) {
        showToast('Failed to add to cart', 'error');
      } finally {
        btn.classList.remove('btn--loading');
        btn.disabled = false;
      }
    });
  });
}

function initReorderAll() {
  document.querySelectorAll('[data-reorder-all]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const items = JSON.parse(btn.dataset.items || '[]');

      btn.classList.add('btn--loading');
      btn.disabled = true;

      try {
        for (const item of items) {
          await addToCart(item.variantId, item.quantity);
        }
        showToast(
          `Added ${items.length} item${items.length > 1 ? 's' : ''} to cart! <a href="/cart" class="toast__link">View Cart</a>`,
          'success',
          true
        );
      } catch (error) {
        showToast('Failed to add some items to cart', 'error');
      } finally {
        btn.classList.remove('btn--loading');
        btn.disabled = false;
      }
    });
  });
}

async function addToCart(variantId, quantity = 1) {
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity }] }),
  });

  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
}
```

**Fix selector mismatch at line ~197:**

```javascript
// Change from:
const tabNav = document.querySelector('[data-orders-tab]')?.closest('.orders-tab__nav');
// Change to:
const tabNav = document.querySelector('[data-orders-tab]')?.closest('.customer-orders__nav');
```

**Update init() function:**

```javascript
function init() {
  initAccordions();
  initAlerts();
  initModals();
  initTabs();
  initOrdersTab();
  initHeaderInner();
  initBuyAgain();
  initReorderAll();
}
```

---

### Step 5: Create Fixed Bottom-Right Toast Notification System

**File to modify:** `theme/assets/component-scripts.js`

**Toast function:**

```javascript
function showToast(message, type = 'info', allowHtml = false) {
  // Create toast container if doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  if (allowHtml) {
    toast.innerHTML = message;
  } else {
    toast.textContent = message;
  }

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast__close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => removeToast(toast));
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // Auto-remove after 5 seconds
  setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
  toast.classList.remove('toast--visible');
  toast.addEventListener('transitionend', () => toast.remove());
}
```

**File to modify:** `theme/assets/component-alert.css`

**Toast styles to add:**

```css
/* ===========================================
   TOAST NOTIFICATIONS
   =========================================== */

.toast-container {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast, 1100);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 24rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  opacity: 0;
  transform: translateX(100%);
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.toast--visible {
  opacity: 1;
  transform: translateX(0);
}

.toast--success {
  border-left: 4px solid var(--color-primary);
}

.toast--error {
  border-left: 4px solid var(--color-error, #ef4444);
}

.toast--info {
  border-left: 4px solid var(--color-secondary);
}

.toast__link {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
}

.toast__link:hover {
  color: var(--color-primary-dark, #22a854);
}

.toast__close {
  margin-left: auto;
  padding: var(--space-1);
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
}

.toast__close:hover {
  color: var(--color-text);
}

/* Mobile positioning with safe-area */
@media (max-width: 767px) {
  .toast-container {
    left: var(--space-4);
    right: var(--space-4);
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    max-width: none;
  }

  .toast {
    transform: translateY(100%);
  }

  .toast--visible {
    transform: translateY(0);
  }
}
```

---

### Step 6: Add sessionStorage Filter Persistence

**File to modify:** `theme/assets/component-scripts.js` (within `initOrdersTab`)

**Save state on change:**

```javascript
function saveOrdersFilter(tab, period) {
  try {
    sessionStorage.setItem('ordersFilter', JSON.stringify({ tab, period }));
  } catch (e) {
    // sessionStorage not available
  }
}

function loadOrdersFilter() {
  try {
    const saved = sessionStorage.getItem('ordersFilter');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}
```

**Restore on page load (add to initOrdersTab):**

```javascript
// At start of initOrdersTab, before event listeners:
const savedFilter = loadOrdersFilter();
if (savedFilter) {
  // Restore tab
  if (savedFilter.tab) {
    const savedTab = tabNav.querySelector(`[data-orders-tab="${savedFilter.tab}"]`);
    if (savedTab) savedTab.click();
  }
  // Restore period
  if (savedFilter.period && timeFilter) {
    timeFilter.value = savedFilter.period;
    timeFilter.dispatchEvent(new Event('change'));
  }
}
```

---

### Step 7: Add Header "Orders and Returns" Link

**File to modify:** `theme/sections/header.liquid`

**Desktop link (insert at line ~171):**

```liquid
{%- if customer and section.settings.show_orders_link -%}
  <a href="{{ routes.account_url }}" class="header__action-link">
    {{ 'header.actions.orders_returns' | t | default: 'Orders & Returns' }}
  </a>
{%- endif -%}
```

**Mobile menu link (insert at line ~277):**

```liquid
{%- if customer and section.settings.show_orders_link -%}
  <a href="{{ routes.account_url }}" class="header__mobile-link">
    {% render 'icon', name: 'package', size: 20 %}
    {{ 'header.actions.orders_returns' | t | default: 'Orders & Returns' }}
  </a>
{%- endif -%}
```

**Schema setting (add at line ~559):**

```json
{
  "type": "checkbox",
  "id": "show_orders_link",
  "label": "Show Orders & Returns link",
  "info": "Displays for logged-in customers only",
  "default": true
}
```

**Locale string to add (`en.default.json`):**

```json
"header": {
  "actions": {
    "orders_returns": "Orders & Returns"
  }
}
```

---

### Step 8: Enhance Accessibility Compliance

**Changes across files:**

| File                     | Location          | Change                                        |
| ------------------------ | ----------------- | --------------------------------------------- |
| `customer-orders.liquid` | Tab panels        | Add `aria-busy="true"` during loading         |
| `customer-orders.liquid` | Buy Again buttons | Add `aria-label="Add [product name] to cart"` |
| `customer-orders.liquid` | Search form       | Remove inline `onsubmit`, handle in JS        |
| `order-detail.liquid`    | Inline SVGs       | Add `aria-hidden="true"`                      |
| `order-detail.liquid`    | Progress stages   | Add `aria-label` to each stage                |
| `order-detail.liquid`    | Status card       | Add `role="status"`                           |
| `order-detail.liquid`    | Top of page       | Add skip-link to order items section          |
| `component-scripts.js`   | Toast container   | Add `role="status" aria-live="polite"`        |

**Skip link example:**

```liquid
<a href="#order-items" class="visually-hidden visually-hidden--focusable">
  Skip to order items
</a>
```

---

### Step 9: Improve Mobile Responsiveness

**File to modify:** `theme/assets/section-customer-orders.css`

**Tab scroll indicators:**

```css
.customer-orders__nav {
  position: relative;
}

.customer-orders__tabs {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.customer-orders__tabs::-webkit-scrollbar {
  display: none;
}

/* Scroll shadow indicators */
.customer-orders__nav::before,
.customer-orders__nav::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 1;
}

.customer-orders__nav::before {
  left: 0;
  background: linear-gradient(to right, var(--color-background), transparent);
}

.customer-orders__nav::after {
  right: 0;
  background: linear-gradient(to left, var(--color-background), transparent);
}

.customer-orders__nav--scroll-left::before,
.customer-orders__nav--scroll-right::after {
  opacity: 1;
}
```

**Touch targets:**

```css
@media (max-width: 767px) {
  .customer-orders__tab {
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }

  .customer-orders__item-btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

**Responsive images (in Liquid):**

```liquid
<img
  src="{{ item.image | image_url: width: 100 }}"
  srcset="
    {{ item.image | image_url: width: 100 }} 100w,
    {{ item.image | image_url: width: 200 }} 200w
  "
  sizes="(max-width: 767px) 60px, 80px"
  alt="{{ item.title | escape }}"
  width="80"
  height="80"
  loading="lazy"
>
```

---

### Step 10: Cleanup and Documentation

**Remove inline JavaScript:**

- Delete `<script>` block from `customer-orders.liquid` lines 464-573
- All functionality handled by `component-scripts.js`

**Update COMPONENT_INVENTORY.md:**

- Add `order-card` skeleton type
- Document toast notification system
- Update Orders section status

**Update IMPLEMENTATION_PLAN.md:**

- Mark Task 4.2 "Order Tracking Enhancement" as complete
- Add notes about Buy Again/Reorder All features

---

## Testing Checklist

### Functional Tests

- [ ] Buy Again adds single product to cart
- [ ] Reorder All adds all order items to cart
- [ ] Toast appears with "View Cart" link
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Toast can be manually dismissed
- [ ] Skeleton shows during loading
- [ ] Filter/tab state persists via sessionStorage
- [ ] Header link shows for logged-in users only
- [ ] Header link hidden when setting disabled

### Accessibility Tests

- [ ] Tab navigation works with keyboard
- [ ] Screen reader announces toast notifications
- [ ] Skip link works to jump to order items
- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets are minimum 44×44px

### Responsive Tests

- [ ] Mobile: Cards stack correctly
- [ ] Mobile: Tabs scroll horizontally
- [ ] Mobile: Toast spans full width
- [ ] Tablet: Grid adjusts appropriately
- [ ] Desktop: Layout matches design

### Browser Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

---

## Files Modified Summary

| File                                       | Type    | Changes                                              |
| ------------------------------------------ | ------- | ---------------------------------------------------- |
| `theme/sections/customer-orders.liquid`    | Section | Refactor to snippets, add skeleton, remove inline JS |
| `theme/sections/order-detail.liquid`       | Section | Refactor to snippets, add accessibility              |
| `theme/sections/header.liquid`             | Section | Add Orders & Returns link                            |
| `theme/snippets/skeleton.liquid`           | Snippet | Add order-card type                                  |
| `theme/assets/component-scripts.js`        | JS      | Add Buy Again, Reorder, Toast, sessionStorage        |
| `theme/assets/component-alert.css`         | CSS     | Add toast styles                                     |
| `theme/assets/section-customer-orders.css` | CSS     | Add skeleton, scroll indicators, touch targets       |
| `theme/locales/en.default.json`            | Locale  | Add orders_returns string                            |
| `docs/COMPONENT_INVENTORY.md`              | Docs    | Update with new features                             |
| `docs/IMPLEMENTATION_PLAN.md`              | Docs    | Mark tasks complete                                  |

---

## Estimated Effort

| Step                   | Complexity | Time Estimate |
| ---------------------- | ---------- | ------------- |
| 1. Refactor badges     | Low        | 30 min        |
| 2. Refactor buttons    | Medium     | 45 min        |
| 3. Add skeleton        | Medium     | 45 min        |
| 4. Buy Again / Reorder | High       | 1.5 hr        |
| 5. Toast system        | Medium     | 45 min        |
| 6. sessionStorage      | Low        | 20 min        |
| 7. Header link         | Low        | 20 min        |
| 8. Accessibility       | Medium     | 1 hr          |
| 9. Mobile polish       | Medium     | 45 min        |
| 10. Cleanup / docs     | Low        | 30 min        |

**Total Estimated Time:** ~7-8 hours
