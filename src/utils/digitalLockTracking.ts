import { supabase } from '../lib/supabase';

export interface DigitalLockAttempt {
  id: number;
  wallet_address: string;
  username: string | null;
  code_entered: string;
  success: boolean;
  attempt_timestamp: string;
  created_at: string;
}

export interface DigitalLockStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  uniqueUsers: number;
  recentAttempts: DigitalLockAttempt[];
}

/**
 * Track a digital lock attempt in Supabase
 * @param walletAddress - User's wallet address
 * @param username - User's username (optional)
 * @param codeEntered - The 4-digit code they entered
 * @param success - Whether the attempt was successful
 */
export const trackDigitalLockAttempt = async (
  walletAddress: string,
  username: string | null,
  codeEntered: string,
  success: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('digital_lock_attempts')
      .insert([
        {
          wallet_address: walletAddress,
          username: username,
          code_entered: codeEntered,
          success: success,
        }
      ]);

    if (error) {
      console.error('Error tracking digital lock attempt:', error);
    }
  } catch (error) {
    console.error('Error tracking digital lock attempt:', error);
  }
};

/**
 * Get digital lock attempt statistics
 */
export const getDigitalLockStats = async (): Promise<DigitalLockStats | null> => {
  try {
    // Get all attempts
    const { data: allAttempts, error: allError } = await supabase
      .from('digital_lock_attempts')
      .select('*')
      .order('attempt_timestamp', { ascending: false });

    if (allError) {
      console.error('Error fetching digital lock stats:', allError);
      return null;
    }

    if (!allAttempts) return null;

    // Calculate statistics
    const totalAttempts = allAttempts.length;
    const successfulAttempts = allAttempts.filter(attempt => attempt.success).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    const uniqueUsers = new Set(allAttempts.map(attempt => attempt.wallet_address)).size;
    const recentAttempts = allAttempts.slice(0, 10); // Last 10 attempts

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      successRate: Math.round(successRate * 100) / 100,
      uniqueUsers,
      recentAttempts,
    };
  } catch (error) {
    console.error('Error fetching digital lock stats:', error);
    return null;
  }
};

/**
 * Get attempts for a specific user
 */
export const getUserDigitalLockAttempts = async (
  walletAddress: string
): Promise<DigitalLockAttempt[]> => {
  try {
    const { data, error } = await supabase
      .from('digital_lock_attempts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('attempt_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching user digital lock attempts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user digital lock attempts:', error);
    return [];
  }
};

/**
 * Check if user has successfully unlocked the door before
 */
export const hasUserUnlockedBefore = async (walletAddress: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('digital_lock_attempts')
      .select('id')
      .eq('wallet_address', walletAddress)
      .eq('success', true)
      .limit(1);

    if (error) {
      console.error('Error checking if user unlocked before:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Error checking if user unlocked before:', error);
    return false;
  }
};
