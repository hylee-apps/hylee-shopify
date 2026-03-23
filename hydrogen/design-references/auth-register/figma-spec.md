# Auth Register — Figma Spec

- **File**: Account Pages (`Q541sIDD20eXqQSSozFUw4`)
- **Node**: `2:293`
- **Captured**: 2026-03-23

## Layout

Split-screen: left branding panel + right form panel. Full viewport height.

### Left Panel (`div.auth-left`)
- **Gradient**: `linear-gradient(135deg, rgb(64,40,60) 0%, rgb(38,153,166) 100%)`
- **Padding**: 32px all sides
- **Content max-width**: 400px, centered

**Logo**: "Hylee" text, 48px bold, white, tracking -1px
**Tagline**: "Join Hylee Today", 24px light, white, opacity 95%
**Description**: "Create an account for a personalized shopping experience.", 16px, white
**Features**:
- Save shipping addresses
- Secure payment storage
- Order history tracking
- Wishlist and favorites

### Right Panel (`div.auth-right`)
- **Background**: white
- **Form container**: max-width 440px

**Header** (gap 8px):
- H1: "Create Account", 28px light, `#111827`
- Subtitle: "Fill in your details to get started", 15px, `#6b7280`

**Social Login** (visual-only — OAuth integration planned): Google + Apple buttons, same as login but "Sign up with" text. Uses `SocialLoginButtons` component with `mode="signup"`

**Divider**: "or sign up with email"

**Form fields**:
- **First Name + Last Name**: side-by-side (gap 16px), each flex-1
- **Email Address**: full width
- **Password**: full width, with hint: "Must contain at least 8 characters, 1 number, and 1 special character" (12px, `#6b7280`)
- **Confirm Password**: full width
- All inputs: same styling as login (8px radius, `#d1d5db` border, 15px text, `#757575` placeholder)

**Terms checkbox**:
- Checkbox: 13px, 2.5px radius, `#767676` border
- Label: 14px, `#4b5563`, with "Terms of Service" and "Privacy Policy" as `#2699a6` links

**CTA**: "Create Account", `#2699a6` (secondary teal) bg, white text, 15px medium, rounded 8px, 16px padding

**Footer**: "Already have an account? Sign in" — same styling as login footer

## Font Note
Figma uses Roboto. App uses Inter.

## Responsive Translation
Same as login — hide left panel below `lg`.
