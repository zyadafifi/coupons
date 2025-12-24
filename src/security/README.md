# Phone Validation Security Module

## Quick Reference

### Import

```typescript
import { parseAndValidatePhone } from "@/security/phone";
```

### Basic Usage

```typescript
const result = parseAndValidatePhone("0501234567", "SA");

if (result.isValid) {
  // Store in database
  const e164 = result.e164; // "+966501234567"
} else {
  // Show error to user
  const error = result.error; // "الرقم قصير جدًا."
}
```

### API Reference

#### `parseAndValidatePhone(inputPhone, countryIso2, dialCode?)`

Main validation function.

**Parameters:**

- `inputPhone` (string): Phone number in any format
- `countryIso2` (string): ISO-2 country code (SA, EG, AE, etc.)
- `dialCode` (string, optional): Dial code for future use

**Returns:** `PhoneValidationResult`

```typescript
{
  isValid: boolean;
  e164?: string;         // "+966501234567"
  national?: string;     // "050 123 4567"
  international?: string; // "+966 50 123 4567"
  error?: string;        // Arabic error message
  errorType?: 'EMPTY' | 'NO_COUNTRY' | 'INVALID_FORMAT' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_COUNTRY';
}
```

#### Helper Functions

```typescript
// Quick validation (returns error or undefined)
validatePhoneQuick(phone: string, countryIso2: string): string | undefined

// Format for display
formatPhoneDisplay(phone: string, countryIso2: string): string

// Get E.164 format
getE164Format(phone: string, countryIso2: string): string | null

// Simple boolean check
isPhoneValid(phone: string, countryIso2: string): boolean

// Normalize to E.164
normalizeToE164(phone: string, countryIso2: string): string | null
```

### Error Messages (Arabic)

| Error Type      | Message                               |
| --------------- | ------------------------------------- |
| NO_COUNTRY      | اختار الدولة الأول.                   |
| EMPTY           | اكتب رقم الموبايل.                    |
| INVALID_FORMAT  | رقم الموبايل مش صحيح للدولة المختارة. |
| TOO_SHORT       | الرقم قصير جدًا.                      |
| TOO_LONG        | الرقم طويل جدًا.                      |
| INVALID_COUNTRY | الدولة المختارة غير مدعومة.           |

### Supported Countries

| Code | Country      | Example       |
| ---- | ------------ | ------------- |
| SA   | Saudi Arabia | +966501234567 |
| EG   | Egypt        | +201012345678 |
| AE   | UAE          | +971501234567 |
| KW   | Kuwait       | +96591234567  |
| QA   | Qatar        | +97431234567  |
| BH   | Bahrain      | +97331234567  |
| OM   | Oman         | +96891234567  |

### Input Format Support

✅ National without 0: `501234567`
✅ National with 0: `0501234567`
✅ International +: `+966501234567`
✅ International 00: `00966501234567`
✅ With spaces: `050 123 4567`
✅ With dashes: `050-123-4567`
✅ With parentheses: `(050) 123-4567`

### Integration Example

```typescript
// In a form component
const [phone, setPhone] = useState("");
const [country, setCountry] = useState("SA");
const [error, setError] = useState("");

const handleBlur = () => {
  const result = parseAndValidatePhone(phone, country);
  if (!result.isValid) {
    setError(result.error || "");
  }
};

const handleSubmit = async () => {
  const result = parseAndValidatePhone(phone, country);

  if (!result.isValid) {
    setError(result.error || "");
    return;
  }

  // Store E.164 format
  await saveToDatabase({
    phone: result.e164, // "+966501234567"
    country: country,
  });
};
```

### Testing

```typescript
// Import test utilities
import { runPhoneValidationTests, testPhone } from "./phone.test";

// Run all tests
runPhoneValidationTests();

// Test single number
testPhone("0501234567", "SA");
```

### Notes

- Always store `e164` format in database
- Validate on blur and submit
- Re-validate when country changes
- Use `errorType` for analytics/tracking
- Use `error` for user display

### Dependencies

- `libphonenumber-js` - Phone number parsing and validation

### See Also

- `PHONE_VALIDATION_TESTING.md` - Full testing guide
- `PHONE_VALIDATION_SUMMARY.md` - Implementation overview
- `phone.test.ts` - Test suite
