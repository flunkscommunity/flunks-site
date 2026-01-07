import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import { getApiUrl } from '../utils/apiBaseUrl';
import { supabase } from '../lib/supabase';

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

    // Normalize address format
    let normalizedAddress = unifiedAddress.trim().toLowerCase();
    if (normalizedAddress.includes(':')) {
      const parts = normalizedAddress.split(':');
      normalizedAddress = parts[parts.length - 1];
    }
    if (!normalizedAddress.startsWith('0x')) {
      normalizedAddress = '0x' + normalizedAddress;
    }

    setLoading(true);
    setError(null);

    try {
      // Try direct Supabase query first (works on mobile without CORS issues)
      if (supabase) {
        console.log('🔑 useLocker: Using direct Supabase query for wallet:', normalizedAddress);
        const { data, error: supaError } = await supabase
          .from('user_profiles')
          .select('locker_number, username, created_at')
          .eq('wallet_address', normalizedAddress)
          .single();

        if (supaError) {
          if (supaError.code === 'PGRST116') {
            // No profile found
            console.log('🔑 useLocker: No locker found for wallet');
            setLockerInfo(null);
            setLoading(false);
            return;
          }
          console.error('🔑 useLocker: Supabase error:', supaError);
          // Fall through to API
        } else if (data) {
          console.log('🔑 useLocker: Locker info from Supabase:', data);
          setLockerInfo({
            locker_number: data.locker_number,
            username: data.username,
            signup_date: data.created_at,
            locker_status: 'Active'
          });
          setLoading(false);
          return;
        }
      }

      // Fallback to API (may have CORS issues on mobile)
      console.log('🔑 useLocker: Falling back to API');
      const response = await fetch(getApiUrl(`/api/locker-info?wallet_address=${normalizedAddress}`));
      
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
      console.error('🔑 useLocker: Error fetching locker info:', err);
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

    // Normalize address format
    let normalizedAddress = unifiedAddress.trim().toLowerCase();
    if (normalizedAddress.includes(':')) {
      const parts = normalizedAddress.split(':');
      normalizedAddress = parts[parts.length - 1];
    }
    if (!normalizedAddress.startsWith('0x')) {
      normalizedAddress = '0x' + normalizedAddress;
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/assign-locker'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: normalizedAddress
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
      const response = await fetch(getApiUrl('/api/locker-stats'));
      
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
