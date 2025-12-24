# 🔍 COMPREHENSIVE SPLASH SCREEN AUDIT & FIX

## A) AUDIT RESULTS - Every Splash Reference Found

### 1. AndroidManifest.xml
**File**: `android/app/src/main/AndroidManifest.xml`
```xml
Line 5:  android:icon="@mipmap/ic_launcher"
Line 7:  android:roundIcon="@mipmap/ic_launcher_round"
Line 14: android:theme="@style/AppTheme.NoActionBarLaunch"
```
**Analysis**: MainActivity uses `AppTheme.NoActionBarLaunch` as launch theme ✅

---

### 2. Theme Files

#### Pre-Android 12 (API < 31)
**File**: `android/app/src/main/res/values/styles.xml`
```xml
Line 19: <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
Line 20:     <item name="android:background">@drawable/splash</item>
Line 21: </style>
```
**Analysis**: Uses `@drawable/splash` as window background ⚠️

#### Android 12+ (API 31+)
**File**: `android/app/src/main/res/values-v31/styles.xml`
```xml
Line 4:  <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
Line 6:      <item name="android:windowSplashScreenBackground">#7c3aed</item>
Line 10-11:  <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
Line 14-15:  <item name="android:windowSplashScreenIconBackgroundColor">#7c3aed</item>
Line 19:     <item name="android:background">@null</item>
Line 20: </style>
```
**Analysis**: Properly configured for Android 12+ system splash ✅

---

### 3. Capacitor Configuration
**File**: `capacitor.config.ts`
```typescript
Line 13: launchShowDuration: 0
Line 14: launchAutoHide: false
Line 16: androidSplashResourceName: 'splash'
```
**Analysis**: ⚠️ **THIS IS THE PROBLEM!**
- `launchAutoHide: false` means Capacitor's splash plugin will KEEP showing a splash
- Combined with manual hide in `useSplashScreen.ts` at 300ms
- This creates a SECOND splash layer on top of the theme splash

---

### 4. JavaScript Splash Control
**File**: `src/hooks/useSplashScreen.ts`
```typescript
Line 49: const timer = setTimeout(hideSplash, 300);
```
**Analysis**: Manually hides splash after 300ms ⚠️

---

## B) ROOT CAUSE IDENTIFIED

### 🎯 THE DOUBLE SPLASH CULPRIT:

**Three-Layer Splash System:**

1. **Layer 1: Android Theme Splash (Native)** - Shows immediately
   - Pre-Android 12: Window background set to `@drawable/splash`
   - Android 12+: System splash with `splash_icon` + purple background
   - ✅ This is CORRECT and what we want

2. **Layer 2: Capacitor SplashScreen Plugin** - OVERLAYS on top! ❌
   - `launchAutoHide: false` keeps Capacitor's splash showing
   - Capacitor shows its own version of `@drawable/splash`
   - Creates a SECOND splash layer or causes flicker/transition
   - ❌ This is the PROBLEM

3. **Layer 3: React MobileLoadingGate** - Shows after splash hides
   - Appears after 300ms when useSplashScreen hides Layer 1+2
   - ✅ This is intentional and works correctly

### Why You See Two Splashes:

```
Timeline:
0ms    → Android theme splash appears (Layer 1) ✅
0ms    → Capacitor plugin splash ALSO tries to show (Layer 2) ❌
300ms  → useSplashScreen.ts calls SplashScreen.hide()
        → Both Layer 1 and Layer 2 hide
300ms  → MobileLoadingGate appears (Layer 3) ✅
```

The issue: Layers 1 and 2 are both trying to show, causing:
- Double rendering
- Flickering
- One splash appearing before another
- Inconsistent behavior across Android versions

---

## C) THE FIX - Use ONLY Android Theme Splash

### Strategy: Single Native Splash Only

**Goal**: Use the Android native theme splash as THE ONLY splash, with manual control via JavaScript.

**Implementation**:

1. ✅ **Keep Android theme splash** (already correct)
2. ❌ **Disable Capacitor plugin's splash overlay** (change config)
3. ✅ **Keep manual hide control** (already correct)
4. ✅ **Keep MobileLoadingGate** (already correct)

### Changes Required:

#### Change 1: Fix Pre-Android 12 Theme
**File**: `android/app/src/main/res/values/styles.xml`

**Current**:
```xml
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
    <item name="android:background">@drawable/splash</item>
</style>
```

**Problem**: Missing `postSplashScreenTheme` and `windowSplashScreenBackground`

**Fix**: Use proper SplashScreen API
```xml
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">#7c3aed</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
    <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    <item name="android:windowBackground">@drawable/splash</item>
</style>
```

#### Change 2: Fix Android 12+ Theme (Add postSplashScreenTheme)
**File**: `android/app/src/main/res/values-v31/styles.xml`

**Add**:
```xml
<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
```

#### Change 3: Fix Capacitor Config (Auto-hide immediately)
**File**: `capacitor.config.ts`

