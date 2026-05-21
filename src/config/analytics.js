/**
 * src/config/analytics.js
 * Central configuration for analytics providers.
 * Reads from environment variables with safe defaults.
 */

// Yandex Metrika Counter ID from .env
export const COUNTER_ID = import.meta.env.VITE_YANDEX_METRICA_ID 
  ? Number(import.meta.env.VITE_YANDEX_METRICA_ID) 
  : null;

// Feature flags
export const ANALYTICS_CONFIG = {
  enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  webVitals: import.meta.env.VITE_ENABLE_WEB_VITALS !== 'false',
  isDev: import.meta.env.DEV,
};

// Validation: warn if ID is missing in production
if (!COUNTER_ID && !ANALYTICS_CONFIG.isDev) {
  console.warn('[Analytics] ⚠️ VITE_YANDEX_METRICA_ID is not set! Analytics will not work.');
}