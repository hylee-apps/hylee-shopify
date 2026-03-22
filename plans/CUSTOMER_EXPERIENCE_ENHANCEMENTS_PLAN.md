# Implementation Plan: Customer Experience Enhancements (Hydrogen)

> **Status**: 🟡 In Progress
> **Created**: 2026-03-22
> **Last Updated**: 2026-03-22
> **Branch**: `feature/account/relationship-address-book`
> **Source**: Weekly Meeting 2026-03-22 (Shawn Jones & Jeremiah Tillman)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

## Overview

Four features from the weekly meeting to improve sign-up conversion, capture relationship data for marketing campaigns, and redesign the address book UX. The relationship data enables targeted marketing campaigns (e.g., "Send your cousin a gift — 20% off") and enriches the customer account experience (order history shows who things were shipped to).

One branch because all 4 features share the same data model (address book metafield + checkout attributes).

---

## Dependency Graph

```
Phase 1: Shared Infrastructure (lib files)
    │
    ├── Phase 2: Welcome Survey (independent)
    │
    ├── Phase 3: Address Book Redesign (independent of Phase 2)
    │       │
    │       └── Phase 4: Shipping Category Selector (needs Phase 3 data)
    │               │
    │               └── Phase 5: Order History Labels (needs Phase 4 attributes)
```

Phases 2 & 3 can run in parallel.

---

## Phase 1: Shared Infrastructure

### `hydrogen/app/lib/address-book.ts` (NEW)

- [x] Define types: `AddressCategory`, `FamilySubcategory`, `OtherSubcategory`, `FamilyRelationship`
- [x] Define interfaces: `AddressBook`, `AddressBookContact`, `ContactAddress`, `ContactPhone`, `ContactEmail`
- [x] Define constants: `ADDRESS_CATEGORIES`, `FAMILY_SUBCATEGORIES` (with labels + gendered relationships map), `OTHER_SUBCATEGORIES`
- [x] Implement `parseAddressBook(value: string | null): AddressBook` — JSON.parse with fallback to empty book
- [x] Implement `serializeAddressBook(book: AddressBook): string` — JSON.stringify
- [x] Implement `getContactsByCategory(book, category)` — filter contacts
- [x] Implement `getContactsBySubcategory(book, category, subcategory)` — filter contacts
- [x] Implement `generateContactLabel(contact): string` — derives "Mom", "Brother — Marcus", etc.
- [x] Implement `setPrimaryAddress(contact, addressId)` — toggle primary flag
- [x] Define Zod validation schema: `ContactFormSchema`, `AddressSchema`

### `hydrogen/app/lib/address-book-graphql.ts` (NEW)

- [x] Define `ADDRESS_BOOK_QUERY` — reads `customer.metafield(namespace: "custom", key: "address_book")` + `custom.survey_completed`
- [x] Define `METAFIELDS_SET_MUTATION` — `metafieldsSet` mutation for writing customer metafields
- [x] Implement `readAddressBook(context)` — query + parse
- [x] Implement `writeAddressBook(context, customerId, book)` — serialize + mutate
- [x] Implement `setSurveyCompleted(context, customerId)` — set boolean metafield
- [x] **SPIKE**: Verify Customer Account API supports `metafieldsSet` mutation. ✅ Confirmed working — metafield ID `36707091415194` created successfully.

### `hydrogen/app/lib/checkout.ts` (MODIFY)

- [x] Add 3 new keys to `CHECKOUT_ATTR`: `SHIPPING_CATEGORY`, `SHIPPING_RECIPIENT_LABEL`, `SHIPPING_CONTACT_ID`
- [x] Extend `getCheckoutAttributes()` to parse and return: `shippingCategory`, `shippingRecipientLabel`, `shippingContactId`
- [ ] Verify no breaking changes to existing checkout flow

### Phase 1 Testing

