# App Icon and Splash Screen Generation Guide

## Overview
You need to generate app icons and splash screens for both Android and iOS platforms.

## Source Assets
Use the existing icons in the `public/` folder:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

## Option 1: Using Online Tools (Recommended)

### Android Icons
1. Go to [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
2. Upload `public/icon-512.png`
3. Configure:
   - Name: `ic_launcher`
   - Trim: No
   - Padding: 10%
   - Background: #7c3aed (purple theme color)
4. Download and extract to `android/app/src/main/res/`

### iOS Icons
1. Go to [App Icon Generator](https://appicon.co/)
2. Upload `public/icon-512.png`
3. Select "iOS" platform
4. Download and extract to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Option 2: Using Capacitor Assets Plugin

Install and use the Capacitor Assets plugin:

```bash
npm install -D @capacitor/assets
```

Create a `resources` folder in the project root:
```
resources/
  icon.png (1024x1024, recommended)
  splash.png (2732x2732, recommended)
```

Run the generator:
```bash
npx capacitor-assets generate --iconBackgroundColor '#7c3aed' --splashBackgroundColor '#7c3aed'
```

This will automatically generate all required icon and splash screen sizes for both platforms.

## Option 3: Manual Generation

### Android Icon Sizes
Place icons in `android/app/src/main/res/`:

- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

Round icons (same sizes):
- `mipmap-mdpi/ic_launcher_round.png`
- `mipmap-hdpi/ic_launcher_round.png`
- `mipmap-xhdpi/ic_launcher_round.png`
- `mipmap-xxhdpi/ic_launcher_round.png`
- `mipmap-xxxhdpi/ic_launcher_round.png`

### Android Splash Screens
Place splash screens in `android/app/src/main/res/`:

- `drawable/splash.png` (default)
- `drawable-land/splash.png` (landscape)
- `drawable-port/splash.png` (portrait)
- `drawable-hdpi/splash.png`
- `drawable-xhdpi/splash.png`
- `drawable-xxhdpi/splash.png`
- `drawable-xxxhdpi/splash.png`

Recommended splash screen sizes:
- Port: 1080x1920
- Land: 1920x1080

### iOS Icon Sizes
Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

- App Icon (20pt): 20x20, 40x40, 60x60
- App Icon (29pt): 29x29, 58x58, 87x87
- App Icon (40pt): 40x40, 80x80, 120x120
- App Icon (60pt): 120x120, 180x180
- App Store: 1024x1024

### iOS Splash Screens
Place in `ios/App/App/Assets.xcassets/Splash.imageset/`:

- splash.png (1x)
- splash@2x.png (2x)
- splash@3x.png (3x)

## Current Theme Colors
- Primary: #7c3aed (Purple)
- Background: #f9fafb (Light gray)

## Recommended Approach
Use **Option 2** (Capacitor Assets Plugin) for the easiest and most comprehensive solution.

## After Generation
1. Run `npm run build` to rebuild web assets
2. Run `npx cap sync` to sync assets to native projects
3. Open Android Studio or Xcode to verify icons appear correctly

