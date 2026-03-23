# Auth Pages — Figma Design Implementation Plan

## Figma Source
- **File key**: `Q541sIDD20eXqQSSozFUw4` (Account Pages)
- **Login node**: `1:63` — Sign In page
- **Register node**: `2:293` — Create Account page

## Current State
Auth pages already exist with custom Storefront API auth (`customer-auth.ts`):
- `account.login.tsx` — Sign in form (email/password)
- `account.register.tsx` — Registration form (name/email/password/confirm/terms)
- `account.recover.tsx` — Password recovery
- `account.logout.tsx` — Session invalidation
- `AuthLayout.tsx` — Shared split-panel layout
- `FormField.tsx` — Reusable form input component

## Gaps (Figma vs Current Implementation)

### 1. Social Login Buttons (visual-only for now)
Both login and register pages show Google and Apple sign-in/sign-up buttons above the email form divider. These need to be added as **non-functional UI elements** — OAuth integration will come later.

**Login page**: "Sign in with Google" + "Sign in with Apple"
**Register page**: "Sign up with Google" + "Sign up with Apple"

### 2. Minor Text Fixes
- Login divider: "Sign in with email" → "or sign in with email"

## Implementation Steps

### Step 1: Create `SocialLoginButtons` component
- New file: `hydrogen/app/components/auth/SocialLoginButtons.tsx`
- Props: `mode: 'signin' | 'signup'`
- Two bordered buttons with Google (blue icon) and Apple (black icon) branding
- Buttons are disabled/non-functional — show `cursor-not-allowed opacity-50` or just render as divs
- Actually, per Figma they look fully styled — render them as buttons that do nothing for now

### Step 2: Update `account.login.tsx`
- Import and add `SocialLoginButtons` above the divider
- Fix divider text to "or sign in with email"

### Step 3: Update `account.register.tsx`
- Import and add `SocialLoginButtons` above the divider
- Fix divider text to "or sign up with email"

### Step 4: Save design references
- Save Figma specs to `hydrogen/design-references/auth-login/` and `auth-register/`

### Step 5: Run pre-commit checks
- `pnpm typecheck && pnpm build && pnpm test`

## Files to Create/Modify
- **Create**: `hydrogen/app/components/auth/SocialLoginButtons.tsx`
- **Modify**: `hydrogen/app/routes/account.login.tsx`
- **Modify**: `hydrogen/app/routes/account.register.tsx`
- **Create**: `hydrogen/design-references/auth-login/figma-spec.md`
- **Create**: `hydrogen/design-references/auth-register/figma-spec.md`
