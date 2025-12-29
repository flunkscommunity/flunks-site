/**
 * App Permissions System
 * Controls which desktop apps are visible based on user access level and build mode
 */

import { isFeatureEnabled, getCurrentBuildMode, type BuildMode } from './buildMode';

export type AccessLevel = 'ADMIN' | 'BETA' | 'COMMUNITY';

export interface AppPermission {
  id: string;
  title: string;
  requiredLevel: AccessLevel[];
  description?: string;
  buildModeFeature?: string; // Maps to BuildModeConfig key
}

// Define which apps require which access levels
export const APP_PERMISSIONS: AppPermission[] = [
  // Core apps - available to everyone
  {
    id: 'onlyflunks',
    title: 'OnlyFlunks',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'View your NFT collection'
  },
  {
    id: 'my-locker',
    title: 'My Locker',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Manage your profile'
  },
  {
    id: 'create-profile',
    title: 'Create Profile',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Create or edit your user profile'
  },
  {
    id: 'radio',
    title: 'Radio',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Listen to Flunks FM'
  },
  {
    id: 'chat-rooms',
    title: 'Chat Rooms',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Join community chat rooms'
  },
  {
    id: 'about',
    title: 'About Us',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Learn about Flunks'
  },
  
  // Beta and Community - Limited access to core features only
  {
    id: 'terminal',
    title: 'Terminal',
    requiredLevel: ['ADMIN', 'BETA'],
    description: 'Advanced terminal access for beta testers',
    buildModeFeature: 'showTerminal'
  },
  {
    id: 'clique-access',
    title: 'Clique Access',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Check NFT-based access rights',
    buildModeFeature: 'showCliqueAccess'
  },
  {
    id: 'fhs-school',
    title: 'FHS School',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Flunks High School portal'
  },
  
  // Admin only - Developer/Management tools and restricted features
  {
    id: 'semester-zero',
    title: 'Semester Zero',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Explore the virtual campus',
    buildModeFeature: 'showSemesterZero'
  },
  {
    id: 'game-manual',
    title: 'Game Manual',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'How to use the platform',
    buildModeFeature: 'showGameManual'
  },
  {
    id: 'meme-manager',
    title: 'Meme Manager',
    requiredLevel: ['ADMIN'],
    description: 'Manage memes and content',
    buildModeFeature: 'showMemeManager'
  },
  {
    id: 'myplace',
    title: 'MyPlace',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Social networking features',
    buildModeFeature: 'showMyPlace'
  },
  {
    id: 'flappyflunk',
    title: 'Flappy Flunk',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Play Flappy Flunk game',
    buildModeFeature: 'showFlappyFlunk'
  },
  {
    id: 'hidden-riff',
    title: 'Hidden Riff',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Find the clue sequence and strum the chords in time',
    buildModeFeature: 'showHiddenRiff'
  },
  {
    id: 'pocket-juniors',
    title: 'Pocket Juniors',
    requiredLevel: ['ADMIN'],
    description: 'Project Junior management',
    buildModeFeature: 'showPocketJuniors'
  },
  {
    id: 'flunk-creator',
    title: 'Flunk Creator',
    requiredLevel: ['ADMIN'],
    description: 'Create custom Flunks',
    buildModeFeature: 'showFlunkCreator'
  },
  {
    id: 'graduation',
    title: 'Graduation',
    requiredLevel: ['ADMIN'],
    description: 'Graduation system management'
  },
  {
    id: 'yearbook',
    title: 'Flunks Yearbook',
    requiredLevel: ['ADMIN'],
    description: 'Browse student yearbook entries',
    buildModeFeature: 'showYearbook'
  },
  {
    id: 'picture-day',
    title: 'Picture Day',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: '90s yearbook voting system for clique representatives',
    buildModeFeature: 'showPictureDay'
  },
  
  // Story Manual - Available to all users
  {
    id: 'story-manual',
    title: 'The Story So Far',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'], // Fixed: Allow all access levels
    description: 'Interactive story chapters and cutscenes',
    buildModeFeature: 'showStoryManual'
  },
  
  // VCR Effects Test - Build Mode Only (Development Tool)
  {
    id: 'vcr-test',
    title: 'VCR Effects Test',
    requiredLevel: ['ADMIN'],
    description: 'Development tool for testing VCR effects',
    buildModeFeature: 'showVCREffectsTest'
  },
  
  // Retro Text Demo (showcase new clique colors)
  {
    id: 'retro-text-demo',
    title: '🎮 Retro Text Demo',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Preview clique-colored retro text boxes',
    buildModeFeature: 'showRetroTextDemo'
  },
  
  // Icon Animation Lab (dev/admin for now)
  {
    id: 'icon-animation',
    title: 'Icon Animation',
    requiredLevel: ['ADMIN'],
    description: 'Preview desktop icon animations',
    buildModeFeature: 'showIconAnimation'
  },
  
  // Mystical Zoltar Fortune Machine - Build Mode Only
  {
    id: 'zoltar-fortune',
    title: 'Mystical Zoltar',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Fortune telling game machine - spend GUM for a chance to win big!',
    buildModeFeature: 'showZoltarFortune'
  },
  // Icon Animation - admin only feature  
  {
    id: 'icon-animation',
    title: 'Icon Animation',
    requiredLevel: ['ADMIN'],
    description: 'Preview desktop icon animations',
    buildModeFeature: 'showIconAnimation'
  },
  
  // External links - available to all
  {
    id: 'discord',
    title: 'Discord',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Join our Discord server'
  },
  {
    id: 'x-twitter',
    title: 'X (Twitter)',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Follow us on X'
  },
  {
    id: 'market',
    title: 'Market',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'NFT marketplace'
  },
  
  // The Underground - Secret password entry
  {
    id: 'underground',
    title: 'The Underground',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Secret underground access - discover the password in Semester Zero'
  }
];

