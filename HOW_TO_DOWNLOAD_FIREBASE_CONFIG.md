# How to Download google-services.json from Firebase Console

## ⚠️ IMPORTANT

A **template** `google-services.json` file has been created at `android/app/google-services.json`, but you **MUST** replace it with the actual file from Firebase Console for push notifications to work properly.

## Step-by-Step Instructions

### 1. Open Firebase Console

Go to: https://console.firebase.google.com/

### 2. Select Your Project

- Click on your project: **"saving-b35f3"**

### 3. Navigate to Project Settings

- Click the **gear icon** ⚙️ next to "Project Overview" at the top left
- Click **"Project settings"**

### 4. Go to Your Apps Section

- Scroll down to the **"Your apps"** section
- Look for an **Android app** with package name `com.coupons.app`

### 5a. If Android App Exists

- Click on the Android app icon
- Scroll down and click **"Download google-services.json"**
- Save the file

### 5b. If Android App Doesn't Exist (First Time)

1. Click **"Add app"** button
2. Select **Android** icon
3. Fill in the form:
   - **Android package name**: `com.coupons.app`
   - **App nickname**: كوبونات (or "Coupons")
   - **Debug signing certificate SHA-1**: Leave empty for now (can add later)
4. Click **"Register app"**
5. Click **"Download google-services.json"**
6. Click **"Next"** and **"Continue to console"**

### 6. Replace the Template File

1. Locate the downloaded `google-services.json` file (usually in your Downloads folder)
2. Copy it to your project
3. Replace the existing file at: `android/app/google-services.json`

### 7. Verify the File

Open `android/app/google-services.json` and verify:

- `project_id`: Should be "saving-b35f3"
- `project_number`: Should be "626636527932"
- `package_name`: Should be "com.coupons.app"
- `mobilesdk_app_id`: Should NOT contain "YOUR_ANDROID_APP_ID"

### 8. Sync the Project

```bash
npm run build:mobile
```

## 🔍 What This File Contains

The `google-services.json` file contains:

- Firebase project configuration
- Android app credentials
- OAuth client IDs
- API keys
- Cloud Messaging server key references

## 🚨 Security Note

**DO NOT commit this file to public repositories!**

The `.gitignore` file should already exclude it, but double-check:

```bash
# Check if it's ignored
git check-ignore android/app/google-services.json
```

If it's not ignored, add this to `.gitignore`:

```
android/app/google-services.json
```

## ✅ How to Verify It's Working

After replacing the file:

1. Build and run the app:

```bash
npm run build:mobile
npm run open:android
```

2. Check Android Studio Logcat for:

```
[Push] FCM Token: [token will appear here]
```

3. Test push notifications from Firebase Console:
   - Go to Firebase Console
   - Navigate to **Cloud Messaging**
   - Click **"Send test message"**
   - Enter the FCM token from logs
   - Send notification

## 🆘 Troubleshooting

### Error: "google-services.json is missing"

- Make sure the file is at `android/app/google-services.json`
- File name must be exactly `google-services.json`
- No extra spaces or capitalization

### Push Notifications Don't Work

- Verify you downloaded the real file from Firebase Console
- Check that package name is `com.coupons.app`
- Make sure the file contains valid JSON
- Check Logcat for Firebase errors

### "Default FirebaseApp failed to initialize"

- The google-services.json file is missing or invalid
- Re-download from Firebase Console
- Clean and rebuild: `cd android && ./gradlew clean`

## 📱 For iOS (Later)

You'll also need to download **GoogleService-Info.plist** for iOS:

1. Same steps as above, but select iOS app
2. Bundle ID should be: `com.coupons.app`
3. Download `GoogleService-Info.plist`
4. Place at: `ios/App/App/GoogleService-Info.plist`

## ✨ Next Steps

After downloading and placing the file:

1. ✅ Build the app: `npm run build:mobile`
2. ✅ Open Android Studio: `npm run open:android`
3. ✅ Run on device/emulator
4. ✅ Test push notifications
5. ✅ Continue with testing checklist in `TESTING_GUIDE.md`

---

**Need help?** Check the Firebase documentation: https://firebase.google.com/docs/android/setup
