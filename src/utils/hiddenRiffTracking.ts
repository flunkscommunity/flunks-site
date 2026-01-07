import { supabase, hasValidSupabaseConfig } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

/**
 * Check if user has completed the Hidden Riff guitar sequence
 * Checks the wallet_chapter_completions view (or gum_transactions fallback)
 */
export async function checkHiddenRiffCompletion(walletAddress: string): Promise<boolean> {
  // First try direct Supabase query using the public view
  if (hasValidSupabaseConfig && supabase) {
    try {
      console.log('🎸 [HIDDEN_RIFF] Checking via Supabase view for wallet:', walletAddress?.slice(0, 10) + '...');
      
      // Try the wallet_chapter_completions view first (has public read access)
      const { data: viewData, error: viewError } = await supabase
        .from('wallet_chapter_completions')
        .select('has_hidden_riff')
        .eq('wallet_address', walletAddress)
        .single();

      if (!viewError && viewData) {
        const hasCompleted = viewData.has_hidden_riff === true;
        console.log('✅ [HIDDEN_RIFF] View result:', hasCompleted);
        return hasCompleted;
      }
      
      // View might not exist or no data, log the error
      if (viewError) {
        console.log('⚠️ [HIDDEN_RIFF] View query error:', viewError.message, '- trying gum_transactions');
      }
      
      // Fallback to gum_transactions table (may fail due to RLS)
      const { data, error } = await supabase
        .from('gum_transactions')
        .select('id')
        .eq('wallet_address', walletAddress)
        .eq('source', 'hidden_riff')
        .limit(1);

      if (!error && data) {
        const hasCompleted = data.length > 0;
        console.log('✅ [HIDDEN_RIFF] Table result:', hasCompleted);
        return hasCompleted;
      }
      
      if (error) {
        console.log('⚠️ [HIDDEN_RIFF] Table query error (RLS?):', error.message);
      }
    } catch (err) {
      console.log('⚠️ [HIDDEN_RIFF] Supabase error:', err);
    }
  }

  // Fallback to API
  try {
    console.log('🎸 [HIDDEN_RIFF] Checking via API for wallet:', walletAddress?.slice(0, 10) + '...');
    const response = await fetch(getApiUrl(`/api/check-hidden-riff?walletAddress=${walletAddress}`));
    
    if (!response.ok) {
      console.error('❌ [HIDDEN_RIFF] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    const hasCompleted = data.success && data.hasCompleted;
    console.log('✅ [HIDDEN_RIFF] API result:', hasCompleted);
    return hasCompleted;
  } catch (err) {
    console.error('💥 [HIDDEN_RIFF] Both methods failed:', err);
    return false;
  }
}
