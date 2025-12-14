# Screenshots Directory

This directory stores before/after screenshots for UI changes to ensure visual accuracy during the Shopify theme migration.

## Structure

```
screenshots/
├── ComponentName/
│   ├── before-feature-name-YYYY-MM-DD.png
│   └── after-feature-name-YYYY-MM-DD.png
└── PageName/
    ├── before-feature-name-YYYY-MM-DD.png
    └── after-feature-name-YYYY-MM-DD.png
```

## Naming Convention

- **Directory:** Use the component or page name (e.g., `Header`, `ProductCard`, `HomePage`)
- **Files:** `before-[feature-name]-[YYYY-MM-DD].png` and `after-[feature-name]-[YYYY-MM-DD].png`

## Example

```
screenshots/
├── Header/
│   ├── before-responsive-nav-2025-12-14.png
│   └── after-responsive-nav-2025-12-14.png
└── ProductCard/
    ├── before-hover-state-2025-12-14.png
    └── after-hover-state-2025-12-14.png
```

## When to Add Screenshots

Screenshots are **required** for:
- Any component visual changes
- Layout modifications
- Color, spacing, or typography updates
- Responsive behavior changes
- Hover/active/focus state changes

## What to Capture

Include multiple screenshots showing:
- Desktop view (1920x1080)
- Tablet view (768x1024)
- Mobile view (375x667)
- Different states (default, hover, active, disabled)
- Light/dark themes (if applicable)

## Tools

Recommended tools for capturing screenshots:
- Browser DevTools (F12 > Device Toolbar)
- Full page screenshot extensions
- Design tools (Figma, Sketch) for mockup comparisons

---

_Part of the Shopify Theme Migration Plan - Rule 3.3 (Visual Validation)_
