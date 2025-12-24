# Phone Number Validation - Testing Guide

## Overview

This document provides comprehensive testing instructions for the country-based phone number validation system implemented using `libphonenumber-js`.

## What Was Implemented

### 1. **Phone Validation Utility** (`src/security/phone.ts`)

- Country-based validation using ISO-2 codes (SA, EG, AE, KW, QA, BH, OM)
- E.164 format normalization (e.g., `+966501234567`)
- Arabic error messages
- Support for multiple input formats (national, international, with/without spaces)

### 2. **UI Integration** (`src/pages/Onboarding.tsx`)

- Real-time validation on blur
- Re-validation when country changes
- Submit button disabled when invalid
- Inline error display in Arabic
- E.164 storage in Firestore

### 3. **Data Model Updates**

- `FirestoreLead.phone` now stores E.164 format
- Type documentation updated

---

## Testing Instructions

### A. Web Testing (Development)

#### Prerequisites

```bash
npm install
npm run dev
```

#### Test Steps

1. **Navigate to Onboarding**

   - Open browser: `http://localhost:5173/#/onboarding` (or your dev URL)
   - You should see the phone input form

2. **Test Valid Phone Numbers**

   | Country         | Test Input      | Expected E.164  | Notes              |
   | --------------- | --------------- | --------------- | ------------------ |
   | 🇸🇦 Saudi Arabia | `501234567`     | `+966501234567` | National without 0 |
   | 🇸🇦 Saudi Arabia | `0501234567`    | `+966501234567` | National with 0    |
   | 🇸🇦 Saudi Arabia | `+966501234567` | `+966501234567` | International      |
   | 🇸🇦 Saudi Arabia | `050 123 4567`  | `+966501234567` | With spaces        |
   | 🇪🇬 Egypt        | `1012345678`    | `+201012345678` | National without 0 |
   | 🇪🇬 Egypt        | `01012345678`   | `+201012345678` | National with 0    |
   | 🇪🇬 Egypt        | `+201012345678` | `+201012345678` | International      |
   | 🇦🇪 UAE          | `501234567`     | `+971501234567` | National           |
   | 🇰🇼 Kuwait       | `91234567`      | `+96591234567`  | National           |
   | 🇶🇦 Qatar        | `31234567`      | `+97431234567`  | National           |
   | 🇧🇭 Bahrain      | `31234567`      | `+97331234567`  | National           |
   | 🇴🇲 Oman         | `91234567`      | `+96891234567`  | National           |

3. **Test Invalid Phone Numbers**

   | Country  | Test Input       | Expected Error                          | Error Type     |
   | -------- | ---------------- | --------------------------------------- | -------------- |
   | Any      | _(empty)_        | "اكتب رقم الموبايل."                    | Empty          |
   | 🇸🇦 Saudi | `12345`          | "الرقم قصير جدًا."                      | Too short      |
   | 🇸🇦 Saudi | `50123456789012` | "الرقم طويل جدًا."                      | Too long       |
   | 🇸🇦 Saudi | `401234567`      | "رقم الموبايل مش صحيح للدولة المختارة." | Invalid format |
   | 🇪🇬 Egypt | `0912345678`     | "رقم الموبايل مش صحيح للدولة المختارة." | Invalid prefix |

4. **Test Validation Triggers**

   - **On Blur**: Enter invalid phone → click outside input → error appears
   - **On Submit**: Try to submit with invalid phone → error appears, button disabled
   - **Country Change**: Enter valid SA number → switch to EG → error appears (number invalid for EG)

5. **Test Submit Flow**

   - Enter valid phone and name
   - Click "التالي ←"
   - Open browser DevTools → Network tab → Check Firestore request
   - Verify phone is stored in E.164 format

6. **Browser Console Testing**

   ```javascript
   // Open DevTools Console and run:

   // Import test utilities (if using dev build with source maps)
   import {
     runPhoneValidationTests,
     testPhone,
   } from "./src/security/phone.test.ts";

   // Run all automated tests
   runPhoneValidationTests();

   // Test individual phone numbers
   testPhone("501234567", "SA");
   testPhone("01012345678", "EG");
   testPhone("12345", "SA"); // Should fail
   ```

---

### B. Android APK Testing

#### Prerequisites

```bash
# Build for mobile (admin disabled)
npm run build:mobile:android

# Or build and open Android Studio
npm run build:mobile:android && npm run open:android
```

#### Test Steps

1. **Install APK on Device/Emulator**

   - Build APK in Android Studio (Build → Build Bundle(s) / APK(s) → Build APK(s))
   - Install on device: `adb install -r app-debug.apk`
   - Or drag-drop APK to emulator

2. **Launch App**

   - Open the app
   - Should show onboarding screen (if first launch)

3. **Test Phone Input on Mobile**

   - Tap phone input field → keyboard should show numeric layout
   - Test same scenarios as web (see table above)
   - Test with device's native keyboard suggestions
   - Test copy-paste from clipboard

4. **Test Mobile-Specific Behaviors**

   - **Haptic Feedback**: Should vibrate on country selection (if device supports)
   - **Keyboard Dismiss**: Tap outside → keyboard closes, validation triggers
   - **Orientation Change**: Rotate device → form state persists
   - **App Backgrounding**: Background app → return → form state persists

