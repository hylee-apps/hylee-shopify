# Shopify Email Notification Templates

These templates redirect activation/reset links from Shopify's hosted domain
to the Hydrogen storefront. Apply them in **Shopify Admin → Settings → Notifications**.

> **IMPORTANT**: Replace `YOUR_HYDROGEN_DOMAIN` with your actual Hydrogen domain
> (e.g., `https://hylee.com` or `http://localhost:3000` for local dev).

---

## 1. Customer Account Invite (Activation)

**Shopify Admin path:** Settings → Notifications → Customer account invite

```liquid
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate Your Hylee Account</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#40283c 0%,#2699a6 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Hylee</h1>
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);font-weight:300;">Welcome to Hylee</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:300;color:#111827;">Activate Your Account</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#6b7280;">
                Hi{{ customer.first_name | prepend: ' ' }},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#6b7280;">
                Thanks for creating an account with Hylee! Click the button below to set your password and activate your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#2699a6;border-radius:8px;">
                    <a href="{{ customer.account_activation_url | replace: 'https://z1ea4m-md.myshopify.com', 'YOUR_HYDROGEN_DOMAIN' }}"
                       target="_blank"
                       style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">
                      Activate Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:20px;color:#2699a6;word-break:break-all;">
                {{ customer.account_activation_url | replace: 'https://z1ea4m-md.myshopify.com', 'YOUR_HYDROGEN_DOMAIN' }}
              </p>

              <p style="margin:0;font-size:13px;line-height:20px;color:#9ca3af;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                &copy; {{ 'now' | date: '%Y' }} Hylee. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Customer Account Password Reset

**Shopify Admin path:** Settings → Notifications → Customer account password reset

```liquid
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Hylee Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4285f4 0%,#2bd9a8 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Hylee</h1>
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);font-weight:300;">Account Security</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:300;color:#111827;">Reset Your Password</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#6b7280;">
                Hi{{ customer.first_name | prepend: ' ' }},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#6b7280;">
                We received a request to reset the password for your Hylee account. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#2699a6;border-radius:8px;">
                    <a href="{{ customer.reset_password_url | replace: 'https://z1ea4m-md.myshopify.com', 'YOUR_HYDROGEN_DOMAIN' }}"
                       target="_blank"
                       style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:20px;color:#2699a6;word-break:break-all;">
                {{ customer.reset_password_url | replace: 'https://z1ea4m-md.myshopify.com', 'YOUR_HYDROGEN_DOMAIN' }}
              </p>

              <p style="margin:0;font-size:13px;line-height:20px;color:#9ca3af;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                &copy; {{ 'now' | date: '%Y' }} Hylee. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Setup Instructions

1. Go to **Shopify Admin → Settings → Notifications**
2. Find **"Customer account invite"** → click to edit → replace the HTML body with Template 1 above
3. Find **"Customer account password reset"** → click to edit → replace the HTML body with Template 2 above
4. **Find-and-replace** `YOUR_HYDROGEN_DOMAIN` with your actual domain in both templates
   - Local dev: `http://localhost:3000`
   - Production: `https://your-production-domain.com`
5. Send a test email to verify the links work

## URL Mapping

| Shopify URL | Hydrogen Route |
|---|---|
| `/account/activate/:id/:token` | `account.activate.$id.$token.tsx` |
| `/account/reset/:id/:token` | `account.reset.$id.$token.tsx` |
