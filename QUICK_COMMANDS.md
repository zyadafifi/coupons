# 🚀 Quick Command Reference

## Build Commands

### Web Deployment (Admin Enabled)
```bash
npm run build:web
```
**Output**: `dist/` folder with admin included  
**Deploy to**: Netlify  
**Admin URL**: `https://yoursite.com/#/admin/login`

### Android APK (Admin Disabled)
```bash
npm run build:mobile:android
npm run open:android
```
**Output**: Android Studio opens  
**Action**: Click Run ▶️ or build APK

### iOS Build (Admin Disabled)
```bash
npm run build:mobile:ios
npm run open:ios
```
**Output**: Xcode opens (requires Mac)

---

## Testing Commands

### Test Web Admin Locally
```bash
npm run dev
```
**Navigate to**: `http://localhost:8080/#/admin/login`

### Test Mobile Build
```bash
npm run build:mobile:android
npm run open:android
```
**Action**: Run in emulator and verify admin routes redirect

---

## Verification

### Check Environment in Browser Console
```
[ENV] Configuration: { ENABLE_ADMIN: true }   # Web
[ENV] Configuration: { ENABLE_ADMIN: false }  # Mobile
```

### Verify Real-Time Sync
1. Open mobile app
2. Open web admin
3. Add/edit coupon in admin
4. **Result**: Mobile updates automatically (1-2 seconds)

---

## Bundle Sizes

| Build Type | Size | Admin Code |
|------------|------|------------|
| Web | 970 KB | ✅ Included |
| Mobile | 766 KB | ❌ Removed |
| **Savings** | **204 KB** | **21% reduction** |

---

## Admin URLs (HashRouter)

Replace `yoursite.com` with your actual domain:

- Login: `https://yoursite.com/#/admin/login`
- Dashboard: `https://yoursite.com/#/admin`
- Coupons: `https://yoursite.com/#/admin/coupons`
- Categories: `https://yoursite.com/#/admin/categories`
- Stores: `https://yoursite.com/#/admin/stores`

---

## Troubleshooting

### Clean Build
```bash
rm -rf dist android/app/src/main/assets/public
npm run build:mobile:android
```

### Check Capacitor Sync
```bash
npx cap sync android
```

### View Android Logs
```bash
adb logcat | grep "Capacitor\|ENV"
```

---

**📖 Full docs**: See `IMPLEMENTATION_COMPLETE.md`

