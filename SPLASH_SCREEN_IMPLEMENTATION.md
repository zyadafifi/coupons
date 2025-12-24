# Splash Screen Implementation Guide

## ✅ Status: Ready for Asset Generation

The native splash screen infrastructure is complete. You just need to create the splash image and generate assets.

---

## 📦 What Was Implemented

### 1. **Capacitor Assets Generator**
- ✅ Installed `@capacitor/assets` (v3.x)
- ✅ Added npm scripts for asset generation
- ✅ Created `/resources` folder structure

### 2. **Splash Screen Configuration**
- ✅ Updated `capacitor.config.ts`:
  - Changed `androidScaleType` from `CENTER_CROP` to `CENTER_INSIDE` (prevents logo cropping)
  - Duration: 2000ms (2 seconds)
  - Background: `#7c3aed` (purple brand color)
  - Auto-hide enabled

### 3. **Splash Timing**
- ✅ Updated `src/hooks/useSplashScreen.ts`:
  - Increased delay from 500ms to 1500ms (smoother transition)
  - Added double-hide prevention
  - Removed console spam in production
  - Better error handling

### 4. **Documentation**
- ✅ Created `/resources/README.md` with detailed instructions
- ✅ Created `/resources/CREATE_SPLASH_HERE.txt` with quick guide

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Splash Image

You need to create `resources/splash.png`:
- **Size**: 2732 x 2732 pixels
- **Format**: PNG with transparent background
- **Content**: Your logo centered with ~866px padding on all sides

**Option A: Use Image Editor**
```
1. Open src/assets/logo-original.png in Photoshop/GIMP/Figma
2. Create new canvas: 2732x2732px (transparent background)
3. Center your logo (~800-1200px size)
4. Export as: resources/splash.png
```

**Option B: Online Tool**
```
1. Go to Canva.com or Figma.com
2. Create 2732x2732px canvas
3. Add your logo centered
4. Export as PNG with transparency
5. Save to resources/splash.png
```

### Step 2: Generate Assets

```bash
# Generate Android splash screens (all densities)
npm run assets:android

# This creates:
# - android/app/src/main/res/drawable/splash.png
# - android/app/src/main/res/drawable-land-*/splash.png
# - android/app/src/main/res/drawable-port-*/splash.png
```

### Step 3: Build & Test

```bash
# Build for mobile
npm run build:mobile:android

# Open Android Studio
npm run open:android

# Run on device/emulator
# Splash will show for 2 seconds on app launch
```

---

## 📋 Available Scripts

```json
{
  "assets:generate": "Generate assets for all platforms",
  "assets:android": "Generate Android splash screens only",
  "assets:ios": "Generate iOS splash screens only"
}
```

---

## 🎨 Splash Screen Configuration

### Current Settings (`capacitor.config.ts`)

```typescript
SplashScreen: {
  launchShowDuration: 2000,              // Show for 2 seconds
  launchAutoHide: true,                  // Auto-hide after duration
  backgroundColor: '#7c3aed',            // Purple brand color
  androidSplashResourceName: 'splash',   // Resource name
  androidScaleType: 'CENTER_INSIDE',     // Don't crop logo
  showSpinner: false,                    // No loading spinner
  splashFullScreen: true,                // Fullscreen mode
  splashImmersive: true,                 // Immersive mode (hide nav bars)
}
```

### Timing Logic (`useSplashScreen.ts`)

```typescript
// Splash shows for minimum 1500ms (manual hide)
// OR 2000ms max (auto-hide from config)
// Whichever comes first after app is ready
```

---

## 🧪 Testing Checklist

### Before Generating Assets
- [ ] Created `resources/splash.png` (2732x2732px)
- [ ] Logo has transparent background
- [ ] Logo is centered with adequate padding
- [ ] Logo size is ~800-1200px

### After Generating Assets
- [ ] Run: `npm run assets:android`
- [ ] Verify splash.png files created in `android/app/src/main/res/drawable-*/`
- [ ] Check file sizes (should be different for each density)

