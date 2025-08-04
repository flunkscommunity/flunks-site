/**
 * App Permissions System
 * Controls which desktop apps are visible based on user access level
 */

export type AccessLevel = 'ADMIN' | 'BETA' | 'COMMUNITY';

export interface AppPermission {
  id: string;
  title: string;
  requiredLevel: AccessLevel[];
  description?: string;
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
    id: 'my-profile',
    title: 'My Profile',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Manage your profile'
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
    requiredLevel: ['ADMIN'],
    description: 'Advanced terminal access'
  },
  {
    id: 'clique-access',
    title: 'Clique Access',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'Check NFT-based access rights'
  },
  {
    id: 'fhs-school',
    title: 'FHS School',
    requiredLevel: ['ADMIN'],
    description: 'School administration portal'
  },
  
  // Admin only - Developer/Management tools and restricted features
  {
    id: 'semester-zero',
    title: 'Semester Zero',
    requiredLevel: ['ADMIN'],
    description: 'Explore the virtual campus'
  },
  {
    id: 'game-manual',
    title: 'Game Manual',
    requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
    description: 'How to use the platform'
  },
  {
    id: 'meme-manager',
    title: 'Meme Manager',
    requiredLevel: ['ADMIN'],
    description: 'Manage memes and content'
  },
  {
    id: 'myplace',
    title: 'MyPlace',
    requiredLevel: ['ADMIN'],
    description: 'Social networking features'
  },
  {
    id: 'flappyflunk',
    title: 'Flappy Flunk',
    requiredLevel: ['ADMIN'],
    description: 'Play Flappy Flunk game'
  },
  {
    id: 'pocket-juniors',
    title: 'Pocket Juniors',
    requiredLevel: ['ADMIN'],
    description: 'Project Junior management'
  },
  {
    id: 'flunk-creator',
    title: 'Flunk Creator',
    requiredLevel: ['ADMIN'],
    description: 'Create custom Flunks'
  },
  {
    id: 'graduation',
    title: 'Graduation',
    requiredLevel: ['ADMIN'],
    description: 'Graduation system management'
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
  }
];

/**
 * Check if user has permission to see an app
 */
export const hasAppPermission = (appId: string, userAccessLevel?: AccessLevel): boolean => {
  // If no access level (not logged in), deny all
  if (!userAccessLevel) return false;
  
  const appPermission = APP_PERMISSIONS.find(app => app.id === appId);
  
  // If app not in permissions list, allow by default (for backwards compatibility)
  if (!appPermission) return true;
  
  // Check if user's access level is in the required levels
  return appPermission.requiredLevel.includes(userAccessLevel);
};

/**
 * Get user's current access level from session storage
 */
export const getUserAccessLevel = (): AccessLevel | null => {
  if (typeof window === 'undefined') return null;
  
  const accessLevel = sessionStorage.getItem('flunks-access-level');
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Grant admin access for localhost development
  if (isLocalhost || process.env.NODE_ENV === 'development') {
    return 'ADMIN';
  }
  
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
