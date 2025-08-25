import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAuth } from './AuthContext';
import { 
  getUserGumStats, 
  getUserGumBalance, 
  awardGum,
  type GumStats, 
  type GumAwardResult 
} from '../utils/gumAPI';
import { autoClaimDailyLogin } from '../services/dailyLoginService';
import { checkForSpecialEvents } from '../services/specialEventsService';

export interface GumContextType {
  balance: number;
  stats: GumStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshStats: () => Promise<void>;
  earnGum: (source: string, metadata?: any) => Promise<GumAwardResult>;
  updateBalance: (newBalance: number) => void;
  
  // Helper functions
  formatGumAmount: (amount: number) => string;
  canAfford: (cost: number) => boolean;
}

const GumContext = createContext<GumContextType | null>(null);

export const useGum = (): GumContextType => {
  const context = useContext(GumContext);
  if (!context) {
    throw new Error('useGum must be used within a GumProvider');
  }
  return context;
};

interface GumProviderProps {
  children: React.ReactNode;
  autoRefreshInterval?: number;
}

export const GumProvider: React.FC<GumProviderProps> = ({ 
  children, 
  autoRefreshInterval = 30000 
}) => {
  const { primaryWallet } = useDynamicContext();
  const auth = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<GumStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use auth context for wallet address - more reliable
  const walletAddress = auth.walletAddress || primaryWallet?.address;

  // Refresh balance only
  const refreshBalance = useCallback(async () => {
    if (!walletAddress || !auth.isAuthenticated) {
      console.log('🍬 GumProvider: No wallet address or not authenticated, setting balance to 0');
      setBalance(0);
      return;
    }

    try {
      setError(null);
      console.log('🍬 GumProvider: Fetching balance for wallet:', walletAddress);
      const newBalance = await getUserGumBalance(walletAddress);
      console.log('🍬 GumProvider: Got balance:', newBalance);
      setBalance(newBalance);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('gumBalanceUpdated', { 
        detail: { balance: newBalance, walletAddress: walletAddress }
      }));
    } catch (err) {
      console.error('🍬 GumProvider: Error refreshing gum balance:', err);
      setError('Failed to refresh balance');
    }
  }, [walletAddress, auth.isAuthenticated]);

  // Refresh full stats
  const refreshStats = useCallback(async () => {
    if (!walletAddress || !auth.isAuthenticated) {
      console.log('🍬 GumProvider: No wallet address or not authenticated, clearing stats');
      setStats(null);
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🍬 GumProvider: Fetching stats for wallet:', walletAddress);
      const newStats = await getUserGumStats(walletAddress);
      if (newStats) {
        console.log('🍬 GumProvider: Got stats:', newStats);
        setStats(newStats);
        setBalance(newStats.current_balance);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('gumStatsUpdated', { 
          detail: { stats: newStats, walletAddress: walletAddress }
        }));
      }
    } catch (err) {
      console.error('🍬 GumProvider: Error refreshing gum stats:', err);
      setError('Failed to refresh stats');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, auth.isAuthenticated]);

  // Earn gum from a source
  const earnGum = useCallback(async (source: string, metadata?: any): Promise<GumAwardResult> => {
    if (!walletAddress || !auth.isAuthenticated) {
      return {
        success: false,
        earned: 0,
        error: 'No wallet connected'
      };
    }

    try {
      console.log('🍬 GumProvider: Awarding gum from source:', source, 'to wallet:', walletAddress);
      const result = await awardGum(walletAddress, source, metadata);
      console.log('🍬 GumProvider: Award result:', result);
      
      if (result.success && result.earned > 0) {
        // Update local balance immediately for responsive UI
        setBalance(prev => prev + result.earned);
        
        // Dispatch event to update other UI components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
            detail: { 
              earned: result.earned,
              walletAddress,
              source
            }
          }));
        }
        
        // Refresh full data in background
        setTimeout(() => {
          refreshBalance();
        }, 100);
      }
      
      return result;
    } catch (err) {
      console.error('🍬 GumProvider: Error earning gum:', err);
      return {
        success: false,
        earned: 0,
        error: 'Failed to earn gum'
      };
    }
  }, [walletAddress, auth.isAuthenticated, refreshBalance]);

  // Update balance manually (for optimistic updates)
  const updateBalance = useCallback((newBalance: number) => {
    setBalance(newBalance);
  }, []);

  // Format gum amounts for display
  const formatGumAmount = useCallback((amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString();
  }, []);

  // Check if user can afford a cost
  const canAfford = useCallback((cost: number): boolean => {
    return balance >= cost;
  }, [balance]);

  // Initial load when wallet connects - use auth context
  useEffect(() => {
    if (walletAddress && auth.isAuthenticated) {
      console.log('🍬 GumProvider: Wallet connected, loading GUM data for:', walletAddress);
      refreshStats();
      
      // Auto-claim daily login bonus when wallet connects
      autoClaimDailyLogin(walletAddress).then(() => {
        // Refresh balance after potential daily login claim
        setTimeout(() => {
          refreshBalance();
          // Dispatch event to update tracking displays
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
              detail: { 
                walletAddress,
                source: 'auto_daily_login_complete'
              }
            }));
          }
        }, 1000);
      }).catch(err => {
        console.warn('🍬 Daily login auto-claim failed (this is normal on first connection):', err);
      });
      
      // Check for special events
      checkForSpecialEvents(walletAddress);
    } else {
      // Reset state when wallet disconnects
      console.log('🍬 GumProvider: Wallet disconnected, resetting GUM state');
      setBalance(0);
      setStats(null);
      setError(null);
      setLoading(false);
    }
  }, [walletAddress, auth.isAuthenticated, refreshStats, refreshBalance]);

  // Auto refresh
  useEffect(() => {
    if (!walletAddress || !auth.isAuthenticated || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [walletAddress, auth.isAuthenticated, autoRefreshInterval, refreshBalance]);

  // Listen for external gum updates
  useEffect(() => {
    const handleExternalUpdate = () => {
      refreshBalance();
    };

    window.addEventListener('gumEarned', handleExternalUpdate);
    window.addEventListener('gumSpent', handleExternalUpdate);
    
    return () => {
      window.removeEventListener('gumEarned', handleExternalUpdate);
      window.removeEventListener('gumSpent', handleExternalUpdate);
    };
  }, [refreshBalance]);

  const contextValue: GumContextType = {
    balance,
    stats,
    loading,
    error,
    refreshBalance,
    refreshStats,
    earnGum,
    updateBalance,
    formatGumAmount,
    canAfford
  };

  return (
    <GumContext.Provider value={contextValue}>
      {children}
    </GumContext.Provider>
  );
};
