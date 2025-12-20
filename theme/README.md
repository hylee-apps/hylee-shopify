# Shopify Theme Structure

This directory contains the Shopify theme files following Shopify's standard structure.

## Directory Structure

```
theme/
├── layout/           - Theme layouts (theme.liquid, etc.)
├── templates/        - Page templates (product, collection, page, etc.)
│   └── customers/    - Customer account templates
├── sections/         - Reusable sections for theme editor
├── snippets/         - Reusable Liquid snippets
├── assets/           - CSS, JavaScript, images, fonts
├── config/           - Theme settings and configuration
└── locales/          - Translation files
```

## File Types

### Layout Files (`/layout`)
- `theme.liquid` - Main theme layout wrapper
- Contains `<head>`, global scripts, and `{{ content_for_layout }}`

### Template Files (`/templates`)
- JSON templates that reference sections
- Example: `product.json`, `collection.json`, `page.json`
- Located in `/templates/` and `/templates/customers/`

### Section Files (`/sections`)
- Reusable content blocks
- Can be added/removed in theme editor
- Contain schema for customization

### Snippet Files (`/snippets`)
- Small reusable Liquid partials
- Called with `{% render 'snippet-name' %}`
- No schema, pure Liquid logic

### Asset Files (`/assets`)
- CSS stylesheets
- JavaScript files
- Images, fonts, and other static assets
- Compiled from source via build process

### Config Files (`/config`)
- `settings_schema.json` - Theme customizer settings
- `settings_data.json` - Current theme setting values

### Locale Files (`/locales`)
- Translation JSON files (e.g., `en.default.json`)
- Multi-language support

## Development Workflow

1. Edit files in this directory
2. Use Shopify CLI to sync with dev store: `shopify theme dev`
3. Test changes in browser
4. Deploy to production: `shopify theme push`

## Guest Returns (Stub)

This theme includes a guest returns initiation page stub ("Returns are coming soon") that matches the Track Order layout.

- Setup and verification steps: see [../docs/RETURNS_GUEST_STUB.md](../docs/RETURNS_GUEST_STUB.md)

## References

- [Shopify Theme Architecture](https://shopify.dev/docs/themes/architecture)
- [Liquid Reference](https://shopify.github.io/liquid/)
- [Theme Check Documentation](https://shopify.dev/docs/themes/tools/theme-check)
