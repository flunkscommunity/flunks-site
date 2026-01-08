import { Capacitor } from "@capacitor/core";

/**
 * Build Mode System
 * Controls feature visibility between public and build environments
 */

export type BuildMode = 'public' | 'build';

/**
 * Check if running inside Capacitor mobile app
 * Prefer Capacitor's core helper, fallback to global injection
 */
export const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    if (Capacitor?.isNativePlatform?.()) {
      return true;
    }
  } catch (error) {
    // ignore - fall back to window object detection
  }

  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {
    return true;
  }

  const platform = cap?.getPlatform?.();
  if (platform && platform !== 'web') {
    return true;
  }

  return false;
};

/**
 * Check if we're truly running on localhost for development (not mobile app)
 */
export const isDevLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Don't consider it localhost if we're in a mobile app
  if (isMobileApp()) return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

// Feature flags for different build modes
export interface BuildModeConfig {
  // Desktop Applications
  showSemesterZero: boolean;
  showMemeManager: boolean;
  showMyPlace: boolean;
  showFlappyFlunk: boolean;
  showFlunkyUppy: boolean;
  showHiddenRiff: boolean;
  showGameManual: boolean;
  showTerminal: boolean;
  showCliqueAccess: boolean;
  showDevTools: boolean;
  showBrowser: boolean;
  showYearbook: boolean;
  showRetroTextDemo: boolean;
  showBulletinBoard: boolean;
  showIconAnimation: boolean;
  showReportCard: boolean;
  showPictureDay: boolean;
  showDeloreanTracker: boolean;
  showLoadingScreenPreview: boolean;
  showCutscenes: boolean;
  showStoryManual: boolean;
  showVCREffectsTest: boolean;
  showZoltarFortune: boolean;
  showMagicTest: boolean;
  showLevelUp: boolean;
  showBurnNFT: boolean;
  showSlotMachine: boolean;
  showFlunkyBash: boolean;
  
  // Special Announcements
  flappyFlunkWeekend: boolean;
  
  // ADMIN-only features
  showPocketJuniors: boolean;
  showFlunkCreator: boolean;
  
  // Admin Features
  showGumAdminPanel: boolean;
  showTimeAdmin: boolean;
  showDebugEndpoints: boolean;
  
  // Access Control
  requireAccessCode: boolean;
  showAccessGate: boolean;
  
  // Development Features (build mode only)
  enableWalletBypass: boolean;
}

