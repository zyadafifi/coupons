/**
 * Phone Validation Test Suite
 * 
 * Manual testing helper for phone number validation
 * Run in browser console or use for reference
 */

import { parseAndValidatePhone } from './phone';

// Test cases for different countries
export const phoneTestCases = {
  // Saudi Arabia (SA)
  SA: {
    valid: [
      { input: '501234567', expected: '+966501234567', description: 'National format without 0' },
      { input: '0501234567', expected: '+966501234567', description: 'National format with 0' },
      { input: '+966501234567', expected: '+966501234567', description: 'International with +' },
      { input: '00966501234567', expected: '+966501234567', description: 'International with 00' },
      { input: '50 123 4567', expected: '+966501234567', description: 'With spaces' },
      { input: '050-123-4567', expected: '+966501234567', description: 'With dashes' },
      { input: '551234567', expected: '+966551234567', description: 'Different mobile prefix' },
    ],
    invalid: [
      { input: '12345', error: 'TOO_SHORT', description: 'Too short' },
      { input: '50123456789012', error: 'TOO_LONG', description: 'Too long' },
      { input: '401234567', error: 'INVALID_FORMAT', description: 'Invalid prefix (4x not mobile)' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // Egypt (EG)
  EG: {
    valid: [
      { input: '1012345678', expected: '+201012345678', description: 'National format without 0' },
      { input: '01012345678', expected: '+201012345678', description: 'National format with 0' },
      { input: '+201012345678', expected: '+201012345678', description: 'International with +' },
      { input: '00201012345678', expected: '+201012345678', description: 'International with 00' },
      { input: '010 1234 5678', expected: '+201012345678', description: 'With spaces' },
      { input: '1112345678', expected: '+201112345678', description: 'Vodafone prefix' },
      { input: '1212345678', expected: '+201212345678', description: 'Orange prefix' },
      { input: '1512345678', expected: '+201512345678', description: 'Etisalat prefix' },
    ],
    invalid: [
      { input: '12345', error: 'TOO_SHORT', description: 'Too short' },
      { input: '010123456789012', error: 'TOO_LONG', description: 'Too long' },
      { input: '0912345678', error: 'INVALID_FORMAT', description: 'Invalid prefix (09 not mobile)' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // UAE (AE)
  AE: {
    valid: [
      { input: '501234567', expected: '+971501234567', description: 'National format without 0' },
      { input: '0501234567', expected: '+971501234567', description: 'National format with 0' },
      { input: '+971501234567', expected: '+971501234567', description: 'International with +' },
      { input: '00971501234567', expected: '+971501234567', description: 'International with 00' },
      { input: '50 123 4567', expected: '+971501234567', description: 'With spaces' },
      { input: '551234567', expected: '+971551234567', description: 'Du prefix' },
    ],
    invalid: [
      { input: '12345', error: 'TOO_SHORT', description: 'Too short' },
      { input: '50123456789012', error: 'TOO_LONG', description: 'Too long' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // Kuwait (KW)
  KW: {
    valid: [
      { input: '91234567', expected: '+96591234567', description: 'National format' },
      { input: '+96591234567', expected: '+96591234567', description: 'International with +' },
      { input: '9123 4567', expected: '+96591234567', description: 'With spaces' },
    ],
    invalid: [
      { input: '1234', error: 'TOO_SHORT', description: 'Too short' },
      { input: '912345678901', error: 'TOO_LONG', description: 'Too long' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // Qatar (QA)
  QA: {
    valid: [
      { input: '31234567', expected: '+97431234567', description: 'National format' },
      { input: '+97431234567', expected: '+97431234567', description: 'International with +' },
      { input: '3123 4567', expected: '+97431234567', description: 'With spaces' },
    ],
    invalid: [
      { input: '1234', error: 'TOO_SHORT', description: 'Too short' },
      { input: '312345678901', error: 'TOO_LONG', description: 'Too long' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // Bahrain (BH)
  BH: {
    valid: [
      { input: '31234567', expected: '+97331234567', description: 'National format' },
      { input: '+97331234567', expected: '+97331234567', description: 'International with +' },
      { input: '3123 4567', expected: '+97331234567', description: 'With spaces' },
    ],
    invalid: [
      { input: '1234', error: 'TOO_SHORT', description: 'Too short' },
      { input: '312345678901', error: 'TOO_LONG', description: 'Too long' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },

  // Oman (OM)
  OM: {
    valid: [
      { input: '91234567', expected: '+96891234567', description: 'National format' },
      { input: '+96891234567', expected: '+96891234567', description: 'International with +' },
      { input: '9123 4567', expected: '+96891234567', description: 'With spaces' },
    ],
    invalid: [
      { input: '1234', error: 'TOO_SHORT', description: 'Too short' },
      { input: '912345678901', error: 'TOO_LONG', description: 'Too long' },
      { input: '', error: 'EMPTY', description: 'Empty string' },
    ],
  },
};

/**
 * Run all tests and log results
 * Usage: import and call runPhoneValidationTests() in browser console
 */
export function runPhoneValidationTests() {
  console.log('🧪 Starting Phone Validation Tests...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  Object.entries(phoneTestCases).forEach(([countryCode, tests]) => {
    console.log(`\n📍 Testing ${countryCode}:`);
    console.log('─'.repeat(50));

    // Test valid cases
    tests.valid.forEach((testCase) => {
      totalTests++;
      const result = parseAndValidatePhone(testCase.input, countryCode);
      
      if (result.isValid && result.e164 === testCase.expected) {
        passedTests++;
        console.log(`✅ PASS: ${testCase.description}`);
        console.log(`   Input: "${testCase.input}" → E.164: "${result.e164}"`);
      } else {
        failedTests++;
        console.error(`❌ FAIL: ${testCase.description}`);
        console.error(`   Input: "${testCase.input}"`);
        console.error(`   Expected: "${testCase.expected}"`);
        console.error(`   Got: "${result.e164 || 'invalid'}"`);
        console.error(`   Error: ${result.error || 'none'}`);
      }
    });

    // Test invalid cases
    tests.invalid.forEach((testCase) => {
      totalTests++;
      const result = parseAndValidatePhone(testCase.input, countryCode);
      
      if (!result.isValid && result.errorType === testCase.error) {
        passedTests++;
        console.log(`✅ PASS: ${testCase.description} (correctly rejected)`);
        console.log(`   Input: "${testCase.input}" → Error: "${result.error}"`);
      } else {
        failedTests++;
        console.error(`❌ FAIL: ${testCase.description}`);
        console.error(`   Input: "${testCase.input}"`);
        console.error(`   Expected error: "${testCase.error}"`);
        console.error(`   Got: ${result.isValid ? 'valid' : result.errorType}`);
      }
    });
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   Total: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  return { totalTests, passedTests, failedTests };
}

/**
 * Quick test for a single phone number
 */
export function testPhone(phone: string, countryCode: string) {
  console.log(`\n🔍 Testing: "${phone}" for ${countryCode}`);
  const result = parseAndValidatePhone(phone, countryCode);
  
  console.log('Result:', {
    isValid: result.isValid,
    e164: result.e164,
    national: result.national,
    international: result.international,
    error: result.error,
    errorType: result.errorType,
  });
  
  return result;
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runPhoneValidationTests = runPhoneValidationTests;
  (window as any).testPhone = testPhone;
  (window as any).phoneTestCases = phoneTestCases;
}

