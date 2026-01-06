/**
 * Phone Number Validation & Normalization Utility
 *
 * Uses libphonenumber-js for country-based phone validation
 * Supports GCC countries + Egypt with proper E.164 formatting
 */

import {
  parsePhoneNumber,
  CountryCode,
  isValidPhoneNumber,
} from "libphonenumber-js";

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string; // International format: +201234567890
  national?: string; // National format: 010 1234 5678
  international?: string; // International format with spaces: +20 10 1234 5678
  error?: string; // Arabic error message
  errorType?:
    | "EMPTY"
    | "NO_COUNTRY"
    | "INVALID_FORMAT"
    | "TOO_SHORT"
    | "TOO_LONG"
    | "INVALID_COUNTRY";
}

/**
 * Parse and validate a phone number for a specific country
 *
 * @param inputPhone - The phone number entered by user (can include spaces, dashes, etc.)
 * @param countryIso2 - ISO-2 country code (e.g., 'SA', 'EG', 'AE')
 * @param dialCode - Optional dial code (e.g., '+966') for additional validation
 * @returns PhoneValidationResult with isValid flag, normalized formats, and error message
 */
export function parseAndValidatePhone(
  inputPhone: string,
  countryIso2: string,
  _dialCode?: string // Reserved for future validation enhancements
): PhoneValidationResult {
  // Check if country is selected
  if (!countryIso2) {
    return {
      isValid: false,
      error: "اختار الدولة الأول.",
      errorType: "NO_COUNTRY",
    };
  }

  // Check if phone is empty
  const trimmedPhone = inputPhone.trim();
  if (!trimmedPhone) {
    return {
      isValid: false,
      error: "اكتب رقم الموبايل.",
      errorType: "EMPTY",
    };
  }

  // Clean the input: remove spaces, dashes, parentheses
  const cleanedPhone = cleanPhoneInput(trimmedPhone);

  try {
    // Validate country code
    const upperCountry = countryIso2.toUpperCase() as CountryCode;
    if (!isValidCountryCode(upperCountry)) {
      return {
        isValid: false,
        error: "الدولة المختارة غير مدعومة.",
        errorType: "INVALID_COUNTRY",
      };
    }

    // Try to parse the phone number with the country
    const phoneNumber = parsePhoneNumber(cleanedPhone, upperCountry);

    // Check if the parsed number is valid
    if (!phoneNumber || !phoneNumber.isValid()) {
      // Try to get more specific error
      return getSpecificError(cleanedPhone, upperCountry);
    }

    // Additional check: ensure the country matches
    if (phoneNumber.country !== upperCountry) {
      return {
        isValid: false,
        error: "رقم الموبايل مش صحيح للدولة المختارة.",
        errorType: "INVALID_FORMAT",
      };
    }

    // Success! Return normalized formats
    return {
      isValid: true,
      e164: phoneNumber.number, // +201234567890
      national: phoneNumber.formatNational(), // 010 1234 5678
      international: phoneNumber.formatInternational(), // +20 10 1234 5678
    };
  } catch (error) {
    // Handle parsing errors
    console.error("Phone validation error:", error);
    return getSpecificError(
      cleanedPhone,
      countryIso2.toUpperCase() as CountryCode
    );
  }
}

/**
 * Clean phone input by removing non-digit characters (except leading +)
 */
function cleanPhoneInput(phone: string): string {
  // Preserve leading + if present
  const hasPlus = phone.trim().startsWith("+");

  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");

  // Re-add + if it was there
  if (hasPlus && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Check if country code is valid and supported
 */
function isValidCountryCode(code: string): boolean {
  const supportedCountries = ["SA", "AE", "EG", "KW", "QA", "BH", "OM"];
  return supportedCountries.includes(code.toUpperCase());
}

/**
 * Get specific error message based on phone number characteristics
 */
function getSpecificError(
  cleanedPhone: string,
  countryCode: CountryCode
): PhoneValidationResult {
  // Remove any leading + or 00
  const digitsOnly = cleanedPhone.replace(/^\+?00?/, "");

  // Get expected lengths for each country (national format without leading 0)
  const countryRules: Record<
    string,
    { min: number; max: number; nationalMin: number; nationalMax: number }
  > = {
    SA: { min: 9, max: 9, nationalMin: 10, nationalMax: 10 }, // 5XXXXXXXX or 05XXXXXXXX
    AE: { min: 9, max: 9, nationalMin: 10, nationalMax: 10 }, // 5XXXXXXXX or 05XXXXXXXX
    KW: { min: 8, max: 8, nationalMin: 8, nationalMax: 8 }, // 9XXXXXXX
    QA: { min: 8, max: 8, nationalMin: 8, nationalMax: 8 }, // 3XXXXXXX
    BH: { min: 8, max: 8, nationalMin: 8, nationalMax: 8 }, // 3XXXXXXX
    OM: { min: 8, max: 8, nationalMin: 8, nationalMax: 8 }, // 9XXXXXXX
    EG: { min: 10, max: 11, nationalMin: 10, nationalMax: 11 }, // 10XXXXXXXX or 010XXXXXXXX
  };

  const rules = countryRules[countryCode];

  if (!rules) {
    return {
      isValid: false,
      error: "رقم الموبايل مش صحيح للدولة المختارة.",
      errorType: "INVALID_FORMAT",
    };
  }

  const length = digitsOnly.length;

  // Check if too short
  if (length < rules.min) {
    return {
      isValid: false,
      error: "الرقم قصير جدًا.",
      errorType: "TOO_SHORT",
    };
  }

  // Check if too long
  if (length > rules.nationalMax) {
    return {
      isValid: false,
      error: "الرقم طويل جدًا.",
      errorType: "TOO_LONG",
    };
  }

  // Generic invalid format
  return {
    isValid: false,
    error: "رقم الموبايل مش صحيح للدولة المختارة.",
    errorType: "INVALID_FORMAT",
  };
}

/**
 * Validate phone on-the-fly (for onBlur events)
 * Returns just the error message or undefined if valid
 */
export function validatePhoneQuick(
  phone: string,
  countryIso2: string
): string | undefined {
  const result = parseAndValidatePhone(phone, countryIso2);
  return result.isValid ? undefined : result.error;
}

/**
 * Format phone number for display (if valid)
 * Returns formatted national or international format
 */
export function formatPhoneDisplay(phone: string, countryIso2: string): string {
  const result = parseAndValidatePhone(phone, countryIso2);
  return result.isValid && result.national ? result.national : phone;
}

/**
 * Get E.164 format for storage (if valid)
 * Returns E.164 or null
 */
export function getE164Format(
  phone: string,
  countryIso2: string
): string | null {
  const result = parseAndValidatePhone(phone, countryIso2);
  return result.isValid && result.e164 ? result.e164 : null;
}

/**
 * Check if a phone number is valid for a given country
 * Simple boolean check
 */
export function isPhoneValid(phone: string, countryIso2: string): boolean {
  if (!phone || !countryIso2) return false;

  try {
    const upperCountry = countryIso2.toUpperCase() as CountryCode;
    const cleaned = cleanPhoneInput(phone);
    return isValidPhoneNumber(cleaned, upperCountry);
  } catch {
    return false;
  }
}

/**
 * Normalize phone number from various formats to E.164
 * Handles: +966501234567, 00966501234567, 0501234567, 501234567
 */
export function normalizeToE164(
  phone: string,
  countryIso2: string
): string | null {
  return getE164Format(phone, countryIso2);
}
