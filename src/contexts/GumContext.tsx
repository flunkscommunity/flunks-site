import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import { 
  getUserGumStats, 
  getUserGumBalance, 
  awardGum,
  spendGum,
  checkGumCooldown,
  type GumStats, 
  type GumAwardResult,
  type GumSpendResult
} from '../utils/gumAPI';
import { autoClaimDailyLogin } from '../services/dailyLoginService';
import { checkForSpecialEvents } from '../services/specialEventsService';
import { useWidgetSync } from '../hooks/useWidgetSync';
import { cancelDailyGumReminder, scheduleDailyGumReminder } from '../utils/dailyGumNotifications';

// Set to true only when debugging GUM issues
const GUM_DEBUG = false;
// Enable debug logging for widget sync
const WIDGET_DEBUG = false;

export interface GumContextType {
  balance: number;
  stats: GumStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshStats: () => Promise<void>;
  earnGum: (source: string, metadata?: any) => Promise<GumAwardResult>;
  spendGum: (amount: number, source: string, metadata?: any) => Promise<GumSpendResult>;
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
  autoRefreshInterval = 300000  // 5 minutes - reduced from 2 min to minimize console noise
}) => {
  const { primaryWallet } = useDynamicContext();
  const auth = useAuth();
  const { profile } = useUserProfile();
  const { syncWidget, clearWidget, isWidgetAvailable } = useWidgetSync({ debug: WIDGET_DEBUG });
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<GumStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBalanceRefresh, setLastBalanceRefresh] = useState<number>(0);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [nextClaimMinutes, setNextClaimMinutes] = useState<number>(0);
  const [lastDailyStatusRefresh, setLastDailyStatusRefresh] = useState<number>(0);
  const lastScheduledDailyReminderAtRef = useRef<number | null>(null);

  // Use auth context for wallet address - more reliable
  const walletAddress = auth.walletAddress || primaryWallet?.address;
  
  // Track if we've done the initial load to prevent duplicate fetches
  const hasInitializedRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshDailyCheckinStatus = useCallback(async () => {
    if (!walletAddress || !auth.isAuthenticated) {
      setDailyClaimed(false);
      setNextClaimMinutes(0);
      return;
    }

    const now = Date.now();
    if (now - lastDailyStatusRefresh < 15000) {
      return;
    }
    setLastDailyStatusRefresh(now);

    try {
      const cooldown = await checkGumCooldown(walletAddress, 'daily_checkin');
      const canEarn = cooldown.canEarn;
      setDailyClaimed(!canEarn);
      setNextClaimMinutes(canEarn ? 0 : (cooldown.cooldownMinutes ?? 0));
    } catch (err) {
      if (GUM_DEBUG) console.warn('🍬 GumProvider: Failed to refresh daily_checkin status:', err);
    }
  }, [walletAddress, auth.isAuthenticated, lastDailyStatusRefresh]);

  // Refresh balance only
  const refreshBalance = useCallback(async () => {
    if (!walletAddress || !auth.isAuthenticated) {
      if (GUM_DEBUG) console.log('🍬 GumProvider: No wallet or not authenticated');
      setBalance(0);
      return;
    }

    // Prevent concurrent refreshes
    if (isRefreshingRef.current) {
      if (GUM_DEBUG) console.log('🍬 GumProvider: Refresh already in progress');
      return;
    }

    // Throttle balance refreshes to max once every 30 seconds
    const now = Date.now();
    if (now - lastBalanceRefresh < 30000) {
      if (GUM_DEBUG) console.log('🍬 GumProvider: Balance refresh throttled');
      return;
    }

    try {
      isRefreshingRef.current = true;
      setError(null);
      if (GUM_DEBUG) console.log('🍬 GumProvider: Fetching balance for wallet:', walletAddress);
      const newBalance = await getUserGumBalance(walletAddress);
      if (GUM_DEBUG) console.log('🍬 GumProvider: Got balance:', newBalance);
      setBalance(newBalance);
      setLastBalanceRefresh(now);

      // Keep widget daily status reasonably fresh when we refresh balance
      refreshDailyCheckinStatus();

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('gumBalanceUpdated', { 
        detail: { balance: newBalance, walletAddress: walletAddress }
      }));
    } catch (err) {
      console.error('🍬 GumProvider: Error refreshing gum balance:', err);
      setError('Failed to refresh balance');
    } finally {
      isRefreshingRef.current = false;
    }
  }, [walletAddress, auth.isAuthenticated, lastBalanceRefresh, refreshDailyCheckinStatus]);
  
  // Refresh full stats
  const refreshStats = useCallback(async () => {
    if (!walletAddress || !auth.isAuthenticated) {
      if (GUM_DEBUG) console.log('🍬 GumProvider: No wallet or not authenticated, clearing stats');
      setStats(null);
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (GUM_DEBUG) console.log('🍬 GumProvider: Fetching stats for wallet:', walletAddress);
      const newStats = await getUserGumStats(walletAddress);
      if (newStats) {
        if (GUM_DEBUG) console.log('🍬 GumProvider: Got stats:', newStats);
        setStats(newStats);
        setBalance(newStats.current_balance);

        refreshDailyCheckinStatus();
        
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

  // Sync iOS widget when balance/status changes
  useEffect(() => {
    if (WIDGET_DEBUG) {
      console.log('📱 Widget sync effect triggered:', {
        isWidgetAvailable,
        walletAddress,
        isAuthenticated: auth.isAuthenticated,
        balance,
        username: profile?.username,
        dailyClaimed,
        nextClaimMinutes
      });
    }
    
    if (!isWidgetAvailable) {
      if (WIDGET_DEBUG) console.log('📱 Widget not available, skipping sync');
      return;
    }
    if (!walletAddress || !auth.isAuthenticated) {
      if (WIDGET_DEBUG) console.log('📱 No wallet or not authenticated, skipping sync');
      return;
    }

    if (WIDGET_DEBUG) {
      console.log('📱 Syncing widget with data:', {
        gumBalance: balance,
        lockerNumber: 0,
        username: profile?.username || 'Anon',
        dailyClaimed,
        nextClaimMinutes,
      });
    }

    void syncWidget({
      gumBalance: balance,
      lockerNumber: 0,
      username: profile?.username || 'Anon',
      dailyClaimed,
      nextClaimMinutes,
    });
  }, [
    isWidgetAvailable,
    walletAddress,
    auth.isAuthenticated,
    balance,
    profile?.username,
    dailyClaimed,
    nextClaimMinutes,
    syncWidget,
  ]);

  // Clear widget when wallet disconnects
  useEffect(() => {
    if (!isWidgetAvailable) return;
    if (walletAddress && auth.isAuthenticated) return;
    void clearWidget();
  }, [isWidgetAvailable, walletAddress, auth.isAuthenticated, clearWidget]);

  // Schedule a local notification for when the next daily claim becomes available.
  useEffect(() => {
    if (!walletAddress || !auth.isAuthenticated) {
      lastScheduledDailyReminderAtRef.current = null;
      void cancelDailyGumReminder();
      return;
    }

    // If claim is available now (or we don't know the cooldown), don't schedule.
    if (!dailyClaimed || nextClaimMinutes <= 0) {
      lastScheduledDailyReminderAtRef.current = null;
      void cancelDailyGumReminder();
      return;
    }

    const fireAtMs = Date.now() + nextClaimMinutes * 60_000;
    const roundedMs = Math.floor(fireAtMs / 60_000) * 60_000;

    if (lastScheduledDailyReminderAtRef.current === roundedMs) return;
    lastScheduledDailyReminderAtRef.current = roundedMs;
    void scheduleDailyGumReminder(new Date(roundedMs));
  }, [walletAddress, auth.isAuthenticated, dailyClaimed, nextClaimMinutes]);

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
        // Play bubble sound when GUM is earned
        if (typeof Audio !== 'undefined') {
          const bubbleSound = new Audio('/sounds/bubble.mp3');
          bubbleSound.volume = 0.5; // Set to 50% volume
          bubbleSound.play().catch(e => console.log('Could not play bubble sound:', e));
        }
        
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

  // Spend gum for purchases/games
  const spendGumFn = useCallback(async (amount: number, source: string, metadata?: any): Promise<GumSpendResult> => {
    if (!walletAddress || !auth.isAuthenticated) {
      return {
        success: false,
        spent: 0,
        error: 'No wallet connected'
      };
    }

    try {
      console.log('🍬 GumProvider: Spending gum:', amount, 'from source:', source, 'for wallet:', walletAddress);
      const result = await spendGum(walletAddress, amount, source, metadata);
      console.log('🍬 GumProvider: Spend result:', result);
      
      if (result.success && result.spent > 0) {
        // Update local balance immediately for responsive UI
        setBalance(prev => Math.max(0, prev - result.spent));
        
        // Dispatch event to update other UI components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
            detail: { 
              spent: result.spent,
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
      console.error('🍬 GumProvider: Error spending gum:', err);
      return {
        success: false,
        spent: 0,
        error: 'Failed to spend gum'
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
  // Only run once per wallet address to prevent infinite loops
  useEffect(() => {
    // Skip if we've already initialized for this wallet
    if (hasInitializedRef.current === walletAddress) {
      return;
    }
    
    if (walletAddress && auth.isAuthenticated) {
      hasInitializedRef.current = walletAddress;
      if (GUM_DEBUG) console.log('🍬 GumProvider: Initial load for wallet:', walletAddress);
      
      // Fetch stats once on connection
      getUserGumStats(walletAddress).then(newStats => {
        if (newStats) {
          setStats(newStats);
          setBalance(newStats.current_balance);
          setLastBalanceRefresh(Date.now());
        }
      }).catch(err => {
        console.error('🍬 GumProvider: Error loading initial stats:', err);
      });
      
      // Auto-claim daily login bonus when wallet connects
      autoClaimDailyLogin(walletAddress).catch(err => {
        if (GUM_DEBUG) console.warn('🍬 Daily login auto-claim failed:', err);
      });
      
      // Check for special events
      checkForSpecialEvents(walletAddress);
    } else if (!walletAddress || !auth.isAuthenticated) {
      // Reset state when wallet disconnects
      hasInitializedRef.current = null;
      if (GUM_DEBUG) console.log('🍬 GumProvider: Wallet disconnected, resetting state');
      setBalance(0);
      setStats(null);
      setError(null);
      setLoading(false);
    }
  }, [walletAddress, auth.isAuthenticated]); // Removed refreshStats, refreshBalance to prevent loops

  // Auto refresh - only when app is visible/active
  useEffect(() => {
    if (!walletAddress || !auth.isAuthenticated || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      // Only refresh if page is visible and user is active
      if (document.visibilityState === 'visible') {
        refreshBalance();
      }
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
    spendGum: spendGumFn,
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
