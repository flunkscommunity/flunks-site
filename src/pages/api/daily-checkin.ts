import { NextApiRequest, NextApiResponse } from 'next';
import { awardGum } from '../../utils/gumAPI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.body;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet address required' 
    });
  }

  try {
    // Award daily check-in bonus using the separate daily_checkin source
    const result = await awardGum(wallet, 'daily_checkin', {
      source: 'locker_checkin_button',
      timestamp: new Date().toISOString()
    });

    if (result.success && result.earned > 0) {
      return res.status(200).json({
        success: true,
        earned: result.earned,
        message: `Daily bonus claimed: +${result.earned} GUM!`
      });
    } else if (result.cooldown_remaining_minutes && result.cooldown_remaining_minutes > 0) {
      const hours = Math.floor(result.cooldown_remaining_minutes / 60);
      const minutes = Math.floor(result.cooldown_remaining_minutes % 60);
      
      return res.status(200).json({
        success: false,
        message: `Daily bonus already claimed! Come back in ${hours}h ${minutes}m`
      });
    } else {
      return res.status(200).json({
        success: false,
        message: result.error || 'Unable to claim daily bonus right now'
      });
    }
  } catch (error) {
    console.error('Daily check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