- [x] `pnpm typecheck` — all new types compile
- [x] Unit tests: `hydrogen/app/lib/__tests__/address-book.test.ts` — parse, serialize, filter, label generation, primary toggle

---

## Phase 2: Welcome Survey ("How Did You Hear About Us?")

### `hydrogen/app/routes/account.welcome.tsx` (NEW)

- [ ] Loader: auth guard → read `custom.survey_completed` metafield → if already done, redirect to `/account`
- [ ] Action: save survey response into `custom.address_book` metafield (initializes AddressBook if first time) + set `custom.survey_completed` to `true` → redirect to `/account`
- [ ] Component: full-page card with:
  - [ ] Heading: "Welcome to Hy-lee! Quick question — how did you hear about us?"
  - [ ] shadcn `RadioGroup` for source: Social Media, Google/Bing Search, Referred by a Friend, Other
  - [ ] Conditional shadcn `Select` for social platform (Instagram, TikTok, Facebook, X, YouTube, LinkedIn, Other) — shown when "Social Media" selected
  - [ ] Conditional shadcn `Input` for referrer's phone number — shown when "Referred by a Friend" selected, with copy: "Your friend gets 20% off!"
  - [ ] "Continue to Your Account" `Button` + "Skip" link (non-blocking)

### `hydrogen/app/routes/account._index.tsx` (MODIFY)

- [ ] In loader: check `custom.survey_completed`. If `false` and account `creationDate` < 7 days ago, redirect to `/account/welcome`
- [ ] Update "Your Addresses" nav card label to "Address Book" (same route `/account/addresses`)

### Phase 2 Testing

- [ ] Manual test: create account → visit `/account/welcome` → submit survey → verify metafield saved in Shopify Admin
- [ ] Manual test: revisit `/account/welcome` → should redirect to `/account`
- [ ] Manual test: skip survey → should still reach `/account`

---

## Phase 3: Address Book Redesign

### `hydrogen/app/components/account/CategoryTabs.tsx` (NEW)

- [ ] Horizontal tab bar: Home | Family | Friends | Work | Other
- [ ] Uses shadcn `Tabs`, `TabsList` (`variant="line"`), `TabsTrigger`, `TabsContent`
- [ ] Lucide icons per tab: `Home`, `Users`, `Heart`, `Briefcase`, `MoreHorizontal`
- [ ] Count badge on each tab (number of contacts in that category)

### `hydrogen/app/components/account/FamilySubTabs.tsx` (NEW)

- [ ] Secondary tab bar inside Family `TabsContent`
- [ ] Tabs: Parents | Siblings | Aunts/Uncles | Cousins | Grandparents
- [ ] Renders `ContactList` for the selected subcategory

### `hydrogen/app/components/account/ContactCard.tsx` (NEW)

- [ ] shadcn `Card` with header: relationship label + full name (e.g., "Brother — Marcus Jones")
- [ ] Primary address displayed with map-pin icon, phone, email
- [ ] If multiple addresses: shadcn `Accordion` to expand additional addresses
- [ ] Primary toggle (star icon) to change primary designation
- [ ] Edit `Button` → opens `ContactFormDialog`
- [ ] Delete `Button` → shadcn `Dialog` confirmation
- [ ] No redundant icons — person's name in card header, not category icon repeated

### `hydrogen/app/components/account/ContactFormDialog.tsx` (NEW)

- [ ] shadcn `Dialog` + `DialogContent` with `react-hook-form` + Zod validation
- [ ] Category: shadcn `Select` (Home, Family, Friends, Work, Other)
- [ ] Subcategory: conditional `Select` (Family → Parents/Siblings/Aunts-Uncles/Cousins/Grandparents; Other → Hotel/PO Box/Amazon Dropbox/Campground)
- [ ] Relationship: conditional `RadioGroup` (Siblings → Brother/Sister; Parents → Mom/Dad; Aunts/Uncles → Aunt/Uncle; Grandparents → Grandmother/Grandfather)
- [ ] First Name, Last Name: shadcn `Input`
- [ ] Address fields: address1, address2, city, state (`Select` with US states), zip, country (`Select`)
- [ ] Phone, Email: `Input`
- [ ] "+ Add another address" / "+ Add another phone" / "+ Add another email" dynamic rows
- [ ] Primary toggle per row

