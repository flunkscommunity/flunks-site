import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.flunks.app',
  appName: 'Flunks',
  webDir: 'out',
  
  // Server configuration - use live API for mobile app
  server: {
    // For production: point to live site for API calls
    url: process.env.NODE_ENV === 'development' ? undefined : undefined,
    // Allow loading from local files
    androidScheme: 'https',
    // Handle external links - allow wallet discovery and WalletConnect URLs
    allowNavigation: [
      'flunks.net', 
      '*.flunks.net', 
      'flow.com', 
      '*.flow.com',
      'fcl-discovery.onflow.org',
      '*.onflow.org',
      'walletconnect.com',
      '*.walletconnect.com',
      '*.walletconnect.org',
      'relay.walletconnect.com',
      'relay.walletconnect.org'
      // Note: Wallet app links (lilico, blocto, dapper) are intentionally NOT here
      // so they open in external apps/browsers instead of loading in WebView
    ]
  },
  
  // iOS-specific configuration
  ios: {
    // Use modern WKWebView - 'never' extends content into safe areas
    contentInset: 'never',
    // Allow inline media playback (for sounds, music)
    allowsLinkPreview: false,
    // Scroll behavior
    scrollEnabled: true,
    // Background color - dark to match app theme and prevent white flash
    backgroundColor: '#0f0f1a',
    // Content mode - 'recommended' allows native iPad display (not iPhone compatibility mode)
    // This enables proper iPad screenshots and native iPad experience
    preferredContentMode: 'recommended'
  },
  
  // Android-specific configuration  
  android: {
    backgroundColor: '#0f0f1a',
    allowMixedContent: true
  },
  
  // Plugins configuration
  plugins: {
    // Splash screen configuration - use minimal native splash, React handles the animation
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#0f0f1a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    // Keyboard behavior - use 'none' to prevent viewport resizing issues with fixed positioning
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: false
    }
  }
};

export default config;
