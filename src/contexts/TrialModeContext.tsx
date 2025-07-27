import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock wallet and user data for trial mode
export interface MockWallet {
  address: string;
  connector: {
    name: string;
  };
}

export interface MockUser {
  id: string;
  email?: string;
  username?: string;
  verifiedCredentials: any[];
}

interface TrialModeContextType {
  isTrialMode: boolean;
  setTrialMode: (enabled: boolean) => void;
  mockWallet: MockWallet | null;
  mockUser: MockUser | null;
  connectTrialWallet: () => void;
  disconnectTrialWallet: () => void;
  restartTrialMode: () => void;
}

const TrialModeContext = createContext<TrialModeContextType | null>(null);

export const useTrialMode = () => {
  const context = useContext(TrialModeContext);
  if (!context) {
    throw new Error('useTrialMode must be used within a TrialModeProvider');
  }
  return context;
};

interface TrialModeProviderProps {
  children: React.ReactNode;
}

export const TrialModeProvider: React.FC<TrialModeProviderProps> = ({ children }) => {
  const [isTrialMode, setIsTrialMode] = useState(false);
  const [mockWallet, setMockWallet] = useState<MockWallet | null>(null);
  const [mockUser, setMockUser] = useState<MockUser | null>(null);

  // Auto-detect if we're in Simple Browser environment
  useEffect(() => {
    const isSimpleBrowser = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      navigator.userAgent.includes('VSCode') ||
      // Check if we're in a sandboxed environment
      window.parent !== window
    );

    // Check for trial mode URL parameter
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const trialParam = urlParams?.get('trial');
    
    if (trialParam === 'true' || (isSimpleBrowser && !sessionStorage.getItem('trial-mode-dismissed'))) {
      setIsTrialMode(true);
    }

    // Add global function for easy trial mode restart from console
    if (typeof window !== 'undefined') {
      (window as any).restartTrialMode = () => {
        sessionStorage.removeItem('trial-mode-dismissed');
        sessionStorage.removeItem('trial-welcome-shown');
        setIsTrialMode(true);
        console.log('🎮 Trial mode restarted!');
      };
      
      // Add function to force enable trial mode
      (window as any).enableTrialMode = () => {
        setIsTrialMode(true);
        console.log('🎮 Trial mode enabled!');
      };
    }
  }, []);

  const connectTrialWallet = () => {
    const trialWallet: MockWallet = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      connector: {
        name: 'Trial Wallet (Demo)'
      }
    };

    const trialUser: MockUser = {
      id: 'trial-user-' + Date.now(),
      email: 'trial@flunks.demo',
      username: undefined, // Will be set after profile creation
      verifiedCredentials: []
    };

    setMockWallet(trialWallet);
    setMockUser(trialUser);
    
    // Store in sessionStorage for persistence during session
    sessionStorage.setItem('trial-wallet', JSON.stringify(trialWallet));
    sessionStorage.setItem('trial-user', JSON.stringify(trialUser));
  };

  const disconnectTrialWallet = () => {
    setMockWallet(null);
    setMockUser(null);
    sessionStorage.removeItem('trial-wallet');
    sessionStorage.removeItem('trial-user');
  };

  const setTrialMode = (enabled: boolean) => {
    setIsTrialMode(enabled);
    
    if (enabled) {
      sessionStorage.setItem('trial-mode-enabled', 'true');
    } else {
      sessionStorage.setItem('trial-mode-dismissed', 'true');
      sessionStorage.removeItem('trial-mode-enabled');
      disconnectTrialWallet();
    }
  };

  const restartTrialMode = () => {
    // Clear ALL trial-related data
    sessionStorage.removeItem('trial-mode-dismissed');
    sessionStorage.removeItem('trial-welcome-shown');
    sessionStorage.removeItem('trial-wallet');
    sessionStorage.removeItem('trial-user');
    sessionStorage.removeItem('trial-mode-enabled');
    
    // Clear all trial profile data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('trial-profile-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reset state
    setMockWallet(null);
    setMockUser(null);
    
    // Restart trial mode fresh
    setIsTrialMode(true);
    connectTrialWallet();
  };

  // Restore trial session on page load
  useEffect(() => {
    if (isTrialMode) {
      const savedWallet = sessionStorage.getItem('trial-wallet');
      const savedUser = sessionStorage.getItem('trial-user');
      
      if (savedWallet && savedUser) {
        setMockWallet(JSON.parse(savedWallet));
        setMockUser(JSON.parse(savedUser));
      }
    }
  }, [isTrialMode]);

  const value: TrialModeContextType = {
    isTrialMode,
    setTrialMode,
    mockWallet,
    mockUser,
    connectTrialWallet,
    disconnectTrialWallet,
    restartTrialMode,
  };

  return (
    <TrialModeContext.Provider value={value}>
      {children}
    </TrialModeContext.Provider>
  );
};
