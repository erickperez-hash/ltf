/**
 * Application configuration
 */

// API endpoint - update this after deploying to Cloudflare Workers
export const API_CONFIG = {
  // Local development endpoint (for testing worker locally)
  local: 'http://localhost:8787',

  // Production Cloudflare Workers endpoint
  // DEPLOYED: https://listing-truth-finder-api.erickrperez.workers.dev
  production: import.meta.env.VITE_API_URL || 'https://listing-truth-finder-api.erickrperez.workers.dev',

  // Use production by default (change to 'local' for local worker testing)
  current: import.meta.env.VITE_API_URL || 'production'
};

/**
 * Get the current API endpoint
 */
export function getApiEndpoint() {
  if (API_CONFIG.current === 'local') {
    return API_CONFIG.local;
  }

  // If VITE_API_URL is set in .env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return API_CONFIG.production;
}
