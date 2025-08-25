import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

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
    console.log(`📊 Getting GUM stats for wallet: ${wallet}`);
    
    const { data, error } = await supabase.rpc('get_user_gum_stats', {
      p_wallet_address: wallet
    });

    if (error) {
      console.error('Error fetching GUM stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch GUM stats',
        details: error.message
      });
    }

    console.log(`✅ Stats for ${wallet}:`, data);
    
    return res.status(200).json({
      success: true,
      stats: data,
      wallet
    });
  } catch (error) {
    console.error('Error in gum-stats API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error getting stats'
    });
  }
}
