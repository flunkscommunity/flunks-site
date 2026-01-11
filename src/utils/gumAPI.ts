import { supabase } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

// Set to true only when debugging GUM API issues
const GUM_API_DEBUG = false;

/**
 * Normalize a Flow address to standard format (0x + 16 hex chars lowercase)
 */
function normalizeFlowAddress(address: string): string {
  if (!address) return '';
  
  let normalized = address.trim().toLowerCase();
  
  // Handle CAIP-10 format (e.g., "flow:mainnet:0x123...")
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    normalized = parts[parts.length - 1];
  }
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = '0x' + normalized;
  }
  
  return normalized;
}

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
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    const { data, error } = await supabase.rpc('award_gum', {
      p_wallet_address: normalizedAddress,
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
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    const url = getApiUrl('/api/gum-stats');
    if (GUM_API_DEBUG) console.log('🔍 getUserGumStats: Fetching', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: normalizedAddress })
    });

    if (!response.ok) {
      console.error('Error getting gum stats:', response.status, response.statusText);
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
    console.error('Error in getUserGumStats:', error instanceof Error ? error.message : error);
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
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    
    // Try direct Supabase query first (works on mobile without CORS issues)
    if (supabase) {
      if (GUM_API_DEBUG) console.log('🔍 getUserGumTransactions: Using direct Supabase query');
      const { data, error } = await supabase
        .from('gum_transactions')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('🔍 getUserGumTransactions: Supabase error:', error);
        // Fall through to API
      } else {
        if (GUM_API_DEBUG) console.log('🔍 getUserGumTransactions: Got', data?.length || 0, 'transactions from Supabase');
        return data || [];
      }
    }
    
    // Fallback to API (may have CORS issues on mobile)
    const url = getApiUrl('/api/gum-transactions');
    if (GUM_API_DEBUG) console.log('🔍 getUserGumTransactions: Fetching', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: normalizedAddress, limit, offset })
    });

    if (!response.ok) {
      console.error('Error getting gum transactions:', response.status, response.statusText);
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
    console.error('Error in getUserGumTransactions:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Get all available gum sources
 */
export async function getGumSources(): Promise<GumSource[]> {
  try {
    const response = await fetch(getApiUrl('/api/gum-sources'), {
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
 * Uses direct Supabase query for mobile compatibility
 */
export async function checkGumCooldown(
  walletAddress: string,
  source: string
): Promise<{ canEarn: boolean; cooldownMinutes?: number; reason?: string }> {
  const normalizedAddress = normalizeFlowAddress(walletAddress);
  
  // First try direct Supabase query
  if (supabase) {
    try {
      if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Using Supabase for', source);
      
      // Get source configuration
      const { data: sourceConfig, error: sourceError } = await supabase
        .from('gum_sources')
        .select('*')
        .eq('source_name', source)
        .eq('is_active', true)
        .single();
      
      if (sourceError || !sourceConfig) {
        if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Invalid or inactive source');
        return { canEarn: false, reason: 'Invalid or inactive source' };
      }
      
      // Get user's cooldown record
      const { data: cooldownRecord, error: cooldownError } = await supabase
        .from('user_gum_cooldowns')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .eq('source_name', source)
        .single();
      
      // If no record exists, user can claim
      if (cooldownError?.code === 'PGRST116' || !cooldownRecord) {
        if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: No record, can claim');
        return { canEarn: true, reason: 'Ready to claim!' };
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format (UTC)
      const lastResetDate = cooldownRecord.daily_reset_date;
      
      // Debug logging for date comparison (only when debugging)
      if (GUM_API_DEBUG) {
        console.log('🔍 checkGumCooldown DATE DEBUG:', {
          source,
          todayUTC: today,
          lastResetDate,
          dailyEarnedAmount: cooldownRecord.daily_earned_amount,
          lastEarnedAt: cooldownRecord.last_earned_at
        });
      }
      
      // For daily_checkin and daily_login, use calendar day logic
      if (source === 'daily_checkin' || source === 'daily_login') {
        // If it's a new calendar day (comparing UTC dates), user can claim
        // Handle case where lastResetDate might be in different format
        const normalizedLastReset = lastResetDate ? String(lastResetDate).split('T')[0] : null;
        
        if (!normalizedLastReset || normalizedLastReset !== today) {
          if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: New day detected!', { normalizedLastReset, today });
          return { canEarn: true, reason: 'New day - ready to claim!' };
        }
        
        // Same day - check if already claimed today
        if (cooldownRecord.daily_earned_amount > 0) {
          // Calculate time until midnight UTC
          const midnight = new Date(now);
          midnight.setUTCHours(24, 0, 0, 0);
          const minutesUntilMidnight = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60));
          
          if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Already claimed today');
          return {
            canEarn: false,
            cooldownMinutes: minutesUntilMidnight,
            reason: 'Already claimed today - resets at midnight UTC'
          };
        }
        
        // Same day but haven't claimed yet
        if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Same day, can still claim');
        return { canEarn: true, reason: 'Ready to claim!' };
      }
      
      // For other sources, use rolling cooldown logic
      const lastEarned = new Date(cooldownRecord.last_earned_at);
      const minutesSinceLastEarn = (now.getTime() - lastEarned.getTime()) / (1000 * 60);
      const cooldownMinutes = sourceConfig.cooldown_minutes || 0;
      
      if (minutesSinceLastEarn >= cooldownMinutes) {
        // Check daily limit
        if (sourceConfig.daily_limit && cooldownRecord.daily_earned_amount >= sourceConfig.daily_limit) {
          return { canEarn: false, reason: 'Daily limit reached' };
        }
        return { canEarn: true, reason: 'Ready to claim!' };
      }
      
      const remainingMinutes = Math.ceil(cooldownMinutes - minutesSinceLastEarn);
      return { canEarn: false, cooldownMinutes: remainingMinutes, reason: 'In cooldown period' };
      
    } catch (supabaseError) {
      if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Supabase error, trying API fallback');
    }
  }
  
  // Fallback to API
  try {
    const url = getApiUrl('/api/check-gum-cooldown');
    if (GUM_API_DEBUG) console.log('🔍 checkGumCooldown: Fetching', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: normalizedAddress, source })
    });

    if (!response.ok) {
      console.error('Error checking gum cooldown:', response.status, response.statusText);
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
      return { canEarn: true, reason: 'API error, allowing earn' };
    }
  } catch (error) {
    console.error('Error in checkGumCooldown:', error instanceof Error ? error.message : error);
    return { canEarn: true, reason: 'Exception occurred, allowing earn' };
  }
}

/**
 * Get user's current gum balance only - Direct database query
 */
export async function getUserGumBalance(walletAddress: string): Promise<number> {
  if (GUM_API_DEBUG) console.log('🍬 getUserGumBalance called with:', walletAddress);
  try {
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    if (GUM_API_DEBUG) console.log('🍬 getUserGumBalance normalized address:', normalizedAddress);
    
    // Check if supabase client is available
    if (!supabase) {
      console.error('🍬 Supabase client is not initialized!');
      return 0;
    }
    
    const { data, error } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', normalizedAddress)
      .single();

    if (GUM_API_DEBUG) console.log('🍬 getUserGumBalance result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return 0
        if (GUM_API_DEBUG) console.log('🍬 No GUM record found for wallet, returning 0');
        return 0;
      }
      console.error('Error getting gum balance from database:', error);
      return 0;
    }

    if (GUM_API_DEBUG) console.log('🍬 getUserGumBalance returning:', data?.total_gum || 0);
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
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    const response = await fetch(getApiUrl('/api/gum-balance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: normalizedAddress })
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

export interface GumSpendResult {
  success: boolean;
  spent: number;
  previous_balance?: number;
  new_balance?: number;
  source?: string;
  error?: string;
}

/**
 * Spend gum from user's balance for purchases/games
 */
export async function spendGum(
  walletAddress: string,
  amount: number,
  source: string,
  metadata?: any
): Promise<GumSpendResult> {
  try {
    const response = await fetch(getApiUrl('/api/spend-gum'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: walletAddress,
        amount,
        source,
        metadata
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error spending gum:', result);
      return {
        success: false,
        spent: 0,
        error: result.error || 'Failed to spend gum'
      };
    }

    return result as GumSpendResult;
  } catch (error) {
    console.error('Error in spendGum:', error);
    return {
      success: false,
      spent: 0,
      error: 'Failed to spend gum'
    };
  }
}
