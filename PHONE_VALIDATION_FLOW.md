# Phone Validation Flow Diagram

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS ONBOARDING PAGE                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Select Country                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  🇸🇦 Saudi Arabia (+966)                                │    │
│  │  🇪🇬 Egypt (+20)                                        │    │
│  │  🇦🇪 UAE (+971)                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│  Default: Saudi Arabia (SA)                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Enter Phone Number                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  [+966] [0501234567]                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│  User types: "0501234567"                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  VALIDATION TRIGGER 1: On Blur (User clicks outside)            │
│                                                                   │
│  parseAndValidatePhone("0501234567", "SA")                      │
│  ├─ Clean input: "0501234567" → "501234567"                    │
│  ├─ Parse with country: SA                                      │
│  ├─ Validate format: ✅ Valid                                   │
│  └─ Normalize: "+966501234567" (E.164)                         │
│                                                                   │
│  Result: ✅ Valid                                                │
│  ├─ e164: "+966501234567"                                       │
│  ├─ national: "050 123 4567"                                    │
│  ├─ international: "+966 50 123 4567"                           │
│  └─ error: undefined                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  UI UPDATE: No Error Shown                                       │
│  Submit Button: ✅ Enabled                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  OPTIONAL: User Changes Country to Egypt                         │
│                                                                   │
│  handleCountryChange("EG")                                       │
│  ├─ Update selected country: EG                                 │
│  └─ Re-validate existing phone: "0501234567"                    │
│                                                                   │
│  parseAndValidatePhone("0501234567", "EG")                      │
│  ├─ Clean input: "501234567"                                    │
│  ├─ Parse with country: EG                                      │
│  ├─ Validate format: ❌ Invalid (not EG format)                 │
│  └─ Error: "رقم الموبايل مش صحيح للدولة المختارة."            │
│                                                                   │
│  Result: ❌ Invalid                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  UI UPDATE: Error Shown                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  [+20] [0501234567]                                     │    │
│  │  ❌ رقم الموبايل مش صحيح للدولة المختارة.            │    │
│  └────────────────────────────────────────────────────────┘    │
│  Submit Button: 🚫 Disabled                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Corrects Phone to: "01012345678"                           │
│  onChange → Error clears                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  VALIDATION TRIGGER 2: On Blur Again                             │
│                                                                   │
│  parseAndValidatePhone("01012345678", "EG")                     │
│  ├─ Clean input: "01012345678" → "1012345678"                  │
│  ├─ Parse with country: EG                                      │
│  ├─ Validate format: ✅ Valid                                   │
│  └─ Normalize: "+201012345678" (E.164)                         │
│                                                                   │
│  Result: ✅ Valid                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  UI UPDATE: Error Cleared                                        │
│  Submit Button: ✅ Enabled                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: User Clicks Submit                                      │
│                                                                   │
│  VALIDATION TRIGGER 3: On Submit (Final Check)                   │
│                                                                   │
│  validate()                                                      │
│  ├─ Validate name: ✅ Valid                                     │
│  └─ Validate phone: parseAndValidatePhone("01012345678", "EG") │
│                     ✅ Valid                                     │
│                                                                   │
│  All validations passed ✅                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Normalize & Submit                                      │
│                                                                   │
│  const phoneValidation = parseAndValidatePhone(...)             │
│  const phoneToStore = phoneValidation.e164                      │
│  // "+201012345678"                                             │
│                                                                   │
│  await addLead({                                                 │
│    name: "أحمد",                                                │
│    phone: "+201012345678",  ← E.164 format                      │
│    countryCode: "+20",                                           │
│    country: "EG",                                                │
│    deviceId: "device_xyz123"                                     │
│  })                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Store in Firestore                                      │
│                                                                   │
│  Collection: leads                                               │
│  Document: {                                                     │
│    id: "abc123",                                                 │
│    name: "أحمد",                                                │
│    phone: "+201012345678",  ← E.164 stored                      │
│    countryCode: "+20",                                           │
│    country: "EG",                                                │
│    deviceId: "device_xyz123",                                    │
│    createdAt: Timestamp(...)                                     │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SUCCESS! 🎉                                                     │
│  ├─ Toast: "تم التسجيل بنجاح!"                                 │
│  ├─ Mark lead as submitted                                       │
│  └─ Navigate to home page                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Validation Logic Breakdown

### Input Cleaning Process

```
User Input: "050-123-4567"
     ↓
Remove spaces: "050-123-4567" → "050-123-4567"
     ↓
Remove dashes: "050-123-4567" → "0501234567"
     ↓
Remove non-digits: "0501234567" → "0501234567"
     ↓
Cleaned: "0501234567"
```

### Parsing Process

```
Cleaned Input: "0501234567"
Country: "SA"
     ↓
Parse with libphonenumber-js
     ↓
Detect format: National with leading 0
     ↓
Extract components:
  - Country Code: +966
  - National Number: 501234567
     ↓
Validate:
  - Length: ✅ 9 digits (correct for SA)
  - Prefix: ✅ 50 (valid mobile prefix)
  - Format: ✅ Matches SA mobile pattern
     ↓
Result: VALID ✅
```

### E.164 Normalization

```
Input: "0501234567"
Country: "SA" (+966)
     ↓
Remove leading 0: "501234567"
     ↓
Add country code: "+966" + "501234567"
     ↓
E.164: "+966501234567"
```

---

## 🎯 Error Handling Flow

### Invalid Phone (Too Short)

```
User Input: "12345"
Country: "SA"
     ↓
parseAndValidatePhone("12345", "SA")
     ↓
Clean: "12345"
     ↓
Parse: Attempt to parse with SA rules
     ↓
Check length: 5 digits (expected: 9)
     ↓
Result: ❌ TOO_SHORT
Error: "الرقم قصير جدًا."
     ↓
UI: Show error below input
Submit Button: 🚫 Disabled
```

### Invalid Phone (Wrong Format)

```
User Input: "401234567"
Country: "SA"
     ↓
parseAndValidatePhone("401234567", "SA")
     ↓
Clean: "401234567"
     ↓
Parse: Attempt to parse with SA rules
     ↓
Check prefix: "40" (not a valid SA mobile prefix)
     ↓
Result: ❌ INVALID_FORMAT
Error: "رقم الموبايل مش صحيح للدولة المختارة."
     ↓
UI: Show error below input
Submit Button: 🚫 Disabled
```

---

## 🔄 Country Change Re-validation

```
Initial State:
  Country: SA
  Phone: "0501234567"
  Status: ✅ Valid (+966501234567)
     ↓
User Changes Country to EG
     ↓
handleCountryChange("EG")
     ↓
Re-validate existing phone with new country:
parseAndValidatePhone("0501234567", "EG")
     ↓
Parse: Attempt with EG rules
     ↓
Check: "0501234567" doesn't match EG format
       (EG expects 10-11 digits, starting with 1)
     ↓
Result: ❌ INVALID_FORMAT
Error: "رقم الموبايل مش صحيح للدولة المختارة."
     ↓
UI: Show error
Submit Button: 🚫 Disabled
     ↓
User must enter valid EG number (e.g., "01012345678")
```

---

## 📊 State Management

```typescript
// Component State
const [formData, setFormData] = useState({
  name: '',
  phone: '',
});

const [errors, setErrors] = useState({
  name: '',
  phone: '',
});

const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(
  phoneCountries[0] // Default: Saudi Arabia
);

// Validation Flow
onChange → Clear error
onBlur → Validate → Set error if invalid
onCountryChange → Re-validate → Update error
onSubmit → Final validate → Block if invalid
```

---

## 🎨 UI State Transitions

### Normal State (No Error)
```
┌────────────────────────────────────────┐
│  [+966] [0501234567]                   │
│                                        │
│  Submit Button: ✅ Enabled (green)     │
└────────────────────────────────────────┘
```

### Error State (Invalid Phone)
```
┌────────────────────────────────────────┐
│  [+966] [12345]                        │
│  ❌ الرقم قصير جدًا.                  │
│                                        │
│  Submit Button: 🚫 Disabled (gray)     │
└────────────────────────────────────────┘
```

### Loading State (Submitting)
```
┌────────────────────────────────────────┐
│  [+966] [0501234567]                   │
│                                        │
│  Submit Button: ⏳ جاري التسجيل...     │
└────────────────────────────────────────┘
```

---

## 🔐 Security & Data Integrity

### Before Implementation
```json
// Stored in Firestore (inconsistent formats)
{ "phone": "0501234567" }
{ "phone": "501234567" }
{ "phone": "+966501234567" }
{ "phone": "050 123 4567" }
```

### After Implementation
```json
// Stored in Firestore (consistent E.164)
{ "phone": "+966501234567" }
{ "phone": "+966501234567" }
{ "phone": "+966501234567" }
{ "phone": "+966501234567" }
```

### Benefits
✅ **Consistency**: All phones in same format
✅ **Uniqueness**: Can be used as unique identifier
✅ **SMS Ready**: Direct use with Twilio/Firebase SMS
✅ **International**: Works globally
✅ **Validation**: Easy to validate and compare

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path (Valid Input)
```
1. Select country: SA
2. Enter phone: "0501234567"
3. Blur input → ✅ No error
4. Click submit → ✅ Success
5. Check Firestore → ✅ "+966501234567" stored
```

### Scenario 2: Invalid Input (Too Short)
```
1. Select country: SA
2. Enter phone: "12345"
3. Blur input → ❌ "الرقم قصير جدًا."
4. Submit button → 🚫 Disabled
5. User cannot submit
```

### Scenario 3: Country Change
```
1. Select country: SA
2. Enter phone: "0501234567" → ✅ Valid
3. Change country to: EG
4. Auto re-validate → ❌ "رقم الموبايل مش صحيح"
5. Enter new phone: "01012345678" → ✅ Valid
6. Submit → ✅ "+201012345678" stored
```

### Scenario 4: Various Formats
```
Input: "050 123 4567" → ✅ "+966501234567"
Input: "050-123-4567" → ✅ "+966501234567"
Input: "+966501234567" → ✅ "+966501234567"
Input: "00966501234567" → ✅ "+966501234567"
Input: "501234567" → ✅ "+966501234567"
```

---

## 📱 Mobile-Specific Flow

```
User opens app on Android
     ↓
Onboarding screen loads
     ↓
User taps phone input
     ↓
Numeric keyboard appears
     ↓
User types: "0501234567"
     ↓
User taps outside (or Next on keyboard)
     ↓
onBlur triggers validation
     ↓
Haptic feedback (vibration)
     ↓
If valid: No error, submit enabled
If invalid: Error shown, submit disabled
     ↓
User submits
     ↓
Data stored in Firestore
     ↓
Navigate to home screen
```

---

## 🎯 Key Takeaways

1. **Three Validation Points**: Blur, Country Change, Submit
2. **E.164 Storage**: Always store normalized format
3. **Arabic Errors**: User-friendly messages
4. **Submit Protection**: Button disabled when invalid
5. **Edge Cases**: Handles spaces, dashes, leading zeros
6. **Country-Specific**: Different rules per country
7. **No Breaking Changes**: Existing code untouched

---

**For complete testing instructions, see**: `PHONE_VALIDATION_TESTING.md`
**For implementation details, see**: `PHONE_VALIDATION_SUMMARY.md`
**For quick reference, see**: `src/security/README.md`

