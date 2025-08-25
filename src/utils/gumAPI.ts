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
    const { data, error } = await supabase.rpc('get_user_gum_stats', {
      p_wallet_address: walletAddress
    });

    if (error) {
      console.error('Error getting gum stats:', error);
      return null;
    }

    return data as GumStats;
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
    const { data, error } = await supabase
      .from('gum_transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting gum transactions:', error);
      return [];
    }

    return data || [];
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
    const { data, error } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('is_active', true)
      .order('source_name');

    if (error) {
      console.error('Error getting gum sources:', error);
      return [];
    }

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
    // First check if the gum_sources table exists and has the source
    const { data: sourceData, error: sourceError } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('source_name', source)
      .single();

    if (sourceError || !sourceData) {
      console.log('⚠️ GUM source not found in database, allowing earn for:', source);
      // If source doesn't exist in database, allow earning (graceful fallback)
      return { canEarn: true, reason: 'Database source not configured, allowing' };
    }

    // Check cooldown record
    const { data, error } = await supabase
      .from('user_gum_cooldowns')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('source_name', source)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking cooldown:', error);
      // On database error, allow earning (graceful fallback)
      return { canEarn: true, reason: 'Database error, allowing earn' };
    }

    if (!data) {
      // No cooldown record means first time earning
      return { canEarn: true };
    }

    const now = new Date();
    const lastEarned = new Date(data.last_earned_at);
    const minutesSinceLastEarn = (now.getTime() - lastEarned.getTime()) / (1000 * 60);
    
    // Check cooldown
    if (minutesSinceLastEarn < sourceData.cooldown_minutes) {
      return {
        canEarn: false,
        cooldownMinutes: Math.ceil(sourceData.cooldown_minutes - minutesSinceLastEarn),
        reason: 'Still in cooldown period'
      };
    }

    // Check daily limit with proper date handling
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const resetDate = new Date(data.daily_reset_date).toISOString().split('T')[0]; // Normalize to YYYY-MM-DD
    
    console.log('📅 Date comparison - Today:', today, 'Reset date:', resetDate);
    
    if (today !== resetDate) {
      // New day, can earn
      console.log('🆕 New day detected - can earn');
      return { canEarn: true };
    }

    // Same day - check if daily limit would be exceeded
    if (sourceData.daily_limit && 
        (data.daily_earned_amount + sourceData.base_reward) > sourceData.daily_limit) {
      return {
        canEarn: false,
        reason: `Daily limit reached (${data.daily_earned_amount}/${sourceData.daily_limit})`
      };
    }

    return { canEarn: true };
  } catch (error) {
    console.error('Error in checkGumCooldown:', error);
    // On any error, allow earning (graceful fallback for development)
    return { canEarn: true, reason: 'Exception occurred, allowing earn' };
  }
}

/**
 * Get user's current gum balance only
 */
export async function getUserGumBalance(walletAddress: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      // No balance record means 0 gum
      return 0;
    }

    return data?.total_gum || 0;
  } catch (error) {
    console.error('Error in getUserGumBalance:', error);
    return 0;
  }
}