### `hydrogen/app/components/account/ContactList.tsx` (NEW)

- [ ] Renders list of `ContactCard` for a category/subcategory
- [ ] "+ Add [Category]" button at bottom
- [ ] Empty state: "No contacts yet. Add one to get started."

### `hydrogen/app/routes/account.addresses.tsx` (MAJOR REFACTOR)

**Loader changes:**
- [ ] Fetch Shopify native addresses (keep existing `ADDRESSES_QUERY`)
- [ ] Also fetch `custom.address_book` metafield via `readAddressBook(context)`
- [ ] Sync: auto-create home contacts for Shopify addresses missing from metafield

**Action changes — new intents alongside existing:**
- [ ] `createContact` — add contact to metafield; if category=home, also call `customerAddressCreate`
- [ ] `updateContact` — update contact in metafield; if home, also `customerAddressUpdate`
- [ ] `deleteContact` — remove from metafield; if home + has `shopifyAddressId`, also `customerAddressDelete`
- [ ] `addAddress` — add address row to existing contact
- [ ] `setPrimary` — toggle primary address/phone/email designation in metafield
- [ ] Keep existing intents (`create`, `update`, `delete`, `setDefault`) for backward compat

**Component changes:**
- [ ] Replace flat card grid with `CategoryTabs` component
- [ ] Home tab: synced Shopify addresses as `ContactCard` list
- [ ] Family tab: `FamilySubTabs` with nested contact lists
- [ ] Friends/Work tabs: flat `ContactList`
- [ ] Other tab: subcategory groups (Hotel, PO Box, Amazon Dropbox, Campground)

### Phase 3 Testing

- [ ] Manual test: visit `/account/addresses` → tabs render with correct icons
- [ ] Manual test: add contact in each category → verify metafield JSON in Shopify Admin
- [ ] Manual test: edit contact → changes saved
- [ ] Manual test: delete contact → removed from metafield
- [ ] Manual test: Home addresses sync bidirectionally with native Shopify addresses
- [ ] Manual test: Family nested tabs (Parents → Mom/Dad) work correctly
- [ ] Cross-browser test: Chrome, Safari, Firefox, Edge
- [ ] Mobile responsive: tab navigation wraps/scrolls on small screens

---

## Phase 4: Shipping Category Selector (Checkout)

### `hydrogen/app/components/checkout/ShippingCategorySelector.tsx` (NEW)

- [ ] "Who is this shipment for?" section above the address form
- [ ] Category buttons: Home | Family | Friends | Work | Other (segmented control via `RadioGroup` or `Button` variants)
- [ ] When category selected + logged in + saved contacts exist:
  - [ ] Show shadcn `Select` dropdown of saved contacts in that category
  - [ ] On contact select: auto-fill shipping form fields from contact's primary address
  - [ ] "New recipient" option for manual entry
- [ ] Hidden form inputs: `shippingCategory`, `shippingRecipientLabel`, `shippingContactId`
- [ ] For guests (not logged in): category selection only (no address book dropdown)

### `hydrogen/app/routes/checkout.shipping.tsx` (MODIFY)

- [ ] Loader: add optional address book fetch for logged-in users (`readAddressBook(context)` in try/catch)
- [ ] Component: insert `<ShippingCategorySelector>` above `<ShippingAddressCard>`
- [ ] Action: persist 3 new cart attributes (`SHIPPING_CATEGORY`, `SHIPPING_RECIPIENT_LABEL`, `SHIPPING_CONTACT_ID`) alongside existing

### `hydrogen/app/routes/checkout.review.tsx` (MODIFY)

