/**
 * useWidgetSync - React Hook for iOS Widget Synchronization
 * 
 * Automatically syncs GUM balance and daily check-in status with iOS widgets
 * 
 * Usage:
 *   const { syncWidget, clearWidget, isWidgetAvailable } = useWidgetSync();
 *   
 *   // Sync data after fetching
 *   useEffect(() => {
 *     if (gumBalance && user) {
 *       syncWidget({
 *         gumBalance,
 *         lockerNumber: user.lockerNumber,
 *         username: user.username,
 *         dailyClaimed: lastCheckIn !== null,
 *         nextClaimMinutes: calculateMinutesUntilNextClaim()
 *       });
 *     }
 *   }, [gumBalance, user, lastCheckIn]);
 */

import { useCallback, useMemo } from 'react';
import { FlunksWidgetBridge, WidgetData } from '@/utils/flunksWidgetBridge';

interface UseWidgetSyncOptions {
  debug?: boolean;
}

export function useWidgetSync(options: UseWidgetSyncOptions = {}) {
  const { debug = false } = options;
  
  const isWidgetAvailable = useMemo(() => {
    return FlunksWidgetBridge.isAvailable();
  }, []);

  /**
   * Sync current data to iOS widget
   */
  const syncWidget = useCallback(async (data: WidgetData) => {
    if (!isWidgetAvailable) {
      if (debug) console.log('[useWidgetSync] Widgets not available on this platform');
      return false;
    }

    const result = await FlunksWidgetBridge.updateWidgetData(data);
    
    if (debug) {
      console.log('[useWidgetSync] Sync result:', result);
    }
    
    return result.success;
  }, [isWidgetAvailable, debug]);

  /**
   * Sync GUM balance specifically (convenience method)
   */
  const syncGumBalance = useCallback(async (
    gumBalance: number,
    lockerNumber: number,
    username: string
  ) => {
    return syncWidget({
      gumBalance,
      lockerNumber,
      username,
      dailyClaimed: false, // Will need to be updated separately
      nextClaimMinutes: 0
    });
  }, [syncWidget]);

  /**
   * Sync daily check-in status
   */
  const syncDailyStatus = useCallback(async (
    gumBalance: number,
    lockerNumber: number,
    username: string,
    dailyClaimed: boolean,
    lastClaimTime?: Date
  ) => {
    let nextClaimMinutes = 0;
    
    if (dailyClaimed && lastClaimTime) {
      // Calculate minutes until next claim (24 hours from last claim)
      const nextClaimTime = new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      nextClaimMinutes = Math.max(0, Math.floor((nextClaimTime.getTime() - now.getTime()) / (60 * 1000)));
    }

    return syncWidget({
      gumBalance,
      lockerNumber,
      username,
      dailyClaimed,
      nextClaimMinutes
    });
  }, [syncWidget]);

  /**
   * Clear widget data (call on logout)
   */
  const clearWidget = useCallback(async () => {
    if (!isWidgetAvailable) return false;
    
    const result = await FlunksWidgetBridge.clearWidgetData();
    
    if (debug) {
      console.log('[useWidgetSync] Widget cleared:', result);
    }
    
    return result.success;
  }, [isWidgetAvailable, debug]);

  /**
   * Force widget refresh
   */
  const refreshWidget = useCallback(async () => {
    if (!isWidgetAvailable) return false;
    
    const result = await FlunksWidgetBridge.refreshWidgets();
    return result.success;
  }, [isWidgetAvailable]);

  return {
    syncWidget,
    syncGumBalance,
    syncDailyStatus,
    clearWidget,
    refreshWidget,
    isWidgetAvailable
  };
}

export default useWidgetSync;