// Apps to hide from non-logged-in users (mobile app default view)
// These are either dev tools, unfinished features, or require wallet connection
const GUEST_HIDDEN_APPS = [
  'flunky-bash',       // Unfinished game
  'slot-machine',      // Requires GUM/wallet
  'burn-nft',          // Admin/dev tool
  'magic-test',        // Dev tool
  'loading-screen-preview', // Dev tool
  'picture-day',       // Seasonal feature - can re-enable later
];

/**
 * Check if user has permission to see an app
 */
export const hasAppPermission = (appId: string, userAccessLevel?: AccessLevel | null): boolean => {
  const appPermission = APP_PERMISSIONS.find(app => app.id === appId);
  
  // If no access level (not logged in), show COMMUNITY-level apps by default
  // This allows mobile users to see the desktop before connecting wallet
  if (!userAccessLevel) {
    // Hide specific apps from guest/non-logged-in users
    if (GUEST_HIDDEN_APPS.includes(appId)) {
      return false;
    }
    
    // If app not in permissions list, allow by default
    if (!appPermission) return true;
    
    // Check build mode feature flag first
    if (appPermission.buildModeFeature) {
      const featureEnabled = isFeatureEnabled(appPermission.buildModeFeature as any);
      if (!featureEnabled) return false;
    }
    
    // Show apps that are available to COMMUNITY level (most apps)
    return appPermission.requiredLevel.includes('COMMUNITY');
  }
  
  // If app not in permissions list, allow by default (for backwards compatibility)
  if (!appPermission) return true;
  
  // Check build mode feature flag first
  if (appPermission.buildModeFeature) {
    const featureEnabled = isFeatureEnabled(appPermission.buildModeFeature as any);
    if (!featureEnabled) return false;
  }
  
  // Check if user's access level is in the required levels
  // If requiredLevel is empty, allow all access levels
  if (appPermission.requiredLevel.length === 0) return true;
  return appPermission.requiredLevel.includes(userAccessLevel);
};

/**
 * Get user's current access level from session storage
 */
export const getUserAccessLevel = (): AccessLevel | null => {
  if (typeof window === 'undefined') return null;
  
  const accessLevel = sessionStorage.getItem('flunks-access-level');
  
  return accessLevel as AccessLevel;
};

/**
 * Get visible apps for current user
 */
export const getVisibleApps = (): AppPermission[] => {
  const userLevel = getUserAccessLevel();
  if (!userLevel) return [];
  
  return APP_PERMISSIONS.filter(app => hasAppPermission(app.id, userLevel));
};

/**
 * Get access level display info
 */
export const getAccessLevelInfo = (level: AccessLevel) => {
  switch (level) {
    case 'ADMIN':
      return {
        name: 'Administrator',
        color: '#ff6b35',
        description: 'Full access to all features and tools'
      };
    case 'BETA':
      return {
        name: 'Beta Tester',
        color: '#4CAF50',
        description: 'Access to core features and beta testing tools'
      };
    case 'COMMUNITY':
      return {
        name: 'Community Member',
        color: '#2196F3',
        description: 'Access to essential community features'
      };
    default:
      return {
        name: 'Guest',
        color: '#757575',
        description: 'Limited access'
      };
  }
};

/**
 * Debug function to show current permissions and build mode status
 */
export const debugPermissions = () => {
  const buildMode = getCurrentBuildMode();
  const userLevel = getUserAccessLevel();
  const visibleApps = getVisibleApps();
  
  console.log(`
🔧 PERMISSIONS DEBUG
================

Build Mode: ${buildMode}
User Access Level: ${userLevel || 'None'}
Visible Apps: ${visibleApps.length}

Apps Available:
${visibleApps.map(app => `  • ${app.title} (${app.id})`).join('\n')}

Build Mode Features:
${Object.entries({
  'Semester Zero': isFeatureEnabled('showSemesterZero'),
  'Meme Manager': isFeatureEnabled('showMemeManager'),
  'MyPlace': isFeatureEnabled('showMyPlace'),
  'Flappy Flunk': isFeatureEnabled('showFlappyFlunk'),
  'Terminal': isFeatureEnabled('showTerminal'),
  'Admin Panel': isFeatureEnabled('showGumAdminPanel'),
}).map(([name, enabled]) => `  • ${name}: ${enabled ? '✅' : '❌'}`).join('\n')}
  `);
};