- [ ] Read new shipping category attributes from `getCheckoutAttributes()`
- [ ] Display recipient label next to "Shipping Address" heading: "Shipping Address — For Mom" using `Badge`

### Phase 4 Testing

- [ ] Manual test: checkout → select shipping category → verify cart attributes saved
- [ ] Manual test: select saved contact → address auto-fills correctly
- [ ] Manual test: review page shows recipient label
- [ ] Manual test: guest checkout → category selection works without address book
- [ ] **SPIKE**: Verify cart attributes flow to order `customAttributes` after Shopify checkout completes

---

## Phase 5: Order History Relationship Labels

### `hydrogen/app/components/account/RecipientBadge.tsx` (NEW)

- [ ] Shared badge component: shows relationship label with category color
- [ ] Colors: home=green, family=blue, friends=purple, work=amber, other=gray
- [ ] Props: `category: AddressCategory`, `label: string`
- [ ] Matches existing `StatusBadge` pattern from `account.orders._index.tsx`

### `hydrogen/app/routes/account.orders.$id.tsx` (MODIFY)

- [ ] Add `customAttributes { key value }` to `ORDER_QUERY`
- [ ] Parse `checkout_shipping_category` and `checkout_shipping_recipient` from customAttributes
- [ ] Display `RecipientBadge` next to shipping address heading

### `hydrogen/app/routes/account.orders._index.tsx` (MODIFY)

- [ ] Add `customAttributes { key value }` to `CUSTOMER_ORDERS_QUERY`
- [ ] In `OrderCard` header: show `RecipientBadge` if `checkout_shipping_recipient` exists
- [ ] Ensure "My Orders" tab is visually highlighted as default active view

### Phase 5 Testing

- [ ] Manual test: view order that had category set → `RecipientBadge` shows in order detail
- [ ] Manual test: order list shows `RecipientBadge` in card headers
- [ ] Manual test: older orders (no category) gracefully show no badge

---

## Pre-Commit Checks (ALL Phases)

- [ ] `pnpm format` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes

---

## Blocked Items (Human Action Required)

| Blocker | Who | When | Status |
|---------|-----|------|--------|
| Create `custom.address_book` metafield in Shopify Admin | Admin | Before Phase 1 | ✅ Done 2026-03-22 |
| Create `custom.survey_completed` metafield in Shopify Admin | Admin | Before Phase 2 | ⬜ |
| Set up `support@hylee.com` email alias | Shawn | Before Phase 2 | ⬜ |
| Update Shopify activation email template | Admin | Before Phase 2 | ⬜ |
| Verify Customer Account API `metafieldsSet` support | Dev | First task | ✅ Confirmed 2026-03-22 — works via Customer Account API |
| Verify cart attributes → order `customAttributes` flow | Dev | Before Phase 5 | ⬜ |
| Derrick input on metafield approach | Derrick | Before Phase 3 | ⬜ |
| Figma conversion of address book mockups | Shawn/Design | Before Phase 3 | ⬜ |

### How to Complete Each Blocked Item

#### 1. Create `custom.address_book` Metafield Definition

> **Who**: Anyone with Shopify Admin access
> **When**: Before any code in Phase 1 can be tested

1. Log in to Shopify Admin at `https://admin.shopify.com`
2. Navigate to **Settings** (gear icon, bottom-left)
3. Click **Custom data** in the left sidebar
4. Click **Customers**
5. Click **Add definition**
6. Fill in:
   - **Name**: `Address Book`
   - **Namespace and key**: `custom.address_book`
   - **Type**: Select **JSON** (`json`)
   - **Description**: "Structured address book with relationship categories (home, family, friends, work, other). Stores contacts with multiple addresses, phones, emails, and family relationship metadata."
   - **Access**: Set **Storefront access** to "Read" (needed for checkout auto-populate)
7. Click **Save**

#### 2. Create `custom.survey_completed` Metafield Definition

