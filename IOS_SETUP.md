# iOS Setup Guide (Windows Users)

## Overview
Since you're on Windows, you cannot directly build iOS apps locally. Here are your options:

## Option 1: Cloud Build Services (Recommended for Windows)

### Ionic Appflow
1. Sign up at [Ionic Appflow](https://ionic.io/appflow)
2. Connect your Git repository
3. Configure iOS build settings
4. Upload certificates and provisioning profiles
5. Trigger cloud builds

### Codemagic
1. Sign up at [Codemagic](https://codemagic.io/)
2. Connect your repository
3. Configure iOS workflow
4. Add Apple Developer credentials
5. Build in the cloud

### App Center (Microsoft)
1. Sign up at [App Center](https://appcenter.ms/)
2. Create new iOS app
3. Connect repository
4. Configure build settings
5. Build and distribute

## Option 2: Use a Mac (Local or Remote)

### Local Mac
If you have access to a Mac:
1. Clone the repository
2. Run `npx cap add ios`
3. Open Xcode: `npx cap open ios`
4. Configure signing and capabilities
5. Build and test

### Remote Mac (MacStadium, MacinCloud)
1. Rent a Mac in the cloud
2. Access via remote desktop
3. Follow local Mac steps

## Option 3: Focus on Android First

Since you're on Windows, you can:
1. Complete Android development and testing
2. Deploy Android app to Google Play Store
3. Later add iOS when you have Mac access

## iOS Configuration Files Needed

When you do set up iOS, you'll need to configure:

### Info.plist
Location: `ios/App/App/Info.plist`

Add these keys:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for scanning QR codes</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access for nearby deals</string>

<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>coupons</string>
            <string>com.coupons.app</string>
        </array>
    </dict>
</array>
```

### Capabilities
Enable in Xcode:
- Push Notifications
- Background Modes (Remote notifications)
- Associated Domains (for deep linking)

### Firebase Configuration
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add to `ios/App/App/` directory
3. Ensure it's included in Xcode project

## Apple Developer Account Requirements

To publish to App Store, you need:
1. Apple Developer Account ($99/year)
2. App ID: `com.coupons.app`
3. Provisioning Profiles (Development & Distribution)
4. Push Notification Certificate or APNs Auth Key
5. App Store Connect setup

## Recommended Workflow for Windows Users

1. **Phase 1: Android Development (Current)**
   - Develop and test on Android
   - Use Android emulator or physical device
   - Deploy to Google Play Store

2. **Phase 2: iOS via Cloud Build**
   - Set up cloud build service
   - Configure iOS settings remotely
   - Test using TestFlight
   - Deploy to App Store

3. **Phase 3: Maintenance**
   - Make code changes on Windows
   - Build Android locally
   - Build iOS via cloud service

## Testing iOS Without Mac

- Use cloud services' device testing features
- Use TestFlight for beta testing
- Request feedback from iOS users

## Cost Considerations

- **Apple Developer Account**: $99/year
- **Cloud Build Services**: 
  - Ionic Appflow: Starting at $29/month
  - Codemagic: Free tier available, paid plans from $49/month
  - App Center: Free tier available
- **Remote Mac**: Starting at $50/month

## Current Status

Your project is now configured for iOS, but you'll need:
1. A Mac or cloud build service to run `npx cap add ios`
2. Apple Developer account for signing
3. Firebase iOS configuration files

## Next Steps

1. Focus on Android development and testing first
2. Choose a cloud build service for iOS
3. Set up Apple Developer account
4. Configure iOS build pipeline
5. Test and deploy iOS app

## Alternative: Expo (Future Consideration)

If iOS development on Windows becomes too challenging, consider migrating to Expo in the future, which offers:
- Expo Go for testing on iOS without Mac
- EAS Build for cloud builds
- Better cross-platform development experience

However, this would require significant code refactoring.