### Testing on Device
- [ ] Run: `npm run build:mobile:android`
- [ ] Open Android Studio: `npm run open:android`
- [ ] Build APK and install on device
- [ ] Launch app and verify:
  - Splash appears immediately
  - Purple background (#7c3aed)
  - Logo centered and not cropped
  - Splash disappears smoothly after ~1.5-2 seconds
  - No console errors

### Different Screen Sizes
- [ ] Test on phone (portrait)
- [ ] Test on tablet (portrait and landscape)
- [ ] Verify logo scales correctly (not stretched/cropped)

---

## 🔧 Troubleshooting

### Issue: Logo appears too small
**Solution**: Increase logo size in `resources/splash.png` (less padding), regenerate:
```bash
npm run assets:android
```

### Issue: Logo appears cropped
**Solution**: 
1. Ensure `androidScaleType: 'CENTER_INSIDE'` in capacitor.config.ts ✅ (already set)
2. Ensure splash.png has adequate padding (at least 800px on all sides)
3. Regenerate: `npm run assets:android`

### Issue: Splash not updating after changes
**Solution**:
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Regenerate assets
npm run assets:android

# Rebuild
npm run build:mobile:android
```

### Issue: Splash shows for too long/short
**Solution**: Adjust timing in `capacitor.config.ts`:
```typescript
launchShowDuration: 2000, // Change this (milliseconds)
```

Or in `src/hooks/useSplashScreen.ts`:
```typescript
const timer = setTimeout(hideSplash, 1500); // Change this
```

### Issue: Web admin shows splash (shouldn't)
**Solution**: Already handled! `useSplashScreen` checks:
```typescript
if (!Capacitor.isNativePlatform()) return; // Web skips splash logic
```

---

## 📂 File Structure

### Before Asset Generation
```
resources/
  ├── splash.png          ← YOU CREATE THIS (2732x2732)
  ├── CREATE_SPLASH_HERE.txt
  └── README.md
```

### After Asset Generation
```
android/app/src/main/res/
  ├── drawable/splash.png
  ├── drawable-land-hdpi/splash.png
  ├── drawable-land-mdpi/splash.png
  ├── drawable-land-xhdpi/splash.png
  ├── drawable-land-xxhdpi/splash.png
  ├── drawable-land-xxxhdpi/splash.png
  ├── drawable-port-hdpi/splash.png
  ├── drawable-port-mdpi/splash.png
  ├── drawable-port-xhdpi/splash.png
  ├── drawable-port-xxhdpi/splash.png
  └── drawable-port-xxxhdpi/splash.png
```

---

## 🎯 Design Guidelines

### Splash Image Requirements

```
┌─────────────────────────────────────────────┐
│                                             │
│              ~866px padding                 │
│                                             │
│                                             │
│              ┌──────────────┐               │
│              │              │               │
│              │     LOGO     │  800-1200px   │
│              │  (centered)  │               │
│              │              │               │
│              └──────────────┘               │
│                                             │
│                                             │
│              ~866px padding                 │
│                                             │
└─────────────────────────────────────────────┘
           2732 x 2732 total
        (transparent background)
```

### Colors
- **Background**: `#7c3aed` (purple) - defined in capacitor.config.ts
- **Logo**: Transparent background to show purple
- **Logo colors**: White/light colors recommended for contrast

### Safe Area
- Keep logo within center 1000x1000px for best results
- This ensures logo is visible on all screen sizes/orientations

---

## 🔄 Regenerating Assets

If you update your logo or splash image:

```bash
# 1. Update resources/splash.png
# 2. Regenerate assets
npm run assets:android

# 3. Sync to Android
npx cap sync android

# 4. Rebuild
npm run build:mobile:android
```

---

## 📖 Additional Resources

- [Capacitor Splash Screen Docs](https://capacitorjs.com/docs/apis/splash-screen)
- [Capacitor Assets CLI](https://github.com/ionic-team/capacitor-assets)
- [Android Splash Screen Guide](https://developer.android.com/develop/ui/views/launch/splash-screen)

---

## ✅ Checklist Summary

- [x] ✅ Installed @capacitor/assets
- [x] ✅ Created resources folder
- [x] ✅ Added npm scripts
- [x] ✅ Updated capacitor.config.ts (CENTER_INSIDE)
- [x] ✅ Improved splash timing
- [x] ✅ Removed console spam
- [x] ✅ Created documentation
- [ ] ⏳ Create resources/splash.png (YOUR ACTION)
- [ ] ⏳ Run npm run assets:android (YOUR ACTION)
- [ ] ⏳ Test on device (YOUR ACTION)

---

**Next Steps**: 
1. Create `resources/splash.png` following the guide
2. Run `npm run assets:android`
3. Test on Android device

**Implementation Date**: December 24, 2025
**Status**: ✅ Infrastructure Complete - Awaiting Splash Image

