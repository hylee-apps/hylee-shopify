# Copilot Instructions for hylee-shopify

> **This file is the Single Source of Truth for AI agents working on this codebase.**

## Project Overview

- **Project Name**: hylee-shopify
- **Project Type**: Shopify Liquid Theme
- **Enforcement Level**: strict
- **Available Scopes**: `account`, `orders`, `tracking`, `returns`, `product`, `collection`, `cart`, `nav`, `ui`, `homepage`

### Valid Scopes for Commits and Branches

| Scope        | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `account`    | Customer account, login, registration, and profile settings |
| `orders`     | Order history, order details, and confirmation pages        |
| `tracking`   | Order tracking and delivery status functionality            |
| `returns`    | Returns portal and guest returns functionality              |
| `product`    | Product detail pages, specifications, and comparisons       |
| `collection` | Collection pages, product grids, and filtering              |
| `cart`       | Shopping cart functionality and checkout flow               |
| `nav`        | Header navigation, mega menu, footer, and search            |
| `ui`         | Reusable UI components, forms, and design system            |
| `homepage`   | Homepage sections, hero, and marketing content              |

## Guidelines

### Branching Strategy

📄 [See full details](../guidelines/BRANCHING_STRATEGY.md)

**Key Rules:**

1. **Type**: Must be one of `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `docs`, `test`
2. **Scope**: Must be from the allowed scopes list above
3. **Description**: Lowercase, hyphen-separated, 2-5 words

## Quick Reference

### Branch Naming Convention

**Types**: `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `docs`, `test`

### Commit Message Format

`<type>(<scope>): <description>`

### Before Committing

1. Ensure branch name follows convention
2. Ensure commit message follows conventional commits format

## Project-Specific Instructions

### Shopify Theme Development

- Use Liquid templating syntax
- Follow Shopify theme best practices
- Test on multiple viewport sizes
- Use CSS custom properties for theming
- Prefer snippets for reusable components
