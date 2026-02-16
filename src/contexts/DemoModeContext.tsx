/**
 * Demo Mode Context
 * Provides a fake wallet and GUM balance for App Store / Play Store reviewers
 * and users who want to try the app without connecting a wallet
 * 
 * NOTE: Demo mode works on iOS (App Store) and Android (Play Store)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Check if we're on iOS (demo mode is iOS-only)
export const isIOSPlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
};

// Check if we're on Android
export const isAndroidPlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

// Check if we're on a platform that supports demo mode (iOS + Android)
export const isDemoPlatform = (): boolean => {
  return isIOSPlatform() || isAndroidPlatform();
};

// Demo wallet address (not a real wallet)
export const DEMO_WALLET_ADDRESS = '0xdemo000000000001';
const DEMO_INITIAL_BALANCE = 1000;

// Demo Flunk NFT data - Use a real Flunk image from the cloud bucket
export const DEMO_FLUNK = {
  owner: DEMO_WALLET_ADDRESS,
  tokenID: '1337',
  MetadataViewsDisplay: {
    name: 'Demo Flunk #1337',
    description: 'A demo Flunk for App Store review',
    thumbnail: {
      url: 'https://storage.googleapis.com/flunks-assets/flunks/1337.png'
    }
  },
  traits: {
    clique: 'Freaks',
    backdrop: 'Neon Dreams',
    pigment: 'Purple Haze',
    head: 'Mohawk',
    face: 'Grin',
    torso: 'Leather Jacket',
  },
  serialNumber: '1337',
  stakingInfo: {
    staker: DEMO_WALLET_ADDRESS,
    tokenID: '1337',
    stakedAtInSeconds: '0',
    pool: 'none'
  },
  collection: 'Flunks',
  rewards: '0',
  claimedRewards: '0',
  pixelUrl: ''
};

// Demo profile data for My Locker
export const DEMO_PROFILE = {
  username: 'DemoFlunk',
  bio: 'Testing the Flunks app!',
  avatar: 'https://storage.googleapis.com/flunks-assets/flunks/1337.png',
  level: 5,
  xp: 2500,
  joinedAt: new Date().toISOString(),
  profile_icon: '🎮',
};

// Demo chapter/objectives completion
export const DEMO_CHAPTERS = {
  chapter1Complete: true,
  chapter2Complete: true, 
  chapter3Complete: true,
  chapter4Complete: true,
  chapter5Complete: true,
  chapter6Complete: true,
  objectivesCompleted: 42,
  totalObjectives: 42,
};

// Demo locker data for My Locker
export const DEMO_LOCKER = {
  locker_number: 1337,
  wallet_address: DEMO_WALLET_ADDRESS,
  username: 'DemoFlunk',
  created_at: new Date().toISOString(),
};

// Demo pins/patches for Varsity Letter display
export const DEMO_PINS = [
  {
    id: '1',
    name: 'Paradise Motel Pin',
    image: '/images/icons/paradise-motel-icon.png',
    type: 'pin',
    tier: 'common',
    placed: false,
  },
  {
    id: '2', 
    name: 'Flunks Logo Pin',
    image: '/images/pins/flunky-uppy-pin-silver.png',
    type: 'pin',
    tier: 'rare',
    placed: false,
  },
  {
    id: '3',
    name: 'GUM Token',
    image: '/images/icons/semester-zero-nft.png',
    type: 'token',
    tier: 'common',
    placed: false,
  },
];

// Demo chat messages for ChatRoom
export const DEMO_CHAT_MESSAGES = [
  { username: 'FlunkMaster', message: 'Welcome to the Flunks community! 🎉', timestamp: new Date(Date.now() - 300000).toISOString(), profileIcon: '🎮' },
  { username: 'CoolCat99', message: 'Hey everyone! Just got my first Flunk!', timestamp: new Date(Date.now() - 240000).toISOString(), profileIcon: '😎' },
  { username: 'PixelPunk', message: 'Anyone want to trade pins?', timestamp: new Date(Date.now() - 180000).toISOString(), profileIcon: '🎨' },
  { username: 'FlunkMaster', message: 'The underground games are so fun!', timestamp: new Date(Date.now() - 120000).toISOString(), profileIcon: '🎮' },
  { username: 'GumCollector', message: 'Just hit 500 GUM! 🍬', timestamp: new Date(Date.now() - 60000).toISOString(), profileIcon: '🍬' },
];

export interface DemoModeContextType {
  // Demo mode state
  isDemoMode: boolean;
  demoBalance: number;
  demoWalletAddress: string;
  demoFlunk: typeof DEMO_FLUNK;
  demoProfile: typeof DEMO_PROFILE;
  demoChapters: typeof DEMO_CHAPTERS;
  demoLocker: typeof DEMO_LOCKER;
  demoPins: typeof DEMO_PINS;
  demoChatMessages: typeof DEMO_CHAT_MESSAGES;
  
  // Actions
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  updateDemoBalance: (newBalance: number) => void;
  spendDemoGum: (amount: number) => boolean;
  earnDemoGum: (amount: number) => void;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export const useDemoMode = (): DemoModeContextType => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

// Safe hook that returns null if not in provider (for optional usage)
export const useDemoModeOptional = (): DemoModeContextType | null => {
  return useContext(DemoModeContext);
};

interface DemoModeProviderProps {
  children: React.ReactNode;
}

const DEMO_MODE_STORAGE_KEY = 'flunks_demo_mode';
const DEMO_BALANCE_STORAGE_KEY = 'flunks_demo_balance';

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  // Initialize from localStorage to persist across navigation
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      const isDemo = stored === 'true' && isDemoPlatform();
      if (isDemo) {
        console.log('🎮 Demo Mode restored from storage');
      }
      return isDemo;
    }
    return false;
  });
  
  const [demoBalance, setDemoBalance] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_BALANCE_STORAGE_KEY);
      if (stored) {
        const balance = parseInt(stored, 10);
        if (!isNaN(balance)) {
          console.log('🎮 Demo balance restored:', balance);
          return balance;
        }
      }
    }
    return DEMO_INITIAL_BALANCE;
  });

  // Persist demo mode state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, isDemoMode.toString());
      console.log('🎮 Demo mode state saved:', isDemoMode);
    }
  }, [isDemoMode]);

  // Persist balance changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isDemoMode) {
      localStorage.setItem(DEMO_BALANCE_STORAGE_KEY, demoBalance.toString());
    }
  }, [demoBalance, isDemoMode]);

  const enableDemoMode = useCallback(() => {
    // Demo mode DISABLED for production release
    // Previously used for iOS App Store review and testing
    console.log('🎮 Demo Mode is disabled in this release');
    return; // Do not enable demo mode
    
    // Original code commented out:
    // setIsDemoMode(true);
    // setDemoBalance(DEMO_INITIAL_BALANCE);
    // if (typeof window !== 'undefined') {
    //   localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
    //   localStorage.setItem(DEMO_BALANCE_STORAGE_KEY, DEMO_INITIAL_BALANCE.toString());
    // }
  }, []);

  const disableDemoMode = useCallback(() => {
    console.log('🎮 Demo Mode disabled');
    setIsDemoMode(false);
    setDemoBalance(DEMO_INITIAL_BALANCE);
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
      localStorage.removeItem(DEMO_BALANCE_STORAGE_KEY);
    }
  }, []);

  const updateDemoBalance = useCallback((newBalance: number) => {
    setDemoBalance(Math.max(0, newBalance));
  }, []);

  const spendDemoGum = useCallback((amount: number): boolean => {
    if (demoBalance >= amount) {
      setDemoBalance(prev => Math.max(0, prev - amount));
      console.log('🎮 Demo: Spent', amount, 'GUM. New balance:', demoBalance - amount);
      return true;
    }
    console.log('🎮 Demo: Insufficient GUM. Have:', demoBalance, 'Need:', amount);
    return false;
  }, [demoBalance]);

  const earnDemoGum = useCallback((amount: number) => {
    setDemoBalance(prev => prev + amount);
    console.log('🎮 Demo: Earned', amount, 'GUM. New balance:', demoBalance + amount);
  }, [demoBalance]);

  // Expose enableDemoMode to window for desktop testing via browser console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__enableDemoMode = enableDemoMode;
      (window as any).__disableDemoMode = disableDemoMode;
      console.log('🎮 Demo mode controls available: window.__enableDemoMode() / window.__disableDemoMode()');
    }
  }, [enableDemoMode, disableDemoMode]);

  const value: DemoModeContextType = {
    isDemoMode,
    demoBalance,
    demoWalletAddress: DEMO_WALLET_ADDRESS,
    demoFlunk: DEMO_FLUNK,
    demoProfile: DEMO_PROFILE,
    demoChapters: DEMO_CHAPTERS,
    demoLocker: DEMO_LOCKER,
    demoPins: DEMO_PINS,
    demoChatMessages: DEMO_CHAT_MESSAGES,
    enableDemoMode,
    disableDemoMode,
    updateDemoBalance,
    spendDemoGum,
    earnDemoGum,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export default DemoModeContext;
