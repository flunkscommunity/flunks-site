import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { handleCors } from '../../utils/corsHeaders';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS for mobile app
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, source } = req.body;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet address required' 
    });
  }

  if (!source || typeof source !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Source name required' 
    });
  }

  try {
    console.log(`🔍 Checking cooldown for wallet ${wallet}, source: ${source}`);
    
    // Get source configuration
    const { data: sourceConfig, error: sourceError } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('source_name', source)
      .eq('is_active', true)
      .single();
    
    if (sourceError || !sourceConfig) {
      return res.status(200).json({
        success: true,
        canEarn: false,
        reason: 'Invalid or inactive source'
      });
    }
    
    // Get user's cooldown record
    const { data: cooldownRecord, error: cooldownError } = await supabase
      .from('user_gum_cooldowns')
      .select('*')
      .eq('wallet_address', wallet)
      .eq('source_name', source)
      .single();
    
    // If no record exists, user can claim
    if (cooldownError?.code === 'PGRST116' || !cooldownRecord) {
      return res.status(200).json({
        success: true,
        canEarn: true,
        reason: 'Ready to claim!'
      });
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const lastResetDate = cooldownRecord.daily_reset_date;
    
    // For daily_checkin and daily_login, use calendar day logic
    if (source === 'daily_checkin' || source === 'daily_login') {
      // If it's a new calendar day, user can claim
      if (lastResetDate !== today) {
        return res.status(200).json({
          success: true,
          canEarn: true,
          reason: 'New day - ready to claim!'
        });
      }
      
      // Same day - check if already claimed today
      if (cooldownRecord.daily_earned_amount > 0) {
        // Calculate time until midnight UTC
        const midnight = new Date(now);
        midnight.setUTCHours(24, 0, 0, 0);
        const minutesUntilMidnight = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60));
        
        return res.status(200).json({
          success: true,
          canEarn: false,
          cooldownMinutes: minutesUntilMidnight,
          reason: 'Already claimed today - resets at midnight UTC'
        });
      }
      
      // Same day but haven't claimed yet
      return res.status(200).json({
        success: true,
        canEarn: true,
        reason: 'Ready to claim!'
      });
    }
    
    // For other sources, use rolling cooldown logic
    const lastEarned = new Date(cooldownRecord.last_earned_at);
    const minutesSinceLastEarn = (now.getTime() - lastEarned.getTime()) / (1000 * 60);
    const cooldownMinutes = sourceConfig.cooldown_minutes || 0;
    
    if (minutesSinceLastEarn >= cooldownMinutes) {
      // Check daily limit
      if (sourceConfig.daily_limit && cooldownRecord.daily_earned_amount >= sourceConfig.daily_limit) {
        return res.status(200).json({
          success: true,
          canEarn: false,
          reason: 'Daily limit reached'
        });
      }
      
      return res.status(200).json({
        success: true,
        canEarn: true,
        reason: 'Ready to claim!'
      });
    }
    
    const remainingMinutes = Math.ceil(cooldownMinutes - minutesSinceLastEarn);
    return res.status(200).json({
      success: true,
      canEarn: false,
      cooldownMinutes: remainingMinutes,
      reason: 'In cooldown period'
    });
    
  } catch (error) {
    console.error('Error checking cooldown:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error checking cooldown'
    });
  }
}
