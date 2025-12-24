# Android Back Button Implementation

## Overview

Implemented native Android back button handling for the Capacitor mobile app with custom exit behavior.

## Files Changed

### 1. New File: `src/components/mobile/AndroidBackButtonHandler.tsx`

**Purpose**: Handles Android hardware back button behavior

- **Native-only**: Only runs on `Capacitor.isNativePlatform()`, doesn't affect web builds
- **Smart navigation**:
  - If NOT on home route (`/`), navigates to home
  - If on home route, shows exit confirmation dialog
  - If dialog is open and back pressed again, closes dialog (doesn't exit)
- **Arabic UI**: Exit dialog in Arabic with proper RTL layout

### 2. Modified: `src/App.tsx`

**Changes**:

- Added import for `AndroidBackButtonHandler`
- Mounted component inside `<HashRouter>` after `<PushNotificationHandler />` and before `<OnboardingGuard>`

## Implementation Details

### Back Button Behavior Flow

```
User presses Android back button
    ↓
Is dialog open?
    YES → Close dialog, stay in app
    NO  → Continue
    ↓
Is current route home ("/") ?
    YES → Show exit confirmation dialog
    NO  → Navigate to home ("/")
    ↓
User taps "Yes" in dialog?
    YES → Exit app (CapApp.exitApp())
    NO  → Close dialog, stay in app
```

### Key Features

1. **Platform-specific**:

   - Only active on native Android/iOS platforms
   - Web builds completely unaffected
   - Uses `Capacitor.isNativePlatform()` check

2. **Proper listener management**:

   - Single listener registered per component lifecycle
   - Properly cleaned up on unmount
   - No memory leaks

3. **React Router integration**:

   - Uses `useLocation()` to detect current route
   - Uses `useNavigate()` for programmatic navigation
   - Uses `replace: true` to prevent back stack buildup

4. **Dialog state management**:
   - State tracked in React (`useState`)
   - Dialog closes on back press if open
   - Prevents accidental exits

## UI Components Used

- `AlertDialog` - Exit confirmation dialog
- `AlertDialogContent` - Dialog container
- `AlertDialogHeader` - Dialog header section
- `AlertDialogTitle` - "هل تريد الخروج من التطبيق؟"
- `AlertDialogDescription` - "هل أنت متأكد أنك تريد إغلاق التطبيق؟"
- `AlertDialogFooter` - Button container with RTL layout
- `AlertDialogCancel` - "لا" (No) button
- `AlertDialogAction` - "نعم" (Yes) button

## Testing Steps

### Build and Deploy

```bash
# Build mobile app
npm run build:mobile

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Test Scenarios

**Scenario 1: Navigate from non-home to home**

1. Open app (lands on home)
2. Navigate to Favorites or Coupon Detail
3. Press Android back button
4. ✅ Should navigate back to home

**Scenario 2: Exit confirmation from home**

1. Ensure you're on home route
2. Press Android back button
3. ✅ Exit dialog should appear in Arabic

**Scenario 3: Cancel exit**

1. From home, press back → dialog appears
2. Tap "لا" (No) button
3. ✅ Dialog closes, app stays open

**Scenario 4: Confirm exit**

1. From home, press back → dialog appears
2. Tap "نعم" (Yes) button
3. ✅ App exits

**Scenario 5: Back button closes dialog**

1. From home, press back → dialog appears
2. Press back button again (don't tap buttons)
3. ✅ Dialog closes, app stays open

**Scenario 6: Navigation chain**

1. Home → Favorites → press back → returns to home
2. Home → press back → dialog appears
3. Tap No → stays in app
4. Navigate to Notifications → press back → returns to home
5. Press back → dialog appears again

**Scenario 7: Onboarding handling**

1. Clear app data to trigger onboarding
2. On onboarding screen, press back
3. ✅ Should navigate to home (or handle as per your preference)

### Web Build Testing

```bash
# Build web admin
npm run build:web

# Test in browser
npm run dev
```

1. Open in browser
2. Navigate through pages
3. ✅ Browser back button works normally
4. ✅ No exit dialogs appear (web only)

## Build Verification

Both builds tested and pass:

### Mobile Build

```bash
npm run build:mobile
```

- ✅ Build successful
- ✅ Capacitor sync completed
- ✅ All plugins detected
- ✅ Bundle size: ~1.47 MB (precache)

### Web Build

```bash
npm run build:web
```

- ✅ Build successful
- ✅ Admin routes included
- ✅ No errors or warnings
- ✅ Bundle size: ~1.68 MB (precache)

## Technical Notes

### Capacitor App Plugin

```typescript
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
```

- `CapApp.addListener('backButton', handler)` - Registers back button listener
- `CapApp.exitApp()` - Exits the application
- `Capacitor.isNativePlatform()` - Detects if running on native platform

### React Router Considerations

- Using `HashRouter` (not `BrowserRouter`)
- Routes use `pathname` property
- Home route is exactly `"/"` or `""`
- Navigation uses `replace: true` to prevent back stack issues

### State Management

- Dialog state: `useState<boolean>`
- No global state required
- Self-contained component

## Safety Features

1. **Web compatibility**: Component returns `null` on web platforms
2. **Cleanup**: Listener removed on component unmount
3. **Dialog safety**: Back button closes dialog instead of exiting
4. **No admin interference**: Works independently of admin routes
5. **Build safety**: Both web and mobile builds tested and pass

## Known Behaviors

- **Onboarding route**: Currently treated as non-home, so back button navigates to home first
- **Dialog text**: In Arabic (RTL) as per app language
- **Exit method**: Uses Capacitor's `App.exitApp()` (standard Android exit)

## Future Enhancements (Optional)

- Add haptic feedback on back button press
- Add toast notification when navigating to home
- Customize dialog appearance/animation
- Add analytics tracking for exit attempts
- Handle iOS-specific back gestures differently

## Dependencies

No new dependencies added. Uses existing packages:

- `@capacitor/app` (already installed)
- `@capacitor/core` (already installed)
- `react-router-dom` (already installed)
- Existing shadcn UI components

## Rollback Instructions

If needed, to remove this feature:

1. Remove the component:

   ```bash
   rm src/components/mobile/AndroidBackButtonHandler.tsx
   ```

2. Remove from `src/App.tsx`:

   - Delete import line
   - Delete `<AndroidBackButtonHandler />` component usage

3. Rebuild:
   ```bash
   npm run build:mobile
   npx cap sync android
   ```
