import { CountryCode } from "@/data/types";

/**
 * Maps country codes to currency codes
 */
const COUNTRY_TO_CURRENCY: Record<CountryCode, string> = {
  SA: "SAR", // Saudi Arabia
  AE: "AED", // UAE
  EG: "EGP", // Egypt
  KW: "KWD", // Kuwait
  OM: "OMR", // Oman
  BH: "BHD", // Bahrain
  QA: "QAR", // Qatar
};

/**
 * Currency symbols for display
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: "ر.س",
  AED: "د.إ",
  EGP: "ج.م",
  KWD: "د.ك",
  OMR: "ر.ع",
  BHD: "د.ب",
  QAR: "ر.ق",
  USD: "$",
  EUR: "€",
};

/**
 * Format currency amount based on country or currency code
 * @param amount - The amount to format
 * @param currency - Optional currency code (e.g., "SAR", "EGP")
 * @param countryCode - Optional country code (e.g., "SA", "EG")
 * @param locale - Optional locale (defaults to "ar-SA")
 * @returns Formatted currency string (e.g., "100 ر.س" or "100 SAR")
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  countryCode?: CountryCode | string,
  locale: string = "ar-SA"
): string {
  // Determine currency code
  let currencyCode: string;

  if (currency) {
    currencyCode = currency.toUpperCase();
  } else if (countryCode && countryCode in COUNTRY_TO_CURRENCY) {
    currencyCode = COUNTRY_TO_CURRENCY[countryCode as CountryCode];
  } else {
    // Fallback: use number with generic currency indicator
    return `${amount} ${currency || "ر.س"}`;
  }

  // Get currency symbol
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  // Format number with Arabic locale
  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const formattedNumber = formatter.format(amount);
    return `${formattedNumber} ${symbol}`;
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `${amount} ${symbol}`;
  }
}

/**
 * Get currency code from country code
 */
export function getCurrencyFromCountry(countryCode: CountryCode | string): string {
  if (countryCode in COUNTRY_TO_CURRENCY) {
    return COUNTRY_TO_CURRENCY[countryCode as CountryCode];
  }
  return "SAR"; // Default fallback
}

