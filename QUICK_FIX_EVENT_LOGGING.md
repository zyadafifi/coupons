# 🔧 Quick Fix: Event Logging Not Working

## Issue
Copied coupon code "A74E8" but it's not appearing in the statistics dashboard.

## Root Cause
**Firestore rules for `coupon_events` collection are not deployed yet.**

---

## ✅ Solution: Deploy Firestore Rules

### Step 1: Deploy Rules
```bash
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔ Deploy complete!
```

### Step 2: Verify in Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Check that this rule exists:

```javascript
// COUPON EVENTS (Usage Tracking)
match /coupon_events/{eventId} {
  allow create: if true
    && request.resource.data.couponId is string
    && request.resource.data.deviceId is string
    && request.resource.data.eventType is string
    && request.resource.data.eventType in ['copy', 'copy_and_shop', 'open_store', 'view']
    && request.resource.data.createdAt is timestamp;
  allow read, update, delete: if isAdmin();
}
```

### Step 3: Test Again
1. **Open browser console** (F12 → Console tab)
2. **Copy a coupon code** (e.g., "A74E8")
3. **Look for these messages:**
   - 🔵 "Logging coupon event: ..." 
   - ✅ "Coupon event logged successfully"

---

## 🐛 Troubleshooting

### If you see "PERMISSION DENIED" error:

**Symptom:**
```
❌ Failed to log coupon event: FirebaseError: Missing or insufficient permissions
🔒 PERMISSION DENIED: Firestore rules may not be deployed!
👉 Run: firebase deploy --only firestore:rules
```

**Solution:**
1. Run: `firebase deploy --only firestore:rules`
2. Wait for deployment to complete
3. Refresh the page and try again

---

### If you see "couponId is not a string" error:

**Check:**
1. The coupon exists in Firestore
2. The coupon ID is valid
3. You're copying from the coupon detail page

---

### If events are logging but not showing in dashboard:

**Check Date Range Filter:**
- Statistics page → Date filter should be "اليوم" (Today)
- Or change to "آخر 7 أيام" to see last 7 days

**Check Store Filter:**
- Make sure store filter is set to "كل المتاجر" (All Stores)
- Or select the specific store for the coupon

---

## 📊 Verify Events in Firestore

### Method 1: Firebase Console
1. Go to Firebase Console
2. **Firestore Database** → **Data**
3. Look for `coupon_events` collection
4. Check if documents exist

### Method 2: Browser Console
After copying a code, run this in browser console:
```javascript
// Check if deviceId exists
console.log('Device ID:', localStorage.getItem('app_device_id'));
```

---

## 🧪 Test Checklist

After deploying rules, test these scenarios:

### ✅ Test 1: Copy Code
1. Go to any coupon detail page
2. Click "نسخ الكود" (Copy Code)
3. Check browser console for success message
4. Go to Statistics page
5. Verify count increased

### ✅ Test 2: Copy & Shop
1. Go to any coupon detail page
2. Click "نسخ وتسوق الآن" (Copy & Shop Now)
3. Check browser console for TWO events logged
4. Go to Statistics page
5. Verify both counts increased

### ✅ Test 3: Filters
1. Go to Statistics page
2. Select a specific store
3. Copy a coupon from that store
4. Verify count increases in filtered view

---

## 🚀 Quick Deploy Commands

### Deploy Everything:
```bash
npm run build
firebase deploy
```

### Deploy Only Rules:
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Hosting:
```bash
npm run build
firebase deploy --only hosting
```

---

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Permission denied" | Deploy Firestore rules |
| Events not showing | Check date range filter |
| Console errors | Check network tab for failed requests |
| deviceId is null | localStorage might be blocked (private browsing) |
| Duplicate events | Normal - both copy and copy_and_shop log events |

---

## 🔍 Debug Mode

### Enable Detailed Logging:

The code now includes enhanced logging. Check browser console for:

**Success Messages:**
- 🔵 "Logging coupon event: ..."
- ✅ "Coupon event logged successfully"

**Error Messages:**
- ❌ "Failed to log coupon event: ..."
- 🔒 "PERMISSION DENIED: ..." (if rules not deployed)

---

## ✨ Expected Behavior After Fix

1. **Copy a coupon code**
2. **See console messages:**
   ```
   🔵 Logging coupon event: { couponId: "xxx", eventType: "copy", ... }
   ✅ Coupon event logged successfully
   ```
3. **Go to Statistics page**
4. **See:**
   - "استخدامات اليوم" count increased
   - Coupon appears in usage table at bottom

---

## 🎯 Quick Test

Run this sequence to verify everything works:

```bash
# 1. Deploy rules
firebase deploy --only firestore:rules

# 2. Open browser
# 3. Go to coupon detail page
# 4. Open console (F12)
# 5. Copy a code
# 6. Look for success message
# 7. Go to /admin/statistics
# 8. See the usage count
```

---

**Status:** Ready to fix after deploying rules
**Time to fix:** < 2 minutes
**Priority:** HIGH