> **Who**: Anyone with Shopify Admin access
> **When**: Before Phase 2 welcome survey route is tested

1. Same navigation as above: **Settings → Custom data → Customers**
2. Click **Add definition**
3. Fill in:
   - **Name**: `Survey Completed`
   - **Namespace and key**: `custom.survey_completed`
   - **Type**: Select **True or false** (`boolean`)
   - **Description**: "Flag indicating customer has completed the 'How did you hear about us?' welcome survey."
   - **Access**: Storefront access not needed (only read in account routes)
4. Click **Save**

#### 3. Set Up `support@hylee.com` Email Alias

> **Who**: Shawn (Google Workspace admin)
> **When**: Before Phase 2 activation email is updated

1. Log in to [Google Admin Console](https://admin.google.com)
2. Navigate to **Directory → Users**
3. Click the primary account that should receive support emails (e.g., Shawn's account)
4. Click **User information → Alternate email addresses (email alias)**
5. Click **Add an alias**
6. Enter `support` (the part before @hylee.com)
7. Click **Save**
8. Verify: send a test email to `support@hylee.com` and confirm it arrives in the inbox

**Alternative (Group alias)**: If multiple people should receive support emails:
1. Go to **Directory → Groups**
2. Click **Create group**
3. Name: `Support`, email: `support@hylee.com`
4. Add members who should receive support emails
5. Set **Who can post**: Anyone on the internet (so customers can reply)

#### 4. Update Shopify Activation Email Template

> **Who**: Anyone with Shopify Admin access
> **When**: After `support@hylee.com` alias is active and `account.welcome.tsx` route is deployed

1. Log in to Shopify Admin
2. Navigate to **Settings → Notifications**
3. Scroll to **Customer notifications** section
4. Click **Customer account invite** (this is the activation email)
5. Click **Edit code**
6. Make these changes to the email HTML/Liquid template:
   - **Change sender**: Update the "from" display to reference `support@hylee.com` (Note: the actual sender email is configured under **Settings → Store details → Store email** or **Sender email** — update that to `support@hylee.com`)
   - **Update subject line**: `"Welcome to Hy-lee! Activate your account"`
   - **Update body copy**: Replace the default activation text with:
     ```
     Welcome to Hy-lee!

     Thanks for creating an account. Click the button below to activate it
     and tell us how you found us — it only takes a second.

     {{ 'Activate Account' | customer_account_activation_url }}
     ```
   - **Activation URL redirect**: The activation URL is controlled by Shopify and cannot be changed in the email template. Instead, the redirect happens in the Hydrogen app — after activation, the account dashboard loader (`account._index.tsx`) checks if the survey is completed and redirects to `/account/welcome` if not.
7. Click **Save**
8. Send a test email (button at top) to verify formatting

**Note on sender email**: To change the "From" address on all customer notifications:
1. Go to **Settings → Store details**
2. Under **Store contact email** or **Sender email**, enter `support@hylee.com`
3. Shopify will send a verification email — click the link to confirm
4. All customer notifications will now come from `support@hylee.com`

#### 5. Verify Customer Account API Supports `metafieldsSet`

> **Who**: Developer (Jeremiah)
> **When**: First task in Phase 1 — blocks all metafield-dependent features

**Test procedure:**

1. Start the Hydrogen dev server: `pnpm dev` (from `hydrogen/`)
2. Create a temporary test route `hydrogen/app/routes/api.test-metafield.tsx`:
   ```typescript
   import type {Route} from './+types/api.test-metafield';

   const TEST_QUERY = `#graphql
     query TestCustomer {
       customer {
         id
         metafield(namespace: "custom", key: "address_book") {
           id
           value
         }
       }
     }
   `;

   const TEST_MUTATION = `#graphql
     mutation TestMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) {
         metafields { id key value }
         userErrors { field message }
       }
     }
   `;

   export async function loader({context}: Route.LoaderArgs) {
     const isLoggedIn = await context.customerAccount.isLoggedIn();
     if (!isLoggedIn) return Response.json({error: 'Not logged in'});

     // Step 1: Read — does the query work?
     const {data: readData} = await context.customerAccount.query(TEST_QUERY);

     // Step 2: Write — does metafieldsSet work?
     let writeResult = null;
     let writeError = null;
     try {
       const customerId = readData.customer?.id;
       writeResult = await context.customerAccount.mutate(TEST_MUTATION, {
         variables: {
           metafields: [{
             ownerId: customerId,
             namespace: 'custom',
             key: 'address_book',
             type: 'json',
             value: JSON.stringify({version: 1, contacts: []}),
           }],
         },
       });
     } catch (e) {
       writeError = e instanceof Error ? e.message : String(e);
     }

     return Response.json({
       readWorks: !!readData.customer?.id,
       customerId: readData.customer?.id,
       currentMetafield: readData.customer?.metafield,
       writeResult: writeResult?.data ?? null,
       writeError,
     });
   }
   ```
