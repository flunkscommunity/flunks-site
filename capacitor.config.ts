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
      'relay.walletconnect.org',
      'blocto.app',
      '*.blocto.app',
      'meetdapper.com',
      '*.meetdapper.com',
      'lilico.app',
      '*.lilico.app',
      'frw-link.lilico.app'
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
    // Background color - transparent to let app content show through
    backgroundColor: '#00000000',
    // Status bar style
    preferredContentMode: 'mobile'
  },
  
  // Android-specific configuration  
  android: {
    backgroundColor: '#0f0f1a',
    allowMixedContent: true
  },
  
  // Plugins configuration
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
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