5. **Verify Firestore Storage**

   - Submit valid phone
   - Open Firebase Console → Firestore → `leads` collection
   - Verify phone is in E.164 format (e.g., `+966501234567`)

6. **Test Error Messages**
   - Verify Arabic text displays correctly (RTL)
   - Verify error messages are readable on small screens
   - Test with different system fonts/sizes

---

### C. Automated Testing (Browser Console)

#### Quick Test Script

Open browser DevTools console on the onboarding page:

```javascript
// Test all countries with valid numbers
const testCases = [
  { country: "SA", phone: "501234567", expected: "+966501234567" },
  { country: "EG", phone: "01012345678", expected: "+201012345678" },
  { country: "AE", phone: "501234567", expected: "+971501234567" },
  { country: "KW", phone: "91234567", expected: "+96591234567" },
  { country: "QA", phone: "31234567", expected: "+97431234567" },
  { country: "BH", phone: "31234567", expected: "+97331234567" },
  { country: "OM", phone: "91234567", expected: "+96891234567" },
];

testCases.forEach(({ country, phone, expected }) => {
  const result = parseAndValidatePhone(phone, country);
  console.log(
    result.isValid && result.e164 === expected
      ? `✅ ${country}: ${phone} → ${result.e164}`
      : `❌ ${country}: FAILED`
  );
});
```

---

## Expected Behavior Summary

### ✅ Valid Scenarios

- User enters phone in any format → validation passes
- Phone normalized to E.164 → stored in Firestore
- Submit button enabled
- No error messages shown

### ❌ Invalid Scenarios

- Empty phone → "اكتب رقم الموبايل."
- Too short → "الرقم قصير جدًا."
- Too long → "الرقم طويل جدًا."
- Invalid format → "رقم الموبايل مش صحيح للدولة المختارة."
- Submit button disabled
- Error shown in red below input

### 🔄 Dynamic Validation

- **On Blur**: Validates when user leaves input field
- **On Country Change**: Re-validates if phone already entered
- **On Submit**: Final validation before submission
- **Error Clearing**: Error clears when user starts typing

---

## Edge Cases Tested

1. **Leading Zeros**: `0501234567` → correctly parsed
2. **International Prefix**: `+966` or `00966` → correctly parsed
3. **Spaces/Dashes**: `050-123-4567` or `050 123 4567` → cleaned and parsed
4. **Country Mismatch**: SA number with EG country → rejected
5. **Empty Input**: Handled gracefully with specific error
6. **Very Long Numbers**: Rejected with "too long" error
7. **Very Short Numbers**: Rejected with "too short" error

---

## Firestore Data Verification

### Before (Old Format)

```json
{
  "phone": "501234567",
  "countryCode": "+966",
  "country": "SA"
}
```

### After (E.164 Format)

```json
{
  "phone": "+966501234567",
  "countryCode": "+966",
  "country": "SA"
}
```

---

## Troubleshooting

### Issue: Validation not working

- Check browser console for errors
- Verify `libphonenumber-js` is installed: `npm list libphonenumber-js`
- Clear cache and rebuild: `npm run build`

### Issue: Arabic text not displaying

- Check font support in browser/device
- Verify `dir="rtl"` is set on container
- Check CSS for `text-align: right`

### Issue: Submit button always disabled

- Check for console errors
- Verify no validation errors in state
- Check `errors.phone` and `errors.name` values

### Issue: E.164 not stored in Firestore

- Check `handleSubmit` function in Onboarding.tsx
- Verify `phoneValidation.e164` is being used
- Check Firestore security rules allow writes

---

## Files Changed

1. **New Files**

   - `src/security/phone.ts` - Phone validation utility
   - `src/security/phone.test.ts` - Test suite
   - `PHONE_VALIDATION_TESTING.md` - This document

2. **Modified Files**
   - `src/pages/Onboarding.tsx` - Integrated validation
   - `src/data/types.ts` - Updated FirestoreLead documentation
   - `package.json` - Added libphonenumber-js dependency

---

## Country Support

| Country      | ISO-2 | Dial Code | Mobile Format | Example       |
| ------------ | ----- | --------- | ------------- | ------------- |
| Saudi Arabia | SA    | +966      | 5XXXXXXXX     | +966501234567 |
| Egypt        | EG    | +20       | 10XXXXXXXX    | +201012345678 |
| UAE          | AE    | +971      | 5XXXXXXXX     | +971501234567 |
| Kuwait       | KW    | +965      | 9XXXXXXX      | +96591234567  |
| Qatar        | QA    | +974      | 3XXXXXXX      | +97431234567  |
| Bahrain      | BH    | +973      | 3XXXXXXX      | +97331234567  |
| Oman         | OM    | +968      | 9XXXXXXX      | +96891234567  |

---

## Next Steps (Future Enhancements)

- [ ] Add Firebase Phone Authentication (SMS OTP)
- [ ] Add phone number masking/formatting as user types
- [ ] Add country auto-detection from IP
- [ ] Add phone number verification via SMS
- [ ] Add analytics for validation errors
- [ ] Add A/B testing for error messages

---

## Support

For issues or questions:

1. Check browser console for errors
2. Review this testing guide
3. Check `src/security/phone.ts` for validation logic
4. Review Firebase Console for Firestore data

---

**Last Updated**: December 24, 2025
**Version**: 1.0.0
