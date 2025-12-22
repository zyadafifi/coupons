# 🚀 Quick Start Guide

## Get Your Mobile App Running in 5 Steps

### Step 1: Install Android Studio
Download and install [Android Studio](https://developer.android.com/studio)

### Step 2: Configure Firebase (5 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `saving-b35f3`
3. Go to Project Settings → Your apps
4. Click Android app (or add one with package: `com.coupons.app`)
5. Download `google-services.json`
6. Place it here: `android/app/google-services.json`

### Step 3: Generate App Icons (Optional but Recommended)
```bash
npm install -D @capacitor/assets
```

Create `resources/icon.png` (1024x1024) from your `public/icon-512.png`, then:
```bash
npx capacitor-assets generate --iconBackgroundColor '#7c3aed' --splashBackgroundColor '#7c3aed'
```

### Step 4: Build and Sync
```bash
npm run build:mobile
```

### Step 5: Open and Run
```bash
npm run open:android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Select a device/emulator from the dropdown
3. Click the green Run button ▶️

## 🎉 That's It!

Your app should now be running on your Android device/emulator.

## 🐛 Troubleshooting

**Build fails?**
```bash
cd android
./gradlew clean
cd ..
npm run build:mobile
```

**Can't find device?**
- Enable USB debugging on your phone
- Or create an emulator in Android Studio (Tools → Device Manager)

**Push notifications not working?**
- Make sure `google-services.json` is in place
- Check Firebase project configuration

## 📚 More Information

- Full documentation: `MOBILE_APP_README.md`
- Testing guide: `TESTING_GUIDE.md`
- Firebase setup: `FIREBASE_SETUP.md`
- iOS setup: `IOS_SETUP.md`

## 🆘 Need Help?

1. Check the documentation files
2. Review Android Studio Logcat for errors
3. Verify Firebase configuration

---

**Happy coding! 🎨📱**