3. Log in to the Hydrogen storefront, then visit `/api/test-metafield`
4. Check the JSON response:
   - If `readWorks: true` and `writeResult` contains the metafield → **Customer Account API supports metafieldsSet. Proceed with the plan as-is.**
   - If `writeError` contains an error → **Customer Account API does NOT support metafieldsSet.**

**Fallback if `metafieldsSet` is not supported:**

Create an API route that uses the Shopify **Admin API** instead:

1. Create `hydrogen/app/routes/api.customer-metafields.tsx`
2. This route:
   - Accepts POST with `{ customerId, metafields }` body
   - Uses the Admin API (via `context.admin` or a direct fetch to `https://{store}.myshopify.com/admin/api/2024-10/graphql.json` with Admin API token)
   - Calls the Admin API's `metafieldsSet` mutation (which definitely supports it)
   - Returns the result
3. Update `writeAddressBook()` and `setSurveyCompleted()` in `address-book-graphql.ts` to POST to `/api/customer-metafields` instead of using `context.customerAccount.mutate()`
4. **Requires**: Shopify Admin API access token (stored as env var `SHOPIFY_ADMIN_API_TOKEN`). Generate one in Shopify Admin → Settings → Apps and sales channels → Develop apps → Create an app → Configure Admin API scopes (need `write_customers`) → Install app → Get token.

5. Delete the test route when done.

#### 6. Verify Cart Attributes Flow to Order `customAttributes`

> **Who**: Developer (Jeremiah)
> **When**: After Phase 4 shipping category selector is working, before Phase 5

**Test procedure:**

1. Start the Hydrogen dev server
2. Add items to cart and go through checkout
3. On the shipping page, select a shipping category (e.g., "Family") and recipient label (e.g., "Mom")
4. Complete the checkout through Shopify's native checkout
5. After order is placed, check in Shopify Admin:
   - Go to **Orders** → click the new order
   - Scroll to **Additional details** section at the bottom
   - Look for cart attributes: `checkout_shipping_category`, `checkout_shipping_recipient`, `checkout_shipping_contact_id`
6. Also verify via GraphQL — in the Hydrogen app, visit an order detail page and check if `customAttributes` returns the data

**Expected result**: Cart attributes set via `cartAttributesUpdate` should appear as `order.customAttributes` (also sometimes shown as "Additional details" or "Cart attributes" in Shopify Admin).

**If they DON'T appear**: Cart attributes only flow through to orders when checkout completes via Shopify's native checkout (which Hydrogen redirects to via `cart.checkoutUrl`). If using a custom checkout flow that doesn't go through Shopify checkout, attributes won't transfer. In that case, we'd need to save the category data as order metafields via a webhook or Shopify Flow.

#### 7. Derrick Input on Metafield Approach

> **Who**: Derrick (backend/API)
> **When**: Before Phase 3 implementation begins

**What to discuss with Derrick:**

