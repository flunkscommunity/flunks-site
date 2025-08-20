// API integration hook for XYZ wallet + Dynamic Labs
import { useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface XYZWalletManager {
  connectXYZWallet: () => Promise<any>;
  getXYZWalletData: () => Promise<any>;
  syncWithDynamic: () => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useXYZWalletManager = (): XYZWalletManager => {
  const { user, primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectXYZWallet = useCallback(async () => {
    if (!user) {
      throw new Error('User must be connected to Dynamic first');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call your API endpoint that handles the XYZ wallet integration
      const response = await fetch('/api/xyz-wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dynamicUserId: user.userId,
          dynamicWalletAddress: primaryWallet?.address,
          // Add your specific XYZ wallet parameters
          xyzWalletParams: {
            // Your XYZ wallet specific data
          }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect XYZ wallet');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, primaryWallet]);

  const getXYZWalletData = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await fetch(`/api/xyz-wallet/data?userId=${user.userId}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error('Failed to get XYZ wallet data:', err);
      return null;
    }
  }, [user]);

  const syncWithDynamic = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // Sync XYZ wallet data with Dynamic's user profile
      const response = await fetch('/api/xyz-wallet/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dynamicUserId: user.userId,
        })
      });

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    connectXYZWallet,
    getXYZWalletData,
    syncWithDynamic,
    isLoading,
    error
  };
};
