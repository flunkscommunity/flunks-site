import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';

export interface LockerInfo {
  locker_number: number | null;
  username: string | null;
  signup_date: string;
  locker_status: 'Active' | 'Reserved';
}

export interface LockerStats {
  total_assigned: number;
  active_lockers: number;
  reserved_lockers: number;
  highest_locker_number: number;
  next_locker_number: number;
}

export const useLockerInfo = () => {
  const [lockerInfo, setLockerInfo] = useState<LockerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();

  const fetchLockerInfo = async () => {
    if (!unifiedAddress) {
      setLockerInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locker-info?wallet_address=${unifiedAddress}`);
      
      if (response.status === 404) {
        // User doesn't exist yet - they'll get a locker when they sign up
        setLockerInfo(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch locker info');
      }

      const data = await response.json();
      setLockerInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockerInfo();
  }, [unifiedAddress]);

  return { lockerInfo, loading, error, refetch: fetchLockerInfo };
};

export const useLockerAssignment = () => {
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();

  const assignLocker = async (): Promise<{ success: boolean; locker_number?: number; message?: string }> => {
    if (!unifiedAddress) {
      throw new Error('No wallet connected');
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/assign-locker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: unifiedAddress
        })
      });

      // Handle empty or non-JSON responses
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { error: 'Empty response from server' };
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        throw new Error('Server returned invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign locker');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  return { assignLocker, assigning, error };
};

export const useLockerStats = () => {
  const [stats, setStats] = useState<LockerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/locker-stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch locker stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
