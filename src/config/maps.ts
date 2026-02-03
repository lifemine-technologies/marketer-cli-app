/**
 * Google Maps / Geocoding API key.
 * Set GOOGLE_MAPS_API_KEY in .env at project root (see .env.example).
 * Get a key: https://console.cloud.google.com/apis/credentials
 * Enable: Maps SDK for Android, Geocoding API
 * Note: Use process.env.GOOGLE_MAPS_API_KEY so babel-plugin-inline-dotenv can replace it.
 */
export const GOOGLE_MAPS_API_KEY = (
  typeof process !== 'undefined' && process.env.GOOGLE_MAPS_API_KEY != null
    ? String(process.env.GOOGLE_MAPS_API_KEY)
    : ''
).trim();
