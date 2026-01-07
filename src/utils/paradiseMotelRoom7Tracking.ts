import { supabase, hasValidSupabaseConfig } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

/**
 * Check if user has visited Paradise Motel Room 7 at night
 * Uses wallet_chapter_completions view with table/API fallback
 */
export async function checkParadiseMotelRoom7NightVisit(walletAddress: string): Promise<boolean> {
  // First try direct Supabase query
  if (hasValidSupabaseConfig && supabase) {
    try {
      console.log('🌙 [ROOM7] Checking via Supabase view for wallet:', walletAddress?.slice(0, 10) + '...');
      
      // Try the wallet_chapter_completions view first (has public read access)
      const { data: viewData, error: viewError } = await supabase
        .from('wallet_chapter_completions')
        .select('has_paradise_motel_room7')
        .eq('wallet_address', walletAddress)
        .single();

      if (!viewError && viewData) {
        const hasVisited = viewData.has_paradise_motel_room7 === true;
        console.log('✅ [ROOM7] View result:', hasVisited);
        return hasVisited;
      }
      
      if (viewError) {
        console.log('⚠️ [ROOM7] View query error:', viewError.message, '- trying table');
      }
      
      // Fallback to direct table query
      const { data, error } = await supabase
        .from('paradise_motel_room7_keys')
        .select('id, obtained_at')
        .eq('wallet_address', walletAddress)
        .limit(1);

      if (!error && data) {
        const hasVisited = data.length > 0;
        console.log('✅ [ROOM7] Table result:', hasVisited);
        return hasVisited;
      }
      
      if (error) {
        console.log('⚠️ [ROOM7] Table query error (RLS?):', error.message);
      }
    } catch (err) {
      console.log('⚠️ [ROOM7] Supabase error:', err);
    }
  }

  // Fallback to API
  try {
    console.log('🌙 [ROOM7] Checking via API for wallet:', walletAddress?.slice(0, 10) + '...');
    const response = await fetch(getApiUrl(`/api/check-paradise-motel-room7?walletAddress=${walletAddress}`));
    
    if (!response.ok) {
      console.error('❌ [ROOM7] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    const hasVisited = data.success && data.hasVisited;
    console.log('✅ [ROOM7] API result:', hasVisited);
    return hasVisited;
  } catch (err) {
    console.error('💥 [ROOM7] Both methods failed:', err);
    return false;
  }
}
