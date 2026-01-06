# Security Documentation

## Overview

This document outlines the security measures implemented in the Coupons application, covering both code-level protections and required manual configurations.

---

## 🔒 Security Measures Implemented

### 1. Firestore Security Rules ✅

**File:** `firestore.rules`

**What it does:**
- Enforces server-side access control for all Firestore collections
- Public read access only for active (`isActive: true`) coupons, categories, stores, and countries
- Write access restricted to authenticated admins only
- Protects against unauthorized data modification or deletion

**Implementation:**
Two variants are provided in the rules file:

**Variant A (RECOMMENDED):** Custom Claims
```javascript
function isAdmin() {
  return request.auth.token.admin == true;
}
```

**Variant B (FALLBACK):** UID Allowlist
```javascript
function isAdmin() {
  return request.auth.uid in ['UID1', 'UID2'];
}
```

**How to deploy:** See [Deploying Firestore Rules](#deploying-firestore-rules) section below.

---

### 2. Admin Authorization System ✅

**Files:**
- `src/contexts/AdminAuthContext.tsx`

**What it does:**
- Replaces email-based admin checks with Firebase Auth custom claims
- Checks admin status on both client and server (Supabase Edge Functions)
- Fallback to UID allowlist if custom claims not set

**Client-side:**
- Verifies custom claims: `token.admin === true`
- Checks UID allowlist (if configured)
- Checks Firestore `/admins/{uid}` document

**Note:** Client-side checks are for UI only. Real security is enforced by:
1. Firestore rules (data access)

---

### 3. XSS Protection (HTML Sanitization) ✅

**Files:**
- `src/security/sanitizeHtml.ts` (centralized utility)
- `src/pages/CouponDetail.tsx` (uses sanitizeRichText)
- `src/components/ui/chart.tsx` (uses sanitizeCss)

**What it does:**
- All HTML content is sanitized with DOMPurify before rendering
- Blocks script tags, event handlers, and javascript: URLs
- Enforces `rel="noopener noreferrer"` on external links
- Provides three sanitization levels:
  - `sanitizeHtml()` - Strict (basic formatting only)
  - `sanitizeRichText()` - Moderate (allows rich text editor tags)
  - `sanitizeCss()` - CSS only (for dynamic styles)

**Configuration:**
- Allowed tags: p, h1-h6, strong, em, ul, ol, li, br, span, a
- Forbidden tags: script, iframe, object, embed, form, input, style
- Forbidden attributes: onclick, onerror, onload, etc.

---

### 4. Environment Variables & Secrets ✅

**Files:**
- `.gitignore` (updated to exclude all .env files)
- `env.example.txt` (template with placeholders)

**What it does:**
- Ensures no sensitive credentials are committed to Git
- Provides template for required environment variables
- Documents which variables are client-safe vs server-only

**Client-side variables (safe to expose):**
- `VITE_FIREBASE_*` - Firebase config
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `VITE_ENABLE_ADMIN` - Admin panel toggle

**Server-side variables (NEVER expose in client code):**
- `FIREBASE_SERVICE_ACCOUNT` - Full service account JSON
- `ADMIN_UID_ALLOWLIST` - Comma-separated admin UIDs
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key

---

### 5. Netlify Security Headers ✅

**File:** `netlify.toml`

**What it does:**
Adds comprehensive HTTP security headers to all responses:

- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin** - Limits referrer info
- **Permissions-Policy** - Disables unnecessary browser APIs (camera, mic, etc.)
- **Content-Security-Policy (CSP)** - Restricts resource loading:
  - Scripts: Self + Firebase/Google CDNs (with unsafe-inline for React)
  - Styles: Self + Google Fonts (with unsafe-inline for inline styles)
  - Images: Self + HTTPS + data URLs
  - Connections: Self + Firebase + Supabase
  - Frames: Self + Firebase (for auth)
  - No inline scripts or eval (except where required by framework)

**Cache policies:**
- Service workers: No cache (ensures auth updates)
- Assets: 1 year immutable cache
- HTML: No cache (gets updates immediately)

---

### 6. Dependency Auditing ✅

**File:** `package.json`

**What it does:**
Adds npm scripts for security auditing:

```bash
npm run audit              # Run security audit
npm run audit:fix          # Auto-fix vulnerabilities
npm run audit:report       # Generate JSON report
npm run security:check     # Audit + check outdated packages
npm run security:update    # Update deps + fix vulnerabilities
```

**Best practices:**
- Run `npm audit` before each deployment
- Review audit reports regularly
- Update dependencies quarterly
- Use `audit:fix` for automatic patches

---

### 7. Production Logging Security ✅

**Files:**
- `src/config/env.ts`

**What it does:**
- Development: Full debug logging with sensitive data
- Production: Minimal logging, no tokens or sensitive info
- Auth tokens: Never logged to console

---

## 📋 Deployment Checklist

### Step 1: Set Up Firebase Admin Custom Claims

**RECOMMENDED METHOD** for admin authorization:

1. Install Firebase Admin SDK (local or Cloud Functions):
   ```bash
   npm install firebase-admin
   ```

2. Create a Node.js script to set admin claims:
   ```javascript
   const admin = require('firebase-admin');
   admin.initializeApp();
   
   // Replace with your admin user's UID
   const adminUid = 'YOUR_ADMIN_UID_HERE';
   
   admin.auth().setCustomUserClaims(adminUid, { admin: true })
     .then(() => console.log('Admin claim set successfully'))
     .catch(error => console.error('Error:', error));
   ```

3. Run the script once to set admin status
4. Admin must sign out and back in for claims to take effect

**How to find your Firebase UID:**
1. Sign in to admin panel (temporary - will fail after rules are deployed)
2. Open browser console
3. Run: `firebase.auth().currentUser.uid`
4. Copy the UID

---

### Step 2: Deploy Firestore Security Rules

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Copy contents of `firestore.rules` file
5. Paste into the rules editor
6. **IMPORTANT:** Update the `isAdmin()` function:
   - **Option A (Recommended):** Use as-is for custom claims
   - **Option B (Fallback):** Replace UIDs in allowlist:
     ```javascript
     function isAdminWithUID() {
       return request.auth.uid in [
         'ACTUAL_ADMIN_UID_1',
         'ACTUAL_ADMIN_UID_2'
       ];
     }
     ```
7. Click **Publish**
8. Test by trying to write data without admin auth (should fail)

**Testing rules:**
```javascript
// In browser console (should fail)
firebase.firestore().collection('coupons').add({test: true});
// Expected: Error: Missing or insufficient permissions
```

---

### Step 3: Configure Netlify Environment Variables

1. Go to Netlify Dashboard: https://app.netlify.com
2. Select your site
3. Navigate to **Site settings** > **Environment variables**
4. Add the following variables:

```
VITE_ENABLE_ADMIN=true
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Save and redeploy site

---

---

### Step 5: Build and Test

#### Web Build (with admin panel):
```bash
npm run build:web
npm run preview
```

Test:
1. Visit http://localhost:4173
2. Navigate to /admin (should load admin panel)
3. Sign in with admin credentials
4. Verify admin features work

#### Mobile Build (without admin panel):
```bash
npm run build:mobile
```

Test:
1. Check build output - admin routes should not be included
2. Run on Android/iOS simulator
3. Verify /admin route redirects or shows 404

#### Android APK:
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/`

---

### Step 6: Security Verification

Run these tests after deployment:

#### 1. Firestore Rules Test
```javascript
// As non-admin user, try to write (should fail)
firebase.firestore().collection('coupons').add({test: true});
// Expected: Error: Missing or insufficient permissions

// As non-admin, read active coupons (should succeed)
firebase.firestore().collection('coupons')
  .where('isActive', '==', true).get();
// Expected: Success
```

#### 2. Admin Panel Test
- Non-admin user should be blocked from /admin
- Admin user should access /admin successfully
- Admin operations (add/edit/delete) should work

#### 3. XSS Test
Create a coupon with description:
```html
<script>alert('XSS')</script><img src=x onerror=alert('XSS')>
```
Expected: Script tags removed, no alert shown

#### 4. CSP Test
- Check browser console for CSP violations
- All assets should load without errors
- No inline script errors (except allowed ones)

---

## 🚨 Security Incidents Response

If you suspect a security breach:

1. **Immediate Actions:**
   - Revoke compromised Firebase service account keys
   - Rotate Supabase service role key
   - Force sign-out all admin users
   - Review Firestore audit logs

2. **Investigation:**
   - Check Firebase Authentication logs
   - Review Firestore usage patterns
   - Check Supabase Edge Functions logs
   - Examine Netlify access logs

3. **Recovery:**
   - Update all secrets and keys
   - Review and tighten Firestore rules
   - Audit admin user accounts
   - Update dependencies

---

## 📚 Additional Resources

- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Netlify Security Headers](https://docs.netlify.com/routing/headers/)

---

## 🔄 Regular Maintenance

### Weekly
- Review admin panel access logs
- Check for unusual data modifications
- Monitor error rates in Edge Functions

### Monthly
- Run `npm audit` and fix vulnerabilities
- Review Firebase usage and costs
- Update dependencies with `npm update`

### Quarterly
- Review and update Firestore rules
- Audit admin user accounts
- Update major dependencies
- Review CSP and security headers

---

## 📞 Security Contact

For security issues, please:
1. Do NOT open a public GitHub issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for patching before disclosure

---

Last Updated: December 2025

