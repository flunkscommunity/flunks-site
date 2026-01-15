import { supabase, hasValidSupabaseConfig } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

// Set to true to enable verbose logging for debugging
const DEBUG_TRACKING = false;

/**
 * Four Thieves Underground Access Tracking
 * Check if user has discovered the snicklefritz password
 */
export async function checkFourThievesUndergroundAccess(walletAddress: string): Promise<boolean> {
  // First try direct Supabase query
  if (hasValidSupabaseConfig && supabase) {
    try {
      if (DEBUG_TRACKING) console.log('🎰 [UNDERGROUND] Checking via Supabase view for wallet:', walletAddress?.slice(0, 10) + '...');
      
      // Try the wallet_chapter_completions view first (has public read access)
      const { data: viewData, error: viewError } = await supabase
        .from('wallet_chapter_completions')
        .select('has_four_thieves_underground')
        .eq('wallet_address', walletAddress)
        .single();

      if (!viewError && viewData) {
        const hasAccess = viewData.has_four_thieves_underground === true;
        if (DEBUG_TRACKING) console.log('✅ [UNDERGROUND] View result:', hasAccess);
        return hasAccess;
      }
      
      if (viewError) {
        if (DEBUG_TRACKING) console.log('⚠️ [UNDERGROUND] View query error:', viewError.message, '- trying table');
      }
      
      // Fallback to direct table query (may fail due to RLS)
      const { data, error } = await supabase
        .from('four_thieves_underground_access')
        .select('id, access_timestamp')
        .eq('wallet_address', walletAddress)
        .limit(1);

      if (!error && data) {
        const hasAccess = data.length > 0;
        if (DEBUG_TRACKING) console.log('✅ [UNDERGROUND] Table result:', hasAccess);
        return hasAccess;
      }
      
      if (error) {
        if (DEBUG_TRACKING) console.log('⚠️ [UNDERGROUND] Table query error (RLS?):', error.message);
      }
    } catch (err) {
      if (DEBUG_TRACKING) console.log('⚠️ [UNDERGROUND] Supabase error:', err);
    }
  }

  // Fallback to API
  try {
    if (DEBUG_TRACKING) console.log('🎰 [UNDERGROUND] Checking via API for wallet:', walletAddress?.slice(0, 10) + '...');
    const response = await fetch(getApiUrl(`/api/check-four-thieves-underground?walletAddress=${walletAddress}`));
    
    if (!response.ok) {
      console.error('❌ [UNDERGROUND] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    const hasAccess = data.success && data.hasAccess;
    if (DEBUG_TRACKING) console.log('✅ [UNDERGROUND] API result:', hasAccess);
    return hasAccess;
  } catch (err) {
    console.error('💥 [UNDERGROUND] Both methods failed:', err);
    return false;
  }
}
