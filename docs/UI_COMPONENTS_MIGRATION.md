# UI Components Migration Documentation

## Overview
This document tracks the migration of React UI components to Shopify Liquid snippets. Each component maintains visual fidelity while adapting to Shopify's Liquid template engine.

## Completed Components

### 1. Button Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/button.liquid`
- `theme/assets/component-button.css`

**Variants:**
- Primary, Secondary, Destructive, Outline, Ghost, Link

**Sizes:**
- Default, Small, Large, Icon

**Features:**
- Loading state with spinner
- Icon support (left/right positioning)
- Full-width option
- Disabled state
- Renders as `<a>` or `<button>` based on URL presence

**Usage:**
```liquid
{% render 'button', text: 'Click Me', variant: 'primary' %}
{% render 'button', text: 'Submit', type: 'submit', loading: true %}
```

---

### 2. Input Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/input.liquid`
- `theme/assets/component-input.css`

**Types:**
- Text, Email, Password, Number, Tel, URL, Search, Date, File

**Sizes:**
- Default, Small, Large

**Features:**
- Label with required indicator
- Error messages with ARIA support
- Helper text (hints)
- Icon support (left/right positioning)
- Validation states (error/success)
- Textarea support with resizing
- File input styling
- Full accessibility with aria-invalid, aria-describedby

**Usage:**
```liquid
{% render 'input',
  name: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  placeholder: 'you@example.com'
%}
```

---

### 3. Card Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/card.liquid`
- `theme/assets/component-card.css`

**Variants:**
- Default, Elevated, Hover, Clickable

**Sizes:**
- Default, Small, Large

**Structure:**
- Header (title, description, action)
- Content (flexible HTML)
- Footer (buttons/actions)
- Optional image

**Features:**
- Clickable cards (entire card is link)
- Border options for header/footer
- Grid layout for header with actions
- Responsive padding
- Container queries for header

**Usage:**
```liquid
{% render 'card',
  title: 'Product Title',
  description: 'Product description',
  content: '<p>Card content</p>',
  image_url: product.featured_image,
  url: product.url
%}
```

---

### 4. Form Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/form-item.liquid`
- `theme/assets/component-form.css`

**Field Types:**
- Text, Textarea, Select, Checkbox, Radio

**Features:**
- Form item wrapper with label, field, error, description
- Grid layout support (1, 2, 3 columns)
- Inline form layout
- Form sections with titles
- Error summary component
- Required field indicators
- Form actions (button groups)
- Size variants (default, sm, lg)

**Usage:**
```liquid
<form action="/contact" method="post" class="form">
  {% render 'form-item',
    label: 'Email',
    name: 'email',
    type: 'email',
    required: true,
    description: 'We'll never share your email'
  %}
  
  <div class="form__actions form__actions--end">
    {% render 'button', text: 'Submit', type: 'submit' %}
  </div>
</form>
```

---

### 5. Badge Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/badge.liquid`
- `theme/assets/component-badge.css`

**Variants:**
- Default, Secondary, Destructive, Outline, Success, Warning, Info

**Sizes:**
- Default, Small, Large

**Features:**
- Dot indicator option
- Pill shape option
- Closable with X button
- Icon support
- Clickable badges (with URL)
- Icon-only badges
- Badge groups

**Usage:**
```liquid
{% render 'badge', text: 'New', variant: 'success' %}
{% render 'badge', text: 'Sale', variant: 'destructive', pill: true %}
```

---

## Migration Pattern

Each component follows this conversion process:

1. **Audit React Component**
   - Read source file (`src/components/ui/*.tsx`)
   - Identify variants, sizes, states
   - Document props and behaviors

2. **Extract Styles**
   - Convert Tailwind classes to vanilla CSS
   - Use BEM naming convention
   - Create component CSS file in `theme/assets/`

3. **Create Liquid Snippet**
   - Map React props to Liquid parameters
   - Implement conditional rendering
   - Add comprehensive comments with usage examples

