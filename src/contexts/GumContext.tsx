import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { 
  getUserGumStats, 
  getUserGumBalance, 
  awardGum,
  type GumStats, 
  type GumAwardResult 
} from '../utils/gumAPI';

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
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<GumStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh balance only
  const refreshBalance = useCallback(async () => {
    if (!primaryWallet?.address) {
      setBalance(0);
      return;
    }

    try {
      setError(null);
      const newBalance = await getUserGumBalance(primaryWallet.address);
      setBalance(newBalance);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('gumBalanceUpdated', { 
        detail: { balance: newBalance, walletAddress: primaryWallet.address }
      }));
    } catch (err) {
      console.error('Error refreshing gum balance:', err);
      setError('Failed to refresh balance');
    }
  }, [primaryWallet?.address]);

  // Refresh full stats
  const refreshStats = useCallback(async () => {
    if (!primaryWallet?.address) {
      setStats(null);
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newStats = await getUserGumStats(primaryWallet.address);
      if (newStats) {
        setStats(newStats);
        setBalance(newStats.current_balance);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('gumStatsUpdated', { 
          detail: { stats: newStats, walletAddress: primaryWallet.address }
        }));
      }
    } catch (err) {
      console.error('Error refreshing gum stats:', err);
      setError('Failed to refresh stats');
    } finally {
      setLoading(false);
    }
  }, [primaryWallet?.address]);

  // Earn gum from a source
  const earnGum = useCallback(async (source: string, metadata?: any): Promise<GumAwardResult> => {
    if (!primaryWallet?.address) {
      return {
        success: false,
        earned: 0,
        error: 'No wallet connected'
      };
    }

    try {
      const result = await awardGum(primaryWallet.address, source, metadata);
      
      if (result.success && result.earned > 0) {
        // Update local balance immediately for responsive UI
        setBalance(prev => prev + result.earned);
        
        // Refresh full data in background
        setTimeout(() => {
          refreshBalance();
        }, 100);
      }
      
      return result;
    } catch (err) {
      console.error('Error earning gum:', err);
      return {
        success: false,
        earned: 0,
        error: 'Failed to earn gum'
      };
    }
  }, [primaryWallet?.address, refreshBalance]);

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

  // Initial load when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      refreshStats();
    } else {
      // Reset state when wallet disconnects
      setBalance(0);
      setStats(null);
      setError(null);
      setLoading(false);
    }
  }, [primaryWallet?.address, refreshStats]);

  // Auto refresh
  useEffect(() => {
    if (!primaryWallet?.address || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [primaryWallet?.address, autoRefreshInterval, refreshBalance]);

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
