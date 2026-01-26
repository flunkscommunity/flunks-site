/**
 * Mobile Fetch Interceptor
 * 
 * Automatically redirects all /api/* calls to the live server when running in
 * Capacitor mobile apps (since static exports don't include API routes)
 */

const LIVE_API_URL = 'https://www.flunks.net';

const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Setup fetch interceptor for mobile apps
 * Call this once on app initialization
 */
export const setupMobileFetchInterceptor = () => {
  if (!isMobileApp()) {
    console.log('🌐 Web mode: Using native fetch (no interception needed)');
    return;
  }

  console.log('📱 Mobile mode: Setting up fetch interceptor for API calls');

  // Store the original fetch
  const originalFetch = window.fetch;

  // Override fetch
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Convert input to string URL
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = String(input);
    }

    // Check if this is a relative API call
    if (url.startsWith('/api/')) {
      const fullUrl = `${LIVE_API_URL}${url}`;
      console.log(`📱 Intercepted API call: ${url} → ${fullUrl}`);
      
      // Create new Request with full URL if input was a Request object
      if (input instanceof Request) {
        const interceptedFetch = originalFetch(new Request(fullUrl, input), init);
        
        // Add logging for the response
        return interceptedFetch.then(response => {
          console.log(`📱 API Response: ${response.status} ${response.statusText} for ${url}`);
          return response;
        }).catch(error => {
          console.error(`📱 API Error for ${url}:`, error);
          throw error;
        });
      }
      
      // Otherwise just use the full URL string
      const interceptedFetch = originalFetch(fullUrl, init);
      
      // Add logging for the response
      return interceptedFetch.then(response => {
        console.log(`📱 API Response: ${response.status} ${response.statusText} for ${url}`);
        return response;
      }).catch(error => {
        console.error(`📱 API Error for ${url}:`, error);
        throw error;
      });
    }

    // For non-API calls, use original fetch
    return originalFetch(input, init);
  };

  console.log('✅ Mobile fetch interceptor installed');
};
