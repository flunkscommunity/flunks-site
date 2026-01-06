/**
 * API Base URL utility for mobile vs web
 * 
 * Mobile apps using Capacitor need to point to the live server since
 * they are static exports that don't include Next.js API routes.
 */

// Live server URL for API calls
const LIVE_API_URL = 'https://flunks.net';

/**
 * Check if running in Capacitor mobile app
 * This must be called at RUNTIME, not at module initialization time
 */
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  return isNative;
};

/**
 * Get the base URL for API calls
 * - Mobile (Capacitor): Uses live server URL
 * - Web: Uses relative URLs (same origin)
 * 
 * NOTE: This is called at runtime for each API call to ensure
 * Capacitor has been initialized
 */
export const getApiBaseUrl = (): string => {
  const mobile = isMobileApp();
  if (mobile) {
    console.log('📱 API Base URL: Using mobile URL', LIVE_API_URL);
    return LIVE_API_URL;
  }
  return ''; // Empty string = relative URL for same origin
};

/**
 * Build a full API URL
 * @param path - API path starting with /api/
 */
export const getApiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${base}${normalizedPath}`;
  
  // Debug log for mobile
  if (base) {
    console.log('🌐 API URL:', fullUrl);
  }
  
  return fullUrl;
};

export default getApiUrl;
