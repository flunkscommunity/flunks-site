import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

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

  const fetchLockerInfo = async () => {
    if (!primaryWallet?.address) {
      setLockerInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locker-info?wallet_address=${primaryWallet.address}`);
      
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
  }, [primaryWallet?.address]);

  return { lockerInfo, loading, error, refetch: fetchLockerInfo };
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