1. **JSON metafield vs separate metafields**: The plan stores the entire address book as a single `json` metafield on the customer. Alternative: use individual metafields per contact (more granular but harder to manage). Get Derrick's preference.
2. **Data size**: Estimate ~25KB for 50 contacts. Shopify allows ~256KB per JSON metafield. Is this sufficient for projected growth?
3. **Race conditions**: If two browser tabs edit the address book simultaneously, the last write wins (read-modify-write pattern). Is this acceptable, or do we need optimistic locking?
4. **Admin API fallback**: If the Customer Account API doesn't support `metafieldsSet` (see blocker #5), we'll need an Admin API proxy route. Does Derrick have preferences on how to authenticate this? (App token vs session token)
5. **GiftShip evaluation**: The meeting mentioned GiftShip as a third-party alternative. Should we evaluate it before building custom? GiftShip handles gift-specific shipping but may not cover the full family relationship categorization Shawn wants.

**Action**: Schedule a 15-min sync with Derrick once he's back online. Share this plan doc for async review beforehand.

#### 8. Figma Conversion of Address Book Mockups

> **Who**: Shawn (design) or Jeremiah (if translating)
> **When**: Before Phase 3 pixel-perfect implementation

**What exists**: Shawn created mockups in Google Slides (saved under "Website Development → Address Book") during the meeting. These show:
- Horizontal tab bar (Home | Family | Friends | Work | Other)
- Family dropdown → Parents, Siblings, Aunts/Uncles, Cousins, Grandparents
- Sibling detail card: Brother/Sister with address, phone, email, primary toggle, edit/delete
- Multiple addresses per person

**Steps to convert to Figma:**