4. **Maintain Features**
   - Preserve all variants and states
   - Ensure accessibility (ARIA attributes)
   - Match visual appearance exactly

5. **Document**
   - Add to this migration document
   - Include usage examples
   - Note any deviations from React version

---

## Component Priority Order

**High Priority (Completed):**
- ✅ Button
- ✅ Input
- ✅ Card
- ✅ Form
- ✅ Badge

**Medium Priority (Completed):**
- ✅ Select
- ✅ Label
- ✅ Textarea
- ✅ Checkbox
- ✅ Radio Group

**Low Priority:**
- Dialog/Modal
- Dropdown Menu
- Popover
- Tooltip
- Tabs
- Accordion
- Carousel

### 6. Select Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/select.liquid`
- `theme/assets/component-select.css`

**Features:**
- Native HTML select with custom styling
- Single and multiple select support
- Option groups (optgroups)
- Placeholder option
- Size variants (default, sm)
- Error/hint messages
- Full accessibility with ARIA
- Custom dropdown arrow

**Usage:**
```liquid
{% assign countries = 'US:United States,CA:Canada,UK:United Kingdom' | split: ',' %}
{% render 'select',
  name: 'country',
  label: 'Country',
  options: countries,
  required: true
%}
```

---

### 7. Label Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/label.liquid`
- `theme/assets/component-label.css`

**Features:**
- Standalone label component
- Required/optional indicators
- Icon support
- Help text
- Size variants (default, sm, lg)
- Error state styling
- Peer-based disabled states

**Usage:**
```liquid
{% render 'label', text: 'Email', for: 'email-input', required: true %}
```

---

### 8. Textarea Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/textarea.liquid`
- `theme/assets/component-textarea.css`

**Features:**
- Multi-line text input
- Auto-resize option
- Character counter with warnings
- Resize options (vertical, none, horizontal)
- Size variants (default, sm, lg)
- Error/hint messages
- Full accessibility
- Configurable rows

**Usage:**
```liquid
{% render 'textarea',
  name: 'message',
  label: 'Message',
  rows: 6,
  maxlength: 500,
  show_count: true,
  required: true
%}
```

---

### 9. Checkbox Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/checkbox.liquid`
- `theme/assets/component-checkbox.css`

**Features:**
- Single checkbox with label
- Description text support
- Size variants (default, sm, lg)
- Card style option
- Indeterminate state styling
- Error messages
- Full accessibility

**Usage:**
```liquid
{% render 'checkbox',
  name: 'newsletter',
  label: 'Subscribe to newsletter',
  description: 'Get updates about new products',
  value: '1'
%}
```

---

### 10. Radio Group Component
**Status:** ✅ Complete  
**Files:**
- `theme/snippets/radio-group.liquid`
- `theme/assets/component-radio-group.css`

**Layouts:**
- Vertical (default)
- Horizontal
- Card style
- Button style

**Features:**
- Multiple radio options
- Size variants (default, sm, lg)
- Description text per option
- Required indicator
- Error/hint messages
- Full accessibility
- Flexible option formats

**Usage:**
```liquid
{% assign sizes = 'S:Small,M:Medium,L:Large,XL:Extra Large' | split: ',' %}
{% render 'radio-group',
  name: 'size',
  label: 'Select Size',
  options: sizes,
  layout: 'horizontal',
  required: true
%}
```

---

## Testing Checklist

For each component:
- [ ] Visual comparison with React version (screenshot)
- [ ] Test all variants
- [ ] Test all sizes
- [ ] Test disabled/loading states
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Test in Shopify theme customizer
- [ ] Validate HTML/CSS in different browsers
- [ ] Check responsive behavior

---

## Notes

- All components use BEM CSS methodology for consistency
- Vanilla CSS with CSS custom properties (CSS variables) from theme
- No JavaScript dependencies (except where necessary for interactivity)
- ARIA attributes preserved for accessibility
- Components are theme customizer compatible where applicable