**Current**:
```typescript
launchShowDuration: 0,
launchAutoHide: false,
```

**Fix**:
```typescript
launchShowDuration: 0,
launchAutoHide: true,  // Let theme splash be the only splash
```

**Why**: With `launchAutoHide: true` + `launchShowDuration: 0`, Capacitor will:
- NOT create its own splash overlay
- Immediately dismiss its splash layer (0ms)
- Let the Android theme splash be the ONLY splash visible
- Still allow manual control via `SplashScreen.hide()` in JavaScript

---

## D) CLEAN REBUILD CHECKLIST

To ensure old resources don't survive:

```bash
# 1. Sync Capacitor (copy web assets)
npx cap sync android

# 2. Clean Android build cache
cd android
./gradlew clean

# 3. Return to project root
cd ..

# 4. Uninstall app from device/emulator
adb uninstall com.coupons.app

# 5. Rebuild debug APK
cd android
./gradlew assembleDebug

# 6. Install and run
cd ..
npx cap run android
```

**OR** if using Android Studio:
1. Build → Clean Project
2. Uninstall app from device
3. Run → Run 'app'

---

## E) VERIFICATION

### What to Look For:

#### ✅ CORRECT Behavior (After Fix):
```
1. App launches
2. Purple gradient background appears IMMEDIATELY (no white)
3. Yellow logo shows centered (single splash, no flicker)
4. After 300ms, smooth transition to MobileLoadingGate
5. 3 dots animate at bottom
6. App content appears after ~1.5s
```

#### ❌ WRONG Behavior (Before Fix):
```
1. App launches
2. First splash appears (theme)
3. SECOND splash flickers/appears (Capacitor overlay)
4. Double splash effect / flicker
5. Then MobileLoadingGate
```

### Testing Checklist:
- [ ] Test on Android < 12 device (API 28-30)
- [ ] Test on Android 12+ device (API 31+)
- [ ] No white flash at launch
- [ ] No double splash / flicker
- [ ] Single smooth splash → loading gate → app
- [ ] Logo shows correctly (not scaled weird)
- [ ] Transition is smooth (no jarring changes)

---

## F) DELIVERABLES SUMMARY

### Root Cause:
**File**: `capacitor.config.ts`  
**Issue**: `launchAutoHide: false` causes Capacitor SplashScreen plugin to overlay its own splash on top of the Android theme splash, creating a double-splash effect.

### Exact Files to Change:

1. **capacitor.config.ts**
   - Line 14: Change `launchAutoHide: false` → `launchAutoHide: true`

2. **android/app/src/main/res/values/styles.xml**
   - Add `windowSplashScreenBackground`, `windowSplashScreenAnimatedIcon`, `postSplashScreenTheme`

3. **android/app/src/main/res/values-v31/styles.xml**
   - Add `postSplashScreenTheme`

### Exact Commands to Rebuild:

```bash
# Full clean rebuild
npx cap sync android
cd android && ./gradlew clean && ./gradlew assembleDebug && cd ..
adb uninstall com.coupons.app
npx cap run android
```

### How to Confirm Fix:

**Visual Test**: Launch the app and observe:
1. ✅ Only ONE splash appears (purple gradient + yellow logo)
2. ✅ No flicker, no double splash, no white flash
3. ✅ Smooth transition to loading gate after 300ms
4. ✅ Consistent behavior across Android versions

**Technical Test**:
```bash
# Enable developer console logs
npm run build:mobile
npx cap run android

# Watch console for:
"[SplashScreen] Native splash hidden - LoadingGate taking over"
# Should appear once at ~300ms, not multiple times
```

---

## G) TECHNICAL EXPLANATION

### Why This Happens:

**Capacitor SplashScreen Plugin** has two modes:

1. **Overlay Mode** (`launchAutoHide: false`):
   - Plugin creates its OWN splash screen overlay
   - Shows on top of the theme splash
   - Stays visible until manually hidden
   - ❌ Creates double-splash with theme splash

2. **Immediate Mode** (`launchAutoHide: true` + `launchShowDuration: 0`):
   - Plugin immediately dismisses its overlay (0ms)
   - Only the theme splash remains visible
   - Can still be manually hidden via `SplashScreen.hide()`
   - ✅ Single splash, no overlay

### Why Our Fix Works:

By setting `launchAutoHide: true` with `launchShowDuration: 0`:
- Capacitor splash overlay dismisses instantly (0ms)
- Android theme splash remains as the ONLY splash
- `useSplashScreen.ts` can still call `SplashScreen.hide()` at 300ms
- No double-splash, no overlay, no flicker

The `SplashScreen.hide()` call in JavaScript will hide the **theme splash** (not the Capacitor overlay, since that's already gone).

---

**Status**: 🔧 Ready to implement  
**Impact**: Eliminates double splash completely  
**Risk**: Low (backward compatible, theme splash already works)

