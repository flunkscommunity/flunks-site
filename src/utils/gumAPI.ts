import { supabase } from '../lib/supabase';

export interface GumStats {
  current_balance: number;
  total_earned: number;
  total_spent: number;
  wallet_address: string;
}

export interface GumAwardResult {
  success: boolean;
  earned: number;
  source?: string;
  cooldown_minutes?: number;
  daily_limit?: number;
  error?: string;
  cooldown_remaining_minutes?: number;
}

export interface GumTransaction {
  id: number;
  wallet_address: string;
  transaction_type: string;
  amount: number;
  source: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface GumSource {
  id: number;
  source_name: string;
  base_reward: number;
  cooldown_minutes: number;
  daily_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Award gum to a user from a specific source
 */
export async function awardGum(
  walletAddress: string,
  source: string,
  metadata?: any
): Promise<GumAwardResult> {
  try {
    const { data, error } = await supabase.rpc('award_gum', {
      p_wallet_address: walletAddress,
      p_source: source,
      p_metadata: metadata || null
    });

    if (error) {
      console.error('Error awarding gum:', error);
      return {
        success: false,
        earned: 0,
        error: error.message
      };
    }

    return data as GumAwardResult;
  } catch (error) {
    console.error('Error in awardGum:', error);
    return {
      success: false,
      earned: 0,
      error: 'Failed to award gum'
    };
  }
}

/**
 * Get user's gum statistics
 */
export async function getUserGumStats(walletAddress: string): Promise<GumStats | null> {
  try {
    const response = await fetch('/api/gum-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress })
    });

    if (!response.ok) {
      console.error('Error getting gum stats:', response.status);
      return null;
    }

    const result = await response.json();
    
    if (result.success) {
      return result.stats as GumStats;
    } else {
      console.error('Error getting gum stats:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error in getUserGumStats:', error);
    return null;
  }
}

/**
 * Get user's gum transaction history
 */
export async function getUserGumTransactions(
  walletAddress: string,
  limit: number = 50,
  offset: number = 0
): Promise<GumTransaction[]> {
  try {
    const response = await fetch('/api/gum-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress, limit, offset })
    });

    if (!response.ok) {
      console.error('Error getting gum transactions:', response.status);
      return [];
    }

    const result = await response.json();
    
    if (result.success) {
      return result.transactions || [];
    } else {
      console.error('Error getting gum transactions:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error in getUserGumTransactions:', error);
    return [];
  }
}

/**
 * Get all available gum sources
 */
export async function getGumSources(): Promise<GumSource[]> {
  try {
    const response = await fetch('/api/gum-sources', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Error getting gum sources:', response.status);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error in getGumSources:', error);
    return [];
  }
}

/**
 * Check if user can earn from a specific source (without awarding)
 */
export async function checkGumCooldown(
  walletAddress: string,
  source: string
): Promise<{ canEarn: boolean; cooldownMinutes?: number; reason?: string }> {
  try {
    const response = await fetch('/api/check-gum-cooldown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress, source })
    });

    if (!response.ok) {
      console.error('Error checking gum cooldown:', response.status);
      // On API error, allow earning (graceful fallback)
      return { canEarn: true, reason: 'API error, allowing earn' };
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        canEarn: result.canEarn,
        cooldownMinutes: result.cooldownMinutes,
        reason: result.reason
      };
    } else {
      console.error('Error checking gum cooldown:', result.error);
      // On API error, allow earning (graceful fallback)
      return { canEarn: true, reason: 'API error, allowing earn' };
    }
  } catch (error) {
    console.error('Error in checkGumCooldown:', error);
    // On any error, allow earning (graceful fallback for development)
    return { canEarn: true, reason: 'Exception occurred, allowing earn' };
  }
}

/**
 * Get user's current gum balance only - Direct database query
 */
export async function getUserGumBalance(walletAddress: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return 0
        return 0;
      }
      console.error('Error getting gum balance from database:', error);
      return 0;
    }

    return data?.total_gum || 0;
  } catch (error) {
    console.error('Error in getUserGumBalance:', error);
    return 0;
  }
}

/**
 * Get user's current gum balance via API (for frontend use)
 */
export async function getUserGumBalanceAPI(walletAddress: string): Promise<number> {
  try {
    const response = await fetch('/api/gum-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress })
    });

    if (!response.ok) {
      console.error('Error getting gum balance:', response.status);
      return 0;
    }

    const result = await response.json();
    
    if (result.success) {
      return result.balance || 0;
    } else {
      console.error('Error getting gum balance:', result.error);
      return 0;
    }
  } catch (error) {
    console.error('Error in getUserGumBalanceAPI:', error);
    return 0;
  }
}
