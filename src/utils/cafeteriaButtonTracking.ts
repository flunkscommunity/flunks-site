import { supabase, hasValidSupabaseConfig } from '../lib/supabase';

interface ButtonClickData {
  walletAddress: string;
  username?: string;
}

export const trackCafeteriaButtonClick = async (data: ButtonClickData): Promise<boolean> => {
  // Check if Supabase is configured
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot track button click');
    return false;
  }

  try {
    const { error } = await supabase
      .from('cafeteria_button_clicks')
      .insert({
        wallet_address: data.walletAddress,
        username: data.username || null,
        click_timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking cafeteria button click:', error);
      return false;
    }

    console.log('✅ Successfully tracked cafeteria button click');
    return true;
  } catch (err) {
    console.error('Failed to track cafeteria button click:', err);
    return false;
  }
};

// Function to get button click stats (optional - for analytics)
export const getCafeteriaButtonStats = async () => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot get button stats');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('cafeteria_button_clicks')
      .select('*')
      .order('click_timestamp', { ascending: false })
      .limit(100); // Get last 100 clicks

    if (error) {
      console.error('Error fetching cafeteria button stats:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch cafeteria button stats:', err);
    return null;
  }
};
