# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for mobile Android/iOS apps)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📱 Mobile Development with Capacitor

This project includes a Capacitor mobile app for Android and iOS.

### ⚠️ IMPORTANT: Always Run Capacitor Commands from Project Root

**Never run `npx cap ...` commands from inside the `/android` or `/ios` folders!**

All Capacitor commands must be executed from the **project root directory**.

```bash
# ✅ CORRECT - From project root
npm run cap:sync:android
npm run cap:open:android

# ❌ WRONG - From /android folder
cd android
npx cap sync    # This will fail!
```

### 🏥 Health Check

Before running any Capacitor command, verify your environment:

```bash
npm run android:doctor
```

This checks:
- You're in the correct directory (project root)
- Capacitor config exists
- Android platform is installed
- Catches common mistakes automatically

### 🚀 Quick Start: Testing Without Rebuilding APK

The fastest way to test your app after making UI changes:

```bash
# 1. Open Android Studio (runs doctor check first)
npm run android:run

# 2. In Android Studio:
#    - Wait for Gradle sync to complete
#    - Click the green ▶ Run button
#    - Select your device/emulator

# 3. App launches with latest changes!
```

**Why this is fast:** You don't need to rebuild the entire APK just to test UI changes. Android Studio's incremental build is much faster.

### 📦 Common Capacitor Commands (Safe Wrappers)

```bash
# Sync web assets to Android (after building)
npm run cap:sync:android

# Open project in Android Studio
npm run cap:open:android

# Open Android Studio with helpful instructions
npm run android:run

# Build + sync in one command
npm run build:mobile:android

# Check environment health
npm run android:doctor
```

### 🔄 Full Build & Deploy Workflow

When you need to build a fresh APK (e.g., after native code changes):

```bash
# 1. Build web assets for mobile
npm run build:mobile

# 2. Open in Android Studio
npm run cap:open:android

# 3. In Android Studio:
#    Build → Generate Signed Bundle/APK
#    OR
#    Click ▶ Run for debug testing
```

### 🌐 Optional: Live Reload (Advanced)

For faster development, you can use live reload to see changes instantly without rebuilding:

**Step 1:** Start your development server
```bash
npm run dev
# Note the URL (e.g., http://localhost:5173)
```

**Step 2:** Update `capacitor.config.ts` temporarily:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:5173',  // e.g., http://192.168.1.100:5173
  cleartext: true
}
```

**Step 3:** Sync and run:
```bash
npm run cap:sync:android
npm run android:run
```

**Step 4:** Make changes in your code - they'll appear instantly in the app!

**⚠️ Remember:** Remove the `server.url` before building for production!

### 🛠️ Troubleshooting

**Error: "android platform has not been added yet"**
```bash
# Add Android platform first
npx cap add android
```

**App not updating with latest changes?**
```bash
# Clean and rebuild
npm run build:mobile
cd android
./gradlew clean
cd ..
npm run android:run
```

**Running from wrong directory?**
```bash
# Check your environment
npm run android:doctor

# If you're in /android, go back to root:
cd ..
```

### 📚 More Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Capacitor CLI Reference](https://capacitorjs.com/docs/cli)
