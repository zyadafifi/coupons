# Firebase Native Configuration Setup

## Overview
To enable Firebase services (Push Notifications, Firestore, Auth) on native Android and iOS platforms, you need to download configuration files from the Firebase Console.

## Android Setup

### 1. Download google-services.json
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `saving-b35f3`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the Android app (or add one if it doesn't exist)
   - Package name: `com.coupons.app`
6. Download `google-services.json`
7. Place it at: `android/app/google-services.json`

### 2. Configure Android Build
The `android/app/build.gradle` file will be automatically configured when you run `npx cap add android`.

You'll need to ensure these lines are present:
```gradle
apply plugin: 'com.google.gms.google-services'
```

And in the project-level `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

## iOS Setup

### 1. Download GoogleService-Info.plist
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `saving-b35f3`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the iOS app (or add one if it doesn't exist)
   - Bundle ID: `com.coupons.app`
6. Download `GoogleService-Info.plist`
7. Place it at: `ios/App/App/GoogleService-Info.plist`

### 2. Configure iOS Capabilities
In Xcode, you need to enable:
- Push Notifications
- Background Modes (Remote notifications)

## Firebase Cloud Messaging (FCM) Setup

### Android
1. Ensure you have the SHA-1 and SHA-256 fingerprints added to your Firebase Android app
2. Generate them using:
   ```bash
   cd android
   ./gradlew signingReport
   ```

### iOS
1. Upload your APNs Authentication Key or APNs Certificate to Firebase Console
2. Go to Project Settings > Cloud Messaging > iOS app configuration
3. Upload your .p8 key file (recommended) or .p12 certificate

## Current Firebase Configuration

**Project ID:** saving-b35f3
**API Key:** AIzaSyAmJl2sK5HG-aIc6T8M6xdqV991mAeQ7n4
**App ID (Web):** 1:626636527932:web:4f387aba70b7e8753fa639
**Messaging Sender ID:** 626636527932

## Next Steps

After placing the configuration files:
1. Run `npm run build` to build the web assets
2. Run `npx cap sync` to sync the files to native projects
3. Open Android Studio: `npx cap open android`
4. Open Xcode: `npx cap open ios` (macOS only)
5. Build and test on devices

## Troubleshooting

- If push notifications don't work, verify the configuration files are in the correct location
- Check that the package name/bundle ID matches exactly
- Ensure Firebase project has the correct APNs keys (iOS) or SHA fingerprints (Android)

