# Mobile App Testing Guide

## Overview
This guide covers testing the Capacitor mobile app on Android devices.

## Prerequisites

### For Android Testing
1. **Android Studio** installed
2. **Android SDK** (API 22+)
3. **Physical Android device** or **Android Emulator**
4. **USB Debugging** enabled on physical device

### For iOS Testing (Requires Mac)
1. **Xcode** installed
2. **iOS Simulator** or physical iOS device
3. **Apple Developer account** for device testing

## Setup for Testing

### 1. Build the App
```bash
npm run build:mobile
```

This will:
- Build the web assets with Vite
- Sync assets to native projects

### 2. Open Android Studio
```bash
npm run open:android
```

Or manually:
```bash
npx cap open android
```

### 3. Configure Android Device/Emulator

#### Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Accept USB debugging prompt on device

#### Emulator
1. Open Android Studio
2. Tools > Device Manager
3. Create a new Virtual Device (recommended: Pixel 5, API 33+)
4. Start the emulator

## Running the App

### Method 1: From Android Studio
1. Select your device/emulator from the dropdown
2. Click the green "Run" button (▶️)
3. Wait for build and installation

### Method 2: From Command Line
```bash
npm run run:android
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] App launches successfully
- [ ] Splash screen displays correctly
- [ ] Status bar color matches theme (#7c3aed)
- [ ] Bottom navigation works
- [ ] All routes are accessible

### ✅ Onboarding Flow
- [ ] Country picker appears on first launch
- [ ] Phone number input works
- [ ] Country code selector works
- [ ] Form validation works
- [ ] Can complete onboarding

### ✅ Home Screen
- [ ] Coupons load from Firebase
- [ ] Hero carousel displays
- [ ] Category chips scroll horizontally
- [ ] Search functionality works
- [ ] Filter sheet opens and works
- [ ] Pull-to-refresh works

### ✅ Coupon Details
- [ ] Coupon detail page loads
- [ ] Coupon code can be copied
- [ ] "Use Coupon" button works
- [ ] Deep link opens external browser/app
- [ ] Back button returns to home

### ✅ Favorites
- [ ] Can add coupons to favorites
- [ ] Favorites persist after app restart
- [ ] Can remove from favorites
- [ ] Empty state shows when no favorites

### ✅ Notifications
- [ ] Notifications list loads
- [ ] Can mark as read
- [ ] Empty state shows correctly

### ✅ RTL (Arabic) Support
- [ ] Text displays right-to-left
- [ ] Layout mirrors correctly
- [ ] Icons align properly
- [ ] Navigation flows right-to-left

### ✅ Push Notifications
- [ ] App requests notification permission
- [ ] FCM token is registered
- [ ] Can receive notifications (test via Firebase Console)
- [ ] Tapping notification opens correct screen
- [ ] Foreground notifications show toast

### ✅ Deep Linking
- [ ] Can open app via `coupons://` scheme
- [ ] Can open specific coupon via deep link
- [ ] Web links open in browser

### ✅ Keyboard Handling
- [ ] Keyboard appears for input fields
- [ ] Bottom nav doesn't overlap keyboard
- [ ] Keyboard dismisses properly
- [ ] Screen adjusts when keyboard appears

### ✅ Safe Areas
- [ ] Content doesn't overlap notch (if applicable)
- [ ] Bottom nav respects home indicator
- [ ] Status bar area is handled correctly

### ✅ Performance
- [ ] App loads quickly
- [ ] Smooth scrolling
- [ ] No lag when navigating
- [ ] Images load progressively
- [ ] No memory leaks

### ✅ Offline Behavior
- [ ] App works without internet (cached data)
- [ ] Shows appropriate error messages
- [ ] Can retry failed requests

### ✅ Admin Panel (Optional on Mobile)
- [ ] Admin login works
- [ ] Can access admin routes
- [ ] Forms work on mobile

## Testing Push Notifications

### Via Firebase Console
1. Go to Firebase Console
2. Select your project
3. Navigate to Cloud Messaging
4. Click "Send test message"
5. Enter FCM token (check app logs)
6. Send notification

### Via Backend API
If you have a backend API:
```bash
curl -X POST https://your-api.com/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "all",
    "title": "Test Notification",
    "body": "This is a test",
    "data": {
      "couponId": "test123"
    }
  }'
```

## Testing Deep Links

### Android
```bash
adb shell am start -W -a android.intent.action.VIEW -d "coupons://coupon/123" com.coupons.app
```

### Test URLs
- `coupons://` - Opens home
- `coupons://coupon/123` - Opens coupon detail
- `https://coupons.app/coupon/123` - Opens via HTTPS

## Debugging

### View Logs
#### Android Studio
1. Open Logcat (bottom panel)
2. Filter by package: `com.coupons.app`
3. Look for `[Push]`, `[StatusBar]`, etc. tags

#### Command Line
```bash
adb logcat | grep "Capacitor"
```

### Chrome DevTools
1. Open Chrome
2. Navigate to `chrome://inspect`
3. Find your device
4. Click "inspect"
5. Use console and network tabs

### Common Issues

#### App Won't Install
- Check USB debugging is enabled
- Try `adb devices` to verify connection
- Uninstall old version manually

#### Push Notifications Not Working
- Verify `google-services.json` is in place
- Check FCM token is registered
- Verify Firebase project configuration
- Check notification permissions

#### Deep Links Not Working
- Verify AndroidManifest.xml has intent filters
- Test with `adb shell am start` command
- Check URL scheme matches

#### Keyboard Issues
- Verify Keyboard plugin is installed
- Check `capacitor.config.ts` keyboard settings
- Test on different Android versions

## Performance Testing

### Check Bundle Size
```bash
npm run build
```
Look at the output for chunk sizes.

### Test on Low-End Device
- Use Android emulator with limited RAM (2GB)
- Test on older Android versions (API 22-24)
- Check for performance issues

## Generating Test Build

### Debug APK
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Requires Signing)
```bash
cd android
./gradlew assembleRelease
```

## Next Steps After Testing

1. **Fix Issues**: Address any bugs found during testing
2. **Optimize Performance**: Reduce bundle size, optimize images
3. **Generate Icons**: Use `ICON_GENERATION.md` guide
4. **Configure Firebase**: Follow `FIREBASE_SETUP.md`
5. **Prepare for Release**: Set up signing keys, version numbers
6. **Submit to Play Store**: Create store listing, upload APK/AAB

## Continuous Testing

- Test after each major feature addition
- Test on multiple Android versions
- Test on different screen sizes
- Test with slow network conditions
- Test with airplane mode

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest
- E2E tests with Detox or Appium
- CI/CD pipeline for automated builds

