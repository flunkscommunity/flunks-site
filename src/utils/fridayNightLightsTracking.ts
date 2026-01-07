import { supabase, hasValidSupabaseConfig } from '../lib/supabase';

export const trackFridayNightLightsClick = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Friday Night Lights tracking disabled: Supabase not configured');
    return false;
  }

  try {
    console.log('🏈 Tracking Friday Night Lights button click for wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('friday_night_lights_clicks')
      .insert([
        {
          wallet_address: walletAddress,
          clicked_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error tracking Friday Night Lights click:', error);
      return false;
    }

    console.log('✅ Friday Night Lights click tracked successfully');
    return true;
  } catch (err) {
    console.error('Failed to track Friday Night Lights click:', err);
    return false;
  }
};

export const checkFridayNightLightsClicked = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Friday Night Lights check disabled: Supabase not configured');
    return false;
  }

  try {
    console.log('🔍 Checking Friday Night Lights click for wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('friday_night_lights_clicks')
      .select('*')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (error) {
      console.error('Error checking Friday Night Lights click:', error);
      return false;
    }

    const hasClicked = data && data.length > 0;
    console.log('🏈 Friday Night Lights clicked status:', hasClicked);
    return hasClicked;
  } catch (err) {
    console.error('Failed to check Friday Night Lights click:', err);
    return false;
  }
};
