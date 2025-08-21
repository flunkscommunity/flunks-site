import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    console.log('🔍 Debugging daily login for wallet:', wallet);

    // Check gum sources configuration
    const { data: sourceData, error: sourceError } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('source_name', 'daily_login')
      .single();

    if (sourceError) {
      console.error('Error fetching daily_login source:', sourceError);
    }

    console.log('📊 Daily login source config:', sourceData);

    // Check user cooldown record
    const { data: cooldownData, error: cooldownError } = await supabase
      .from('user_gum_cooldowns')
      .select('*')
      .eq('wallet_address', wallet)
      .eq('source_name', 'daily_login')
      .single();

    if (cooldownError && cooldownError.code !== 'PGRST116') {
      console.error('Error fetching cooldown:', cooldownError);
    }

    console.log('⏰ User cooldown record:', cooldownData);

    // Calculate cooldown status
    let canClaim = true;
    let cooldownMinutes = 0;
    let reason = 'Can claim';

    if (cooldownData && sourceData) {
      const now = new Date();
      const lastEarned = new Date(cooldownData.last_earned_at);
      const minutesSinceLastEarn = (now.getTime() - lastEarned.getTime()) / (1000 * 60);
      
      console.log('🕐 Minutes since last earn:', minutesSinceLastEarn);
      console.log('🕐 Required cooldown minutes:', sourceData.cooldown_minutes);

      if (minutesSinceLastEarn < sourceData.cooldown_minutes) {
        canClaim = false;
        cooldownMinutes = Math.ceil(sourceData.cooldown_minutes - minutesSinceLastEarn);
        reason = 'Still in cooldown period';
      }

      // Check daily limit
      const today = new Date().toDateString();
      const resetDate = new Date(cooldownData.daily_reset_date).toDateString();
      
      console.log('📅 Today:', today);
      console.log('📅 Reset date:', resetDate);
      console.log('💰 Daily earned amount:', cooldownData.daily_earned_amount);
      console.log('💰 Daily limit:', sourceData.daily_limit);

      if (today !== resetDate) {
        console.log('🆕 New day detected - can claim');
        canClaim = true;
      } else if (sourceData.daily_limit && cooldownData.daily_earned_amount >= sourceData.daily_limit) {
        canClaim = false;
        reason = 'Daily limit reached';
      }
    }

    return res.status(200).json({
      success: true,
      canClaim,
      cooldownMinutes,
      reason,
      debug: {
        sourceConfig: sourceData,
        cooldownRecord: cooldownData,
        wallet
      }
    });

  } catch (error) {
    console.error('Error in debug handler:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Debug check failed'
    });
  }
}
