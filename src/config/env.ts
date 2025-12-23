/**
 * SECURITY: Environment Configuration
 * 
 * This file reads from Vite environment variables.
 * Logging is restricted to development mode only to prevent information leakage.
 */

export const ENV = {
  // Admin panel availability
  // CRITICAL: This must be 'true' for web builds (Netlify)
  // and 'false' for mobile builds (Capacitor)
  ENABLE_ADMIN: import.meta.env.VITE_ENABLE_ADMIN === 'true',
  
  // Deployment info
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  
  // Raw value for debugging (DEV ONLY)
  _RAW_ADMIN_FLAG: import.meta.env.VITE_ENABLE_ADMIN,
} as const;

// Helper to check if admin features should be available
export const isAdminEnabled = () => ENV.ENABLE_ADMIN;

/**
 * SECURITY: Log configuration only in development mode
 * Production logs are minimized to prevent information disclosure
 */
if (ENV.IS_DEVELOPMENT) {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 APP CONFIGURATION (DEV MODE)');
  console.log('═══════════════════════════════════════════════════');
  console.log('ENABLE_ADMIN:', ENV.ENABLE_ADMIN);
  console.log('RAW FLAG:', ENV._RAW_ADMIN_FLAG);
  console.log('IS_PRODUCTION:', ENV.IS_PRODUCTION);
  console.log('IS_DEVELOPMENT:', ENV.IS_DEVELOPMENT);
  console.log('Admin Routes:', ENV.ENABLE_ADMIN ? '✅ ENABLED' : '❌ DISABLED');
  console.log('═══════════════════════════════════════════════════');
} else {
  // Production: Minimal logging
  console.log('[App] Initialized');
}

