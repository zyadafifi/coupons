# Environment Configuration for Admin Separation

## Overview
This project uses environment variables to separate the Admin Panel (web) from the Mobile App.

## Environment Files

Since `.env` files cannot be committed, you need to create them manually:

### For Web Deployment (Admin Enabled)
Create `.env.web`:
```env
VITE_ENABLE_ADMIN=true
```

### For Mobile Build (Admin Disabled)
Create `.env.mobile`:
```env
VITE_ENABLE_ADMIN=false
```

### For Local Development (Admin Enabled)
Create `.env.development`:
```env
VITE_ENABLE_ADMIN=true
```

## Build Commands

The `package.json` scripts use `cross-env` to set environment variables inline, so you don't need to manually create these files for building. However, if you want to use `.env` files:

### Web Build (Admin Enabled)
```bash
npm run build:web
```
This builds with `VITE_ENABLE_ADMIN=true` for Netlify deployment.

### Mobile Build (Admin Disabled)
```bash
npm run build:mobile
```
This builds with `VITE_ENABLE_ADMIN=false` and syncs to native projects.

### Android Build Only
```bash
npm run build:mobile:android
```

### iOS Build Only
```bash
npm run build:mobile:ios
```

## How It Works

1. **Web Build**: 
   - Sets `VITE_ENABLE_ADMIN=true`
   - Admin routes are registered
   - Admin components are imported
   - Accessible at URLs like: `https://yoursite.com/#/admin/login`

2. **Mobile Build**:
   - Sets `VITE_ENABLE_ADMIN=false`
   - Admin routes are NOT registered
   - Admin components are NOT included in bundle
   - Any attempt to navigate to `/admin/*` redirects to home
   - Tree-shaking removes unused admin code

## Testing Locally

### Test Web Admin (local)
```bash
# Start dev server (admin enabled by default)
npm run dev

# Navigate to: http://localhost:8080/#/admin/login
```

### Test Mobile Build (local)
```bash
# Build for mobile
npm run build:mobile

# Open Android Studio
npm run open:android

# Run on device/emulator
# Verify that navigating to any admin route redirects to home
```

## Deployment

### Netlify (Web with Admin)
```bash
# Build for web
npm run build:web

# Deploy the dist/ folder
# Or configure Netlify to run: npm run build:web
```

### Android APK (No Admin)
```bash
# Build for Android
npm run build:mobile:android

# Open Android Studio
npm run open:android

# Build APK/AAB from Android Studio
```

## Verification

### Check if Admin is Enabled
Open browser console and look for:
```
[ENV] Configuration: { ENABLE_ADMIN: true/false, ... }
```

### Verify Admin Routes
- **Web**: Navigate to `/#/admin/login` - should show login page
- **Mobile**: Try to navigate to admin - should redirect to home

## Security Note

- Admin routes are completely removed from mobile builds (not just hidden)
- Tree-shaking ensures admin code is not in the mobile bundle
- No environment variables are exposed to end users
- Firebase rules should still enforce server-side security

