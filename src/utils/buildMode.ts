/**
 * Build Mode System
 * Controls feature visibility between public and build environments
 */

export type BuildMode = 'public' | 'build';

// Feature flags for different build modes
export interface BuildModeConfig {
  // Desktop Applications
  showSemesterZero: boolean;
  showMemeManager: boolean;
  showMyPlace: boolean;
  showFlappyFlunk: boolean;
  showGameManual: boolean;
  showTerminal: boolean;
  showCliqueAccess: boolean;
  showDevTools: boolean;
  showBrowser: boolean;
  showYearbook: boolean;
  showBulletinBoard: boolean;
  showIconAnimation: boolean;
  showReportCard: boolean;
  
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
}

// Configuration for each mode
const BUILD_MODE_CONFIGS: Record<BuildMode, BuildModeConfig> = {
  // Public mode - what beta users see (limited feature set)
  public: {
    // Core apps that should be visible to public/beta users
    showSemesterZero: true,
    showMemeManager: false,
    showMyPlace: false,
    showFlappyFlunk: false,
    showGameManual: true,
    showTerminal: true,
    showCliqueAccess: true,
    showDevTools: false,
    showBrowser: false,
    showYearbook: false,
    showBulletinBoard: false,
    showIconAnimation: false,
    showReportCard: false,
    
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
  },
  
  // Build mode - full admin access with all features
  build: {
    // Show all applications for development
    showSemesterZero: true,
    showMemeManager: true,
    showMyPlace: true,
    showFlappyFlunk: true,
    showGameManual: true,
    showTerminal: true,
    showCliqueAccess: true,
    showDevTools: true,
    showBrowser: true,
    showYearbook: true,
    showBulletinBoard: true,
    showIconAnimation: true,
    showReportCard: true,
    
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
  }
};

/**
 * Get current build mode from environment
 */
export const getCurrentBuildMode = (): BuildMode => {
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
