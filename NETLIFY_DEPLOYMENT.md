# 🌐 Netlify Deployment Instructions

## Issue Fixed
The admin panel was redirecting to onboarding on Netlify because:
1. Netlify wasn't using the correct build command
2. The environment variable wasn't being set properly

## Solution Implemented

### 1. Created `netlify.toml`
This file ensures Netlify always builds with admin enabled:
```toml
[build]
  command = "npm run build:web"
  publish = "dist"
  
[build.environment]
  VITE_ENABLE_ADMIN = "true"
```

### 2. Fixed `OnboardingGuard.tsx`
- Moved excluded routes calculation inside useEffect (runtime evaluation)
- Added debug logging to track admin status
- Ensured /admin routes are ALWAYS excluded when admin is enabled

### 3. Enhanced `src/config/env.ts`
- Added clear console logging showing admin status
- Shows configuration on every app load
- Helps debug if build was done correctly

---

## Deployment Steps

### Step 1: Clear Netlify Cache
```bash
# In Netlify dashboard:
# Site settings > Build & deploy > Build settings
# Click "Clear cache and retry deploy"
```

### Step 2: Deploy to Netlify

#### Option A: Automatic Deploy (Recommended)
1. Push your code to Git
2. Netlify will automatically detect `netlify.toml`
3. It will run: `npm run build:web`
4. Admin will be enabled automatically

#### Option B: Manual Deploy
```bash
# Build locally with admin enabled
npm run build:web

# Deploy dist/ folder to Netlify
netlify deploy --prod --dir=dist
```

### Step 3: Verify Deployment
1. Open your Netlify site: `https://couponsapp.netlify.app`
2. Open browser console (F12)
3. Look for the configuration banner:
```
═══════════════════════════════════════════════════
🚀 APP CONFIGURATION
═══════════════════════════════════════════════════
ENABLE_ADMIN: true
RAW FLAG: true
IS_PRODUCTION: true
Admin Routes: ✅ ENABLED
═══════════════════════════════════════════════════
```
4. Navigate to: `https://couponsapp.netlify.app/#/admin/login`
5. Should show admin login page (NOT onboarding)

---

## Testing Locally

### Test Web Build (Admin Enabled)
```bash
# Build with admin enabled
npm run build:web

# Serve locally
npx serve dist

# Open browser to: http://localhost:3000/#/admin/login
# Check console for: ENABLE_ADMIN: true
# Should show admin login page
```

### Test Mobile Build (Admin Disabled)
```bash
# Build with admin disabled
npm run build:mobile

# Serve locally
npx serve dist

# Open browser to: http://localhost:3000/#/admin
# Check console for: ENABLE_ADMIN: false
# Should redirect to home or onboarding
```

---

## Netlify Configuration Details

### Build Command
```bash
npm run build:web
```
This runs:
```bash
cross-env VITE_ENABLE_ADMIN=true vite build
```

### Environment Variable
Set in `netlify.toml`:
```toml
[build.environment]
  VITE_ENABLE_ADMIN = "true"
```

### Redirects
HashRouter redirects configured:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Admin URLs (HashRouter)

All admin routes use hash routing:

| Route | URL |
|-------|-----|
| Login | `https://couponsapp.netlify.app/#/admin/login` |
| Dashboard | `https://couponsapp.netlify.app/#/admin` |
| Coupons | `https://couponsapp.netlify.app/#/admin/coupons` |
| Categories | `https://couponsapp.netlify.app/#/admin/categories` |
| Stores | `https://couponsapp.netlify.app/#/admin/stores` |
| Countries | `https://couponsapp.netlify.app/#/admin/countries` |
| Leads | `https://couponsapp.netlify.app/#/admin/leads` |
| Settings | `https://couponsapp.netlify.app/#/admin/settings` |
| Notifications | `https://couponsapp.netlify.app/#/admin/notifications` |

---

## Troubleshooting

### Admin Still Redirects to Onboarding

**Check 1: Verify Build Command**
- Go to Netlify dashboard
- Site settings > Build & deploy > Build settings
- Ensure "Build command" is: `npm run build:web`

**Check 2: Check Console Logs**
- Open browser console on your Netlify site
- Look for the configuration banner
- If it shows `ENABLE_ADMIN: false`, Netlify is using wrong build

**Check 3: Clear Cache**
```bash
# In Netlify dashboard:
# Deploys > Trigger deploy > Clear cache and deploy site
```

**Check 4: Force Rebuild**
```bash
# Delete old deploy and redeploy
# Netlify dashboard > Deploys > [Latest deploy] > Options > Retry deploy
```

### Console Shows ENABLE_ADMIN: false

This means the build was done with mobile settings. Fix:
1. Verify `netlify.toml` exists in project root
2. Verify it has `VITE_ENABLE_ADMIN = "true"`
3. Clear Netlify cache
4. Redeploy

### OnboardingGuard Logs Show isExcluded: false

Open browser console and look for:
```
[OnboardingGuard] {
  pathname: "/admin/login",
  adminEnabled: false,  ← Should be true!
  excludedRoutes: ["/onboarding"],  ← Should include "/admin"!
  isExcluded: false  ← Should be true!
}
```

If this happens, the environment variable wasn't set during build.

---

## Manual Environment Variable (Alternative)

If `netlify.toml` doesn't work, set environment variable manually:

1. Go to Netlify dashboard
2. Site settings > Environment variables
3. Add variable:
   - Key: `VITE_ENABLE_ADMIN`
   - Value: `true`
4. Redeploy site

---

## Verification Checklist

After deployment, verify:

- [ ] Open browser console on Netlify site
- [ ] See configuration banner with `ENABLE_ADMIN: true`
- [ ] Navigate to `/#/admin/login`
- [ ] See admin login page (not onboarding)
- [ ] No console errors about missing routes
- [ ] OnboardingGuard logs show `isExcluded: true` for admin routes
- [ ] Can login to admin panel
- [ ] All admin pages load correctly

---

## Build Script Reference

### Web Build (Netlify)
```json
"build:web": "cross-env VITE_ENABLE_ADMIN=true vite build"
```

### Mobile Build (Capacitor)
```json
"build:mobile": "cross-env VITE_ENABLE_ADMIN=false vite build && npx cap sync"
```

---

## Summary

✅ **Fixed Issues:**
1. Added `netlify.toml` with correct build command
2. Set `VITE_ENABLE_ADMIN=true` in Netlify environment
3. Fixed OnboardingGuard to evaluate excluded routes at runtime
4. Added comprehensive logging for debugging

✅ **What Works Now:**
- Web builds always have admin enabled
- Mobile builds always have admin disabled
- No redirect loops
- Clear console logging shows configuration
- HashRouter works correctly

🚀 **Ready to deploy!**

