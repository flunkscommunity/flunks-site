import { supabase, hasValidSupabaseConfig } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

// Set to true to enable verbose logging for debugging
const DEBUG_TRACKING = false;

/**
 * Pool Game Matchbook Tracking
 * Check if user has defeated The Wizard and earned the matchbook
 */
export async function checkPoolMatchbookEarned(walletAddress: string): Promise<boolean> {
  // First try direct Supabase query
  if (hasValidSupabaseConfig && supabase) {
    try {
      if (DEBUG_TRACKING) console.log('🎱 [MATCHBOOK] Checking via Supabase view for wallet:', walletAddress?.slice(0, 10) + '...');
      
      // Try the wallet_pool_matchbook view first (has public read access)
      const { data: viewData, error: viewError } = await supabase
        .from('wallet_pool_matchbook')
        .select('wallet_address, obtained_at')
        .eq('wallet_address', walletAddress)
        .single();

      if (!viewError && viewData) {
        if (DEBUG_TRACKING) console.log('✅ [MATCHBOOK] View result: true');
        return true;
      }
      
      if (viewError) {
        // PGRST116 = no rows found, which is expected when user hasn't earned it
        if (viewError.code === 'PGRST116') {
          if (DEBUG_TRACKING) console.log('✅ [MATCHBOOK] View result: false (no rows)');
          return false;
        }
        if (DEBUG_TRACKING) console.log('⚠️ [MATCHBOOK] View query error:', viewError.message, '- trying table');
      }
      
      // Fallback to direct table query (may fail due to RLS)
      const { data, error } = await supabase
        .from('pool_game_matchbook')
        .select('id, obtained_at')
        .eq('wallet_address', walletAddress)
        .limit(1);

      if (!error && data) {
        const hasMatchbook = data.length > 0;
        if (DEBUG_TRACKING) console.log('✅ [MATCHBOOK] Table result:', hasMatchbook);
        return hasMatchbook;
      }
      
      if (error) {
        if (DEBUG_TRACKING) console.log('⚠️ [MATCHBOOK] Table query error (RLS?):', error.message);
      }
    } catch (err) {
      if (DEBUG_TRACKING) console.log('⚠️ [MATCHBOOK] Supabase error:', err);
    }
  }

  // Fallback to API
  try {
    if (DEBUG_TRACKING) console.log('🎱 [MATCHBOOK] Checking via API for wallet:', walletAddress?.slice(0, 10) + '...');
    const response = await fetch(getApiUrl(`/api/check-pool-matchbook?walletAddress=${walletAddress}`));
    
    if (!response.ok) {
      console.error('❌ [MATCHBOOK] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    const hasMatchbook = data.success && data.hasMatchbook;
    if (DEBUG_TRACKING) console.log('✅ [MATCHBOOK] API result:', hasMatchbook);
    return hasMatchbook;
  } catch (err) {
    console.error('💥 [MATCHBOOK] Both methods failed:', err);
    return false;
  }
}
