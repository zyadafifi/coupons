# Coupons Mobile App - Capacitor Implementation

## 🎉 Overview

This is a native mobile application built with React, Vite, and Capacitor. The app provides a platform for browsing and using discount coupons from various stores, with support for Arabic (RTL) language and multiple countries.

## ✨ Features

- 📱 Native Android and iOS support
- 🌍 Multi-country support (Saudi Arabia, UAE, Egypt, etc.)
- 🏷️ Coupon browsing with categories and search
- ⭐ Favorites system
- 🔔 Push notifications (FCM/APNs)
- 🔗 Deep linking support
- 🎨 RTL (Right-to-Left) layout for Arabic
- 📊 Admin panel for managing coupons
- 🔥 Firebase integration (Firestore, Auth)
- 💾 Offline support with caching

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Mobile Framework**: Capacitor 8
- **UI Components**: Radix UI + Tailwind CSS
- **Routing**: React Router (HashRouter)
- **State Management**: React Context + TanStack Query
- **Backend**: Firebase (Firestore, Auth) + Supabase
- **Push Notifications**: Firebase Cloud Messaging

## 📋 Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Firebase account
- Supabase account (optional)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd my-fav-coupons-main
npm install
```

### 2. Configure Firebase

Follow the instructions in `FIREBASE_SETUP.md` to:
- Download `google-services.json` (Android)
- Download `GoogleService-Info.plist` (iOS)
- Place them in the correct directories

### 3. Build Web Assets

```bash
npm run build
```

### 4. Sync to Native Projects

```bash
npm run sync
```

Or for specific platforms:
```bash
npm run sync:android
npm run sync:ios
```

## 📱 Development

### Running on Android

1. Open Android Studio:
```bash
npm run open:android
```

2. Select your device/emulator and click Run

Or use CLI:
```bash
npm run run:android
```

### Running on iOS (macOS only)

1. Open Xcode:
```bash
npm run open:ios
```

2. Select your device/simulator and click Run

Or use CLI:
```bash
npm run run:ios
```

### Live Reload (Development)

For faster development, you can use live reload:

1. Start Vite dev server:
```bash
npm run dev
```

2. Update `capacitor.config.ts` to point to your dev server:
```typescript
server: {
  url: 'http://192.168.1.100:8080', // Your local IP
  cleartext: true
}
```

3. Sync and run the app

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build web assets for production |
| `npm run build:mobile` | Build and sync to native projects |
| `npm run sync` | Sync web assets to all platforms |
| `npm run sync:android` | Sync to Android only |
| `npm run sync:ios` | Sync to iOS only |
| `npm run open:android` | Open Android Studio |
| `npm run open:ios` | Open Xcode |
| `npm run run:android` | Build and run on Android |
| `npm run run:ios` | Build and run on iOS |

## 🎨 Generating App Icons

Follow the guide in `ICON_GENERATION.md` to generate app icons and splash screens for both platforms.

**Quick method:**
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#7c3aed' --splashBackgroundColor '#7c3aed'
```

## 🧪 Testing

Refer to `TESTING_GUIDE.md` for comprehensive testing instructions.

**Quick test:**
1. Build the app: `npm run build:mobile`
2. Open Android Studio: `npm run open:android`
3. Run on device/emulator
4. Follow the testing checklist in `TESTING_GUIDE.md`

## 🍎 iOS Development on Windows

Since you're on Windows, you cannot build iOS apps directly. See `IOS_SETUP.md` for options:
- Use cloud build services (Ionic Appflow, Codemagic)
- Use a remote Mac service
- Focus on Android first

## 🔔 Push Notifications Setup

### Android
1. Place `google-services.json` in `android/app/`
2. Ensure Firebase project has correct SHA fingerprints
3. Test via Firebase Console

### iOS
1. Place `GoogleService-Info.plist` in `ios/App/App/`
2. Upload APNs key to Firebase Console
3. Enable Push Notifications capability in Xcode

## 🔗 Deep Linking

The app supports deep linking:
- `coupons://` - Opens home screen
- `coupons://coupon/:id` - Opens specific coupon
- `https://coupons.app/*` - Web URLs

**Test on Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "coupons://coupon/123" com.coupons.app
```

## 📁 Project Structure

```
my-fav-coupons-main/
├── android/                 # Android native project
├── ios/                     # iOS native project (when added)
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks (including mobile hooks)
│   ├── pages/              # Page components
│   ├── integrations/       # Firebase, Supabase
│   └── App.tsx             # Main app component
├── public/                 # Static assets
├── capacitor.config.ts     # Capacitor configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration Files

- `capacitor.config.ts` - Capacitor and plugin configuration
- `vite.config.ts` - Build configuration
- `android/app/build.gradle` - Android build configuration
- `android/app/src/main/AndroidManifest.xml` - Android manifest
- `ios/App/App/Info.plist` - iOS configuration (when iOS is added)

## 🐛 Troubleshooting

### App won't build
- Clean build: `cd android && ./gradlew clean`
- Invalidate caches in Android Studio
- Delete `node_modules` and reinstall

### Push notifications not working
- Verify Firebase configuration files are in place
- Check FCM token is being registered (check logs)
- Verify Firebase project settings

### Deep links not working
- Check AndroidManifest.xml has correct intent filters
- Test with `adb shell am start` command
- Verify URL scheme matches

### Keyboard issues
- Check Keyboard plugin is installed
- Verify `capacitor.config.ts` keyboard settings
- Test on different Android versions

## 📚 Documentation

- `FIREBASE_SETUP.md` - Firebase configuration guide
- `ICON_GENERATION.md` - App icon generation guide
- `IOS_SETUP.md` - iOS setup for Windows users
- `TESTING_GUIDE.md` - Comprehensive testing guide

## 🚀 Deployment

### Android (Google Play Store)

1. Generate signing key:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`

3. Build release APK/AAB:
```bash
cd android
./gradlew bundleRelease
```

4. Upload to Google Play Console

### iOS (App Store)

1. Configure signing in Xcode
2. Archive the app
3. Upload to App Store Connect
4. Submit for review

## 🔐 Environment Variables

Create `.env` file for sensitive data:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

Firebase configuration is in `src/firebase.ts` (consider moving to env vars for production).

## 📊 Performance Optimization

- Code splitting is configured in `vite.config.ts`
- Images use progressive loading
- PWA caching for offline support
- Lazy loading for routes (can be improved)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test on both platforms
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions:
- Check documentation files
- Review Firebase Console logs
- Check Android Studio Logcat
- Review Capacitor documentation

## 🎯 Next Steps

1. ✅ Complete Firebase setup (`FIREBASE_SETUP.md`)
2. ✅ Generate app icons (`ICON_GENERATION.md`)
3. ✅ Test the app (`TESTING_GUIDE.md`)
4. 🔄 Set up iOS (if needed, see `IOS_SETUP.md`)
5. 🚀 Deploy to app stores

## 📱 Current Status

- ✅ Capacitor configured
- ✅ Android platform added
- ✅ Push notifications configured
- ✅ Deep linking configured
- ✅ Mobile UI optimizations added
- ✅ Build scripts configured
- ⏳ Firebase native configuration needed
- ⏳ App icons need to be generated
- ⏳ iOS platform needs to be added (requires Mac)

---

**Built with ❤️ using React, Capacitor, and Firebase**

