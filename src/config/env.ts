// Environment configuration
// This file reads from Vite environment variables

export const ENV = {
  // Admin panel availability
  ENABLE_ADMIN: import.meta.env.VITE_ENABLE_ADMIN === 'true',
  
  // Deployment info
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

// Helper to check if admin features should be available
export const isAdminEnabled = () => ENV.ENABLE_ADMIN;

// Log configuration on app start (useful for debugging)
if (ENV.IS_DEVELOPMENT) {
  console.log('[ENV] Configuration:', {
    ENABLE_ADMIN: ENV.ENABLE_ADMIN,
    IS_PRODUCTION: ENV.IS_PRODUCTION,
    IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
  });
}

