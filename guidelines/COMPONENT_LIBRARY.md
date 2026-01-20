# Component Library

> **Purpose**: This document catalogs all UI components in the Hy-lee Shopify Theme and provides usage guidelines.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Component Categories](#component-categories)
3. [Form Components](#form-components)
4. [Feedback Components](#feedback-components)
5. [Layout Components](#layout-components)
6. [Navigation Components](#navigation-components)
7. [Commerce Components](#commerce-components)
8. [Creating New Components](#creating-new-components)

---

## Philosophy

### The Component Library Rule

> **All UI elements MUST be rendered from `theme/snippets/`.** Sections and templates should ONLY compose components—never define inline UI.

### Benefits

1. **Consistency**: Same component looks the same everywhere
2. **Maintainability**: Update once, fix everywhere
3. **Testability**: Components can be tested in isolation
4. **Documentation**: Parameters are self-documenting

---

## Component Categories

### Quick Reference

| Category       | Components                                            |
| -------------- | ----------------------------------------------------- |
| **Form**       | input, select, checkbox, radio-group, textarea, label |
| **Feedback**   | alert, badge, skeleton, helper-text                   |
| **Layout**     | card, accordion, modal, tabs                          |
| **Navigation** | button, link, breadcrumb, pagination                  |
| **Commerce**   | product-card, product-card-b2b                        |
| **Display**    | icon, pill                                            |
| **Account**    | account-nav-card, address-card, selection-card        |

---

## Form Components

### Input

Text input field with label and validation support.

```liquid
{% render 'input',
  type: 'email',
  name: 'email',
  label: 'Email Address',
  placeholder: 'you@example.com',
  required: true,
  error: form.errors.email,
  value: form.email
%}
```

**Parameters:**

- `type`: 'text' | 'email' | 'password' | 'tel' | 'number' (default: 'text')
- `name`: string (required)
- `label`: string
- `placeholder`: string
- `required`: boolean
- `disabled`: boolean
- `error`: string (error message)
- `value`: string (pre-filled value)
- `class`: string (additional classes)

---

### Select

Dropdown select field.

```liquid
{% render 'select',
  name: 'country',
  label: 'Country',
  options: country_options,
  selected: customer.default_address.country,
  required: true
%}
```

**Parameters:**

- `name`: string (required)
- `label`: string
- `options`: array of { value, label } objects
- `selected`: string (selected value)
- `placeholder`: string (empty option text)
- `required`: boolean
- `disabled`: boolean
- `error`: string

---

### Checkbox

Single checkbox input.

```liquid
{% render 'checkbox',
  name: 'newsletter',
  label: 'Subscribe to newsletter',
  checked: customer.accepts_marketing,
  required: false
%}
```

**Parameters:**

- `name`: string (required)
- `label`: string (required)
- `checked`: boolean
- `required`: boolean
- `disabled`: boolean
- `value`: string (default: 'true')

---

### Radio Group

Group of radio button options.

```liquid
{% render 'radio-group',
  name: 'shipping_method',
  label: 'Shipping Method',
  options: shipping_options,
  selected: 'standard'
%}
```

**Parameters:**

- `name`: string (required)
- `label`: string
- `options`: array of { value, label, description } objects
- `selected`: string (selected value)
- `required`: boolean

---

### Textarea

Multi-line text input.

```liquid
{% render 'textarea',
  name: 'message',
  label: 'Message',
  placeholder: 'Enter your message...',
  rows: 4,
  required: true
%}
```

**Parameters:**

- `name`: string (required)
- `label`: string
- `placeholder`: string
- `rows`: number (default: 3)
- `required`: boolean
- `disabled`: boolean
- `value`: string
- `error`: string

---

### Form Item

Wrapper for form fields with consistent spacing.

```liquid
{% render 'form-item',
  label: 'Email',
  required: true,
  error: form.errors.email,
  helper_text: 'We will never share your email'
%}
  <input type="email" name="email" />
{% endrender %}
```

---

## Feedback Components

### Alert

Notification messages for success, error, warning, info.

```liquid
{% render 'alert',
  type: 'success',
  message: 'Your order has been placed!',
  dismissible: true
%}

{% render 'alert',
  type: 'error',
  title: 'Error',
  message: 'Please fix the errors below.',
  dismissible: false
%}
```

**Parameters:**

- `type`: 'success' | 'error' | 'warning' | 'info' (required)
- `message`: string (required)
- `title`: string (optional heading)
- `dismissible`: boolean (default: false)
- `icon`: boolean (default: true)

---

### Badge

Status labels and tags.

```liquid
{% render 'badge',
  text: 'Sale',
  variant: 'success'
%}

{% render 'badge',
  text: 'Out of Stock',
  variant: 'error',
  size: 'sm'
%}
```

**Parameters:**

- `text`: string (required)
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' (default: 'md')

---

### Skeleton

Loading placeholder.

```liquid
{% render 'skeleton',
  type: 'text',
  lines: 3
%}

{% render 'skeleton',
  type: 'image',
  aspect_ratio: '1/1'
%}
```

**Parameters:**

- `type`: 'text' | 'image' | 'card' | 'button'
- `lines`: number (for text type)
- `aspect_ratio`: string (for image type)
- `width`: string
- `height`: string

---

### Helper Text

Form field helper or error text.

```liquid
{% render 'helper-text',
  text: 'Password must be at least 8 characters',
  type: 'default'
%}

{% render 'helper-text',
  text: 'This field is required',
  type: 'error'
%}
```

**Parameters:**

- `text`: string (required)
- `type`: 'default' | 'error' | 'success'

---

## Layout Components

### Card

Content container with optional header and footer.

```liquid
{% render 'card',
  title: 'Order Summary',
  padding: 'lg'
%}
  <p>Card content goes here</p>
{% endrender %}
```

**Parameters:**

- `title`: string
- `subtitle`: string
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `border`: boolean (default: true)
- `shadow`: boolean (default: false)
- `class`: string

---

### Accordion

Expandable/collapsible content sections.

```liquid
{% render 'accordion',
  items: accordion_items,
  allow_multiple: false
%}
```

**Parameters:**

- `items`: array of { title, content } objects
- `allow_multiple`: boolean (allow multiple open)
- `default_open`: number (index of default open item)

---

### Modal

Dialog/modal overlay.

```liquid
{% render 'modal',
  id: 'confirm-modal',
  title: 'Confirm Action',
  size: 'sm'
%}
  <p>Are you sure you want to proceed?</p>
  {% render 'button', text: 'Cancel', variant: 'secondary', data_modal_close: true %}
  {% render 'button', text: 'Confirm', variant: 'primary' %}
{% endrender %}
```

**Parameters:**

- `id`: string (required, unique)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'full' (default: 'md')
- `closable`: boolean (default: true)

---

### Tabs

Tabbed content navigation.

```liquid
{% render 'tabs',
  items: tab_items,
  default_tab: 'description'
%}
```

**Parameters:**

- `items`: array of { id, label, content } objects
- `default_tab`: string (id of default active tab)

---

## Navigation Components

### Button

Primary action element.

```liquid
{% render 'button',
  text: 'Add to Cart',
  variant: 'primary',
  size: 'lg',
  type: 'submit'
%}

{% render 'button',
  text: 'Learn More',
  variant: 'link',
  href: '/about',
  icon: 'arrow-right',
  icon_position: 'right'
%}
```

**Parameters:**

- `text`: string (required)
- `variant`: 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `type`: 'button' | 'submit' | 'reset'
- `href`: string (renders as `<a>` if provided)
- `icon`: string (icon name)
- `icon_position`: 'left' | 'right'
- `disabled`: boolean
- `loading`: boolean
- `full_width`: boolean
- `class`: string

---

### Link

Styled anchor link.

```liquid
{% render 'link',
  text: 'View all products',
  href: '/collections/all',
  variant: 'primary'
%}
```

**Parameters:**

- `text`: string (required)
- `href`: string (required)
- `variant`: 'default' | 'primary' | 'muted'
- `underline`: boolean
- `external`: boolean (opens in new tab)
- `icon`: string

---

### Breadcrumb

Navigation breadcrumb trail.

```liquid
{% render 'breadcrumb',
  items: breadcrumb_items
%}
```

**Parameters:**

- `items`: array of { label, url } objects (last item is current page)

---

### Pagination

Page navigation for collections.

```liquid
{% render 'pagination',
  paginate: paginate
%}
```

**Parameters:**

- `paginate`: Shopify paginate object (required)
- `show_page_numbers`: boolean (default: true)
- `prev_text`: string (default: 'Previous')
- `next_text`: string (default: 'Next')

---

## Commerce Components

### Product Card

Product listing card for collections.

```liquid
{% render 'product-card',
  product: product,
  show_vendor: true,
  show_rating: true,
  image_ratio: '1/1'
%}
```

**Parameters:**

- `product`: product object (required)
- `show_vendor`: boolean
- `show_rating`: boolean
- `show_quick_add`: boolean
- `image_ratio`: string (aspect ratio)
- `lazy_load`: boolean (default: true)

---

### Product Card B2B

Product card for wholesale/B2B customers.

```liquid
{% render 'product-card-b2b',
  product: product,
  show_sku: true,
  show_stock: true
%}
```

**Parameters:**

- `product`: product object (required)
- `show_sku`: boolean
- `show_stock`: boolean
- `show_bulk_pricing`: boolean

---

## Creating New Components

### 1. Create the Snippet

Create `theme/snippets/{component-name}.liquid`:

```liquid
{% comment %}
  Component Name

  Description of what this component does.

  Usage:
  {% render 'component-name',
    param1: 'value',
    param2: true
  %}

  Parameters:
  - param1: type (required/optional) - Description
  - param2: type (default: value) - Description
{% endcomment %}

{%- liquid
  assign param1_value = param1 | default: ''
  assign param2_value = param2 | default: false
-%}

<div class="component-name">
  {{ param1_value }}
</div>
```

### 2. Create the CSS

Create `theme/assets/component-{name}.css`:

```css
/* ==========================================================================
   Component Name
   ========================================================================== */

.component-name {
  /* Use design tokens */
  padding: var(--spacing-md);
  background: var(--color-background);
}

/* Variants */
.component-name--variant {
  /* Variant styles */
}

/* States */
.component-name:hover {
  /* Hover styles */
}
```

### 3. Add JavaScript (if needed)

Add to `theme/assets/component-scripts.js`:

```javascript
/**
 * Component Name
 * Description of behavior
 */
class ComponentName {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    // Initialize component
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-component-name]').forEach((el) => {
    new ComponentName(el);
  });
});
```

### 4. Document the Component

Add to `docs/COMPONENT_INVENTORY.md` and this file.

---

## Related Documents

- [SINGLE_SOURCE_OF_TRUTH.md](SINGLE_SOURCE_OF_TRUTH.md) - File locations
- [AGENT_EDITING_INSTRUCTIONS.md](AGENT_EDITING_INSTRUCTIONS.md) - Coding standards
- [docs/COMPONENT_INVENTORY.md](../docs/COMPONENT_INVENTORY.md) - Full inventory