1. Open the Google Slides file under "Website Development → Address Book"
2. Take screenshots of each slide/mockup
3. In Figma (file key `d52sF4D2B0bIzt3A4z3UjE` — Hy-lee design file):
   - Create a new page: "Address Book"
   - Create frames at 1440px width (desktop) matching the mockup layouts
   - Use existing Hy-lee design tokens: `--primary` (#2ac864), `--secondary` (#2699a6), `--default` (#666)
   - Use existing component patterns from the PDP/Cart pages for cards, tabs, buttons
   - Create these frames:
     - Address Book — Home tab (default view)
     - Address Book — Family tab → Parents selected
     - Address Book — Family tab → Siblings selected (with Brother/Sister cards)
     - Address Book — Add Contact dialog
     - Address Book — Edit Contact dialog
     - Address Book — Mobile responsive (390px)
4. Once in Figma, the mandatory Figma Design Reference Process kicks in:
   - Run `get_screenshot`, `get_design_context`, `get_variable_defs` on each frame
   - Save to `hydrogen/design-references/address-book/figma-spec.md`
   - Build to pixel-perfect spec

**Alternative (skip Figma)**: If timeline is tight, implement Phase 3 from the Google Slides mockups directly, matching existing Hy-lee design patterns (shadcn components + Tailwind tokens). Do a design review with Shawn after implementation. This trades pixel-perfection for speed.

---

## Data Model Reference

### Customer Metafield: `custom.address_book` (JSON)

```typescript
interface AddressBook {
  version: 1;
  contacts: AddressBookContact[];
  surveyResponse?: {
    source: 'social_media' | 'search' | 'referral' | 'other';
    platform?: string;
    referrerPhone?: string;
    answeredAt: string;
  };
}

interface AddressBookContact {
  id: string;                    // crypto.randomUUID()
  category: 'home' | 'family' | 'friends' | 'work' | 'other';
  subcategory?: 'parents' | 'siblings' | 'aunts_uncles' | 'cousins' | 'grandparents'
              | 'hotel' | 'po_box' | 'amazon_dropbox' | 'campground';
  relationship?: 'mother' | 'father' | 'brother' | 'sister' | 'aunt' | 'uncle'
               | 'grandmother' | 'grandfather' | 'cousin';
  firstName: string;
  lastName: string;
  addresses: ContactAddress[];
  phones: { id: string; primary: boolean; number: string; }[];
  emails: { id: string; primary: boolean; email: string; }[];
}

interface ContactAddress {
  id: string;
  primary: boolean;
  shopifyAddressId?: string;  // links to native Shopify address (home only)
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
```

### Cart Attribute Keys (Extended)

```typescript
CHECKOUT_ATTR = {
  SHIPPING_ADDRESS: 'checkout_shipping_address',           // existing
  SHIPPING_METHOD: 'checkout_shipping_method',             // existing
  SHIPPING_COST: 'checkout_shipping_cost',                 // existing
  DELIVERY_INSTRUCTIONS: 'checkout_delivery_instructions', // existing
  PAYMENT_METHOD: 'checkout_payment_method',               // existing
  SHIPPING_CATEGORY: 'checkout_shipping_category',         // NEW
  SHIPPING_RECIPIENT_LABEL: 'checkout_shipping_recipient', // NEW
  SHIPPING_CONTACT_ID: 'checkout_shipping_contact_id',     // NEW
}
```

### Address Categories

| Category | Subcategories | Relationship Distinctions |
|---|---|---|
| Home | None | None |
| Family | Parents, Siblings, Aunts/Uncles, Cousins, Grandparents | Mom/Dad, Brother/Sister, Aunt/Uncle, Grandmother/Grandfather |
| Friends | None | None |
| Work | None | None |
| Other | Hotel, PO Box, Amazon Dropbox, Campground | None |

---

## Files Summary

| Action | File |
|--------|------|
| **NEW** | `hydrogen/app/lib/address-book.ts` |
| **NEW** | `hydrogen/app/lib/address-book-graphql.ts` |
| **NEW** | `hydrogen/app/routes/account.welcome.tsx` |
| **NEW** | `hydrogen/app/components/account/CategoryTabs.tsx` |
| **NEW** | `hydrogen/app/components/account/FamilySubTabs.tsx` |
| **NEW** | `hydrogen/app/components/account/ContactCard.tsx` |
| **NEW** | `hydrogen/app/components/account/ContactFormDialog.tsx` |
| **NEW** | `hydrogen/app/components/account/ContactList.tsx` |
| **NEW** | `hydrogen/app/components/checkout/ShippingCategorySelector.tsx` |
| **NEW** | `hydrogen/app/components/account/RecipientBadge.tsx` |
| **MODIFY** | `hydrogen/app/lib/checkout.ts` |
| **MODIFY** | `hydrogen/app/routes/account._index.tsx` |
| **MODIFY** | `hydrogen/app/routes/account.addresses.tsx` |
| **MODIFY** | `hydrogen/app/routes/checkout.shipping.tsx` |
| **MODIFY** | `hydrogen/app/routes/checkout.review.tsx` |
| **MODIFY** | `hydrogen/app/routes/account.orders.$id.tsx` |
| **MODIFY** | `hydrogen/app/routes/account.orders._index.tsx` |

---

## Notes

- **Shopify API Limitation**: Native Customer Account API addresses are flat — no relationship/category fields. The address book uses a customer metafield (JSON) as the storage layer. Home addresses sync bidirectionally with Shopify native addresses.
- **Plugin Opportunity**: The family address book could be packaged as a sellable Shopify app.
- **Data Ethics**: Shawn emphasized leveraging data for marketing (not selling to third parties). Relationship data is for internal campaigns and customer experience only.
- **Derrick absent** (Texas power outage) — metafield storage decisions may need his input.
- **Shawn's mockups** saved in Google Slides under "Website Development → Address Book" — needs Figma conversion before pixel-perfect implementation (per mandatory Figma Design Reference Process in `hydrogen/CLAUDE.md`).
- **Referral discount** (20% off Uber-style) may require Shopify Flow automation for matching referrer by phone → generating discount code. This is a stretch goal beyond the core survey feature.
