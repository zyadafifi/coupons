# 🚀 DEPLOY TO NETLIFY NOW

## Quick Steps (5 minutes)

### 1. Push Code to Git
```bash
git add .
git commit -m "Fix: Netlify admin access with netlify.toml"
git push
```

### 2. Clear Netlify Cache
1. Go to: https://app.netlify.com
2. Select your site
3. Click **Deploys** tab
4. Click **Trigger deploy** dropdown
5. Select **Clear cache and deploy site**

### 3. Wait for Deploy
- Watch deploy progress in Netlify dashboard
- Should take 2-3 minutes

### 4. Test Admin Access
```
https://couponsapp.netlify.app/#/admin/login
```

**Expected:**
- ✅ Admin login page loads
- ✅ Console shows: `ENABLE_ADMIN: true`
- ✅ No redirect to onboarding

---

## What Was Fixed

✅ Added `netlify.toml` with correct build command
✅ Set `VITE_ENABLE_ADMIN=true` for Netlify
✅ Fixed OnboardingGuard runtime evaluation
✅ Added clear console logging

---

## If It Still Doesn't Work

### Check Console
Open browser console and look for:
```
═══════════════════════════════════════════════════
🚀 APP CONFIGURATION
═══════════════════════════════════════════════════
ENABLE_ADMIN: true  ← Should be true!
```

If it shows `false`, Netlify used wrong build.

### Force Rebuild
```bash
# In Netlify dashboard:
# Site settings > Build & deploy > Build settings
# Verify: Build command = "npm run build:web"
# Then: Clear cache and deploy
```

---

## Verification

- [ ] Code pushed to Git
- [ ] Netlify cache cleared
- [ ] Deploy completed
- [ ] Admin login page loads
- [ ] Console shows `ENABLE_ADMIN: true`
- [ ] Can access all admin routes

---

**That's it!** 🎉

Full docs: `NETLIFY_FIX_SUMMARY.md`

