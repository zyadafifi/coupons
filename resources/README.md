# Capacitor Assets - Splash Screen & Icons

This folder contains source assets for generating Capacitor app resources.

## Required Files

### 1. `splash.png` (Required for Splash Screen)
- **Size**: 2732x2732px (or at least 2048x2048px)
- **Format**: PNG with transparent background
- **Content**: Your app logo centered with padding
- **Background**: Transparent (splash background color is set in capacitor.config.ts)

### 2. `icon.png` (Optional - for App Icons)
- **Size**: 1024x1024px
- **Format**: PNG
- **Content**: Square app icon (will be automatically rounded on Android)

## How to Create splash.png

### Option 1: From Existing Logo (Recommended)

1. **Open** `src/assets/logo-original.png` in an image editor (Photoshop, GIMP, Figma, etc.)
2. **Create** a new canvas: 2732x2732px
3. **Fill** background with transparent
4. **Paste** your logo in the center
5. **Resize** logo to approximately 800-1200px (leave ~866px padding on all sides)
6. **Export** as `splash.png` to this folder

### Option 2: Use the Provided Script (Windows)

```powershell
# Coming soon: PowerShell script to auto-generate from logo
```

### Option 3: Use Online Tool

1. Go to: https://www.canva.com/ or https://www.figma.com/
2. Create 2732x2732px canvas
3. Add your logo centered
4. Export as PNG with transparency
5. Save as `resources/splash.png`

## Generate Assets

Once you have `splash.png` in this folder:

```bash
# Generate for Android only
npm run assets:android

# Generate for iOS only  
npm run assets:ios

# Generate for all platforms
npm run assets:generate
```

This will automatically create all required splash screen densities in:
- `android/app/src/main/res/drawable-*/splash.png`
- `ios/App/App/Assets.xcassets/Splash.imageset/` (if iOS folder exists)

## Splash Screen Configuration

Splash screen settings are in `capacitor.config.ts`:

```typescript
SplashScreen: {
  launchShowDuration: 2000,        // Show for 2 seconds
  launchAutoHide: true,            // Auto-hide after duration
  backgroundColor: '#7c3aed',      // Purple brand color
  androidSplashResourceName: 'splash',
  androidScaleType: 'CENTER_INSIDE', // Don't crop logo
  showSpinner: false,
  splashFullScreen: true,
  splashImmersive: true,
}
```

## Testing Splash Screen

After generating assets:

```bash
# 1. Build and sync
npm run build:mobile:android

# 2. Open in Android Studio
npm run open:android

# 3. Run on device/emulator
# The splash screen will show for 2 seconds on app launch
```

## Troubleshooting

### Logo appears too small
- Increase logo size in splash.png (less padding)
- Regenerate: `npm run assets:android`

### Logo appears cropped
- Ensure `androidScaleType: 'CENTER_INSIDE'` in capacitor.config.ts
- Ensure splash.png has adequate padding (at least 800px on all sides)

### Splash not updating
- Clean build: `cd android && ./gradlew clean`
- Regenerate: `npm run assets:android`
- Rebuild: `npm run build:mobile:android`

## File Structure After Generation

```
resources/
  ├── splash.png (source - 2732x2732)
  └── icon.png (optional - 1024x1024)

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

## Notes

- The splash background color (#7c3aed purple) is defined in capacitor.config.ts
- Your logo should have a transparent background to show the purple
- @capacitor/assets automatically handles all density variations
- No manual editing of Android resources needed!

For more info: https://capacitorjs.com/docs/guides/splash-screens-and-icons