// Configuration for each mode
const BUILD_MODE_CONFIGS: Record<BuildMode, BuildModeConfig> = {
  // Public mode - what beta users see (limited feature set)
  public: {
    // Core apps that should be visible to public/beta users
    showSemesterZero: true,
    showMemeManager: false,
    showMyPlace: true,
    showFlappyFlunk: true,
    showFlunkyUppy: true,
    showHiddenRiff: true, // 🎸 Freak's Guitar - Hidden Riff Challenge LIVE!
    showGameManual: true,
    showTerminal: true,
    showCliqueAccess: true,
    showDevTools: false,
    showBrowser: false,
    showYearbook: false,
    showRetroTextDemo: true,
    showBulletinBoard: false,
    showIconAnimation: false,
    showReportCard: false,
    showPictureDay: false,
    showDeloreanTracker: true,
    showLoadingScreenPreview: false,
    showCutscenes: false,
    showStoryManual: true,
    showVCREffectsTest: false,
    showZoltarFortune: true,
    showMagicTest: false,
    showLevelUp: true,
    showBurnNFT: false,
    showSlotMachine: false,
    showFlunkyBash: false,
    
    // Special Announcements - visible on public site
    flappyFlunkWeekend: true,
    
    // ADMIN-only features - hidden from public/beta
    showPocketJuniors: false,
    showFlunkCreator: false,
    
    // No admin features in public mode
    showGumAdminPanel: false,
    showTimeAdmin: false,
    showDebugEndpoints: false,
    
    // Public mode should NOT require access codes
    requireAccessCode: false,
    showAccessGate: false,
    
    // No wallet bypass in public mode (affects real users)
    enableWalletBypass: false,
  },
  
  // Build mode - full admin access with all features
  build: {
    // Show all applications for development
    showSemesterZero: true,
    showMemeManager: true,
    showMyPlace: true,
    showFlappyFlunk: true,
    showFlunkyUppy: true,
  showHiddenRiff: true,
    showGameManual: true,
    showTerminal: true,
    showCliqueAccess: true,
    showDevTools: true,
    showBrowser: true,
    showYearbook: true,
    showRetroTextDemo: true,
    showBulletinBoard: true,
    showIconAnimation: true,
    showReportCard: true,
    showPictureDay: true,
    showDeloreanTracker: true,
    showLoadingScreenPreview: true,
    showCutscenes: true,
    showStoryManual: true,
    showVCREffectsTest: true,
    showZoltarFortune: true,
    showMagicTest: true,
    showLevelUp: true,
    showBurnNFT: true,
    showSlotMachine: true,
    showFlunkyBash: true,
    
    // Special Announcements - visible in build mode
    flappyFlunkWeekend: true,
    
    // ADMIN-only features - visible in build mode
    showPocketJuniors: true,
    showFlunkCreator: true,
    
    // Full admin features
    showGumAdminPanel: true,
    showTimeAdmin: true,
    showDebugEndpoints: true,
    
    // Access control settings (can be overridden by environment)
    requireAccessCode: true,
    showAccessGate: true,
    
    // Enable wallet bypass in build mode for development
    enableWalletBypass: true,
  }
};

/**
 * Get current build mode from environment
 * Mobile apps always use 'public' mode to match flunks.net behavior
 */
export const getCurrentBuildMode = (): BuildMode => {
  // Mobile apps should always behave like the public site (flunks.net)
  // regardless of the build mode setting
  if (isMobileApp()) {
    return 'public';
  }
  
  const mode = process.env.NEXT_PUBLIC_BUILD_MODE;
  return (mode === 'build' || mode === 'public') ? mode : 'public';
};

/**
 * Get build mode configuration
 */
export const getBuildModeConfig = (mode?: BuildMode): BuildModeConfig => {
  const currentMode = mode || getCurrentBuildMode();
  return BUILD_MODE_CONFIGS[currentMode];
};

/**
 * Check if a feature is enabled in current build mode
 */
export const isFeatureEnabled = (feature: keyof BuildModeConfig): boolean => {
  const config = getBuildModeConfig();
  return config[feature];
};

/**
 * Get current environment info for debugging
 */
export const getBuildModeInfo = () => {
  const mode = getCurrentBuildMode();
  const config = getBuildModeConfig(mode);
  
  return {
    mode,
    config,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BUILD_MODE: process.env.NEXT_PUBLIC_BUILD_MODE,
      NEXT_PUBLIC_ACCESS_REQUIRED: process.env.NEXT_PUBLIC_ACCESS_REQUIRED,
    }
  };
};

/**
 * Get default access level for current build mode
 */
export const getDefaultAccessLevel = (): string | null => {
  const mode = getCurrentBuildMode();
  const config = getBuildModeConfig(mode);
  
  // In public mode, automatically grant beta access
  if (mode === 'public' && !config.requireAccessCode) {
    return 'BETA';
  }
  
  return null;
};

/**
 * Check if access gate should be shown
 */
export const shouldShowAccessGate = (): boolean => {
  const config = getBuildModeConfig();
  const accessRequired = process.env.NEXT_PUBLIC_ACCESS_REQUIRED !== 'false';
  
  // Show access gate only if both build mode and env var require it
  return config.requireAccessCode && accessRequired;
};

/**
 * Helper for console debugging
 */
export const logBuildModeInfo = () => {
  const info = getBuildModeInfo();
  console.log('🔧 Build Mode Info:', info);
  return info;
};
