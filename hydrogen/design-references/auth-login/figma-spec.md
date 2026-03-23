# Auth Login — Figma Spec

- **File**: Account Pages (`Q541sIDD20eXqQSSozFUw4`)
- **Node**: `1:63`
- **Captured**: 2026-03-23

## Layout

Split-screen: left branding panel + right form panel. Full viewport height.

### Left Panel (`div.auth-left`)
- **Gradient**: `linear-gradient(135deg, rgb(66,133,244) 0%, rgb(43,217,168) 100%)`
- **Padding**: 32px all sides
- **Content max-width**: 400px, centered vertically and horizontally

**Logo**: "Hylee" text, 48px bold, white, tracking -1px, leading 72px
**Tagline**: "Welcome Back", 24px light, white, opacity 95%, leading 36px
**Description**: 16px regular, white, leading 24px, centered
**Features** (gap 16px between items, gap 12px icon-to-text):
- Check icon: `#2bd9a8`, 16px
- Text: 16px regular, white, leading 24px
- Items: Track orders, Easy returns, Faster checkout, Exclusive offers

### Right Panel (`div.auth-right`)
- **Background**: white
- **Padding**: 32px
- **Form container**: max-width 440px, centered

**Header** (gap 8px, top 32px inset):
- H1: "Sign In", 28px light, `#111827`, centered
- Subtitle: 15px regular, `#6b7280`, centered

**Social Login** (gap 12px, visual-only — OAuth integration planned):
- Google button: white bg, 1px `#d1d5db` border, rounded 8px, 48px height, Google color icon + "Sign in with Google" 15px medium `#374151`
- Apple button: same styling, black Apple icon + "Sign in with Apple"
- Currently rendered as disabled buttons (`SocialLoginButtons` component)

**Divider** (gap 16px):
- Lines: 1px `#e5e7eb`
- Text: "or sign in with email", 13px regular, `#9ca3af`

**Form** (gap 20px):
- **Labels**: 14px medium, `#374151`
- **Inputs**: white bg, 1px `#d1d5db` border, rounded 8px, 17px horizontal padding, 13px vertical padding, 15px text, placeholder `#757575`
- **Remember me row**: checkbox 16px with 2.5px radius border `#767676`, label 14px `#4b5563` + "Forgot password?" 14px medium `#2699a6`
- **CTA**: "Sign In", `#56972d` bg, white text, 15px medium, rounded 8px, 16px vertical / 20px top padding

**Footer** (border-top 1px `#e5e7eb`, 25px padding-top):
- "Don't have an account?", 15px regular `#6b7280`
- "Create account", 15px medium `#2699a6`

## Font Note
Figma uses Roboto. App uses Inter + Assistant. Use Inter.

## Responsive Translation
- Below `lg`: hide left panel, right panel full width
- Form container: `max-w-[440px]` with auto margins
