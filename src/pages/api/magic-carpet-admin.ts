import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

// Admin wallets that can access magic carpet statistics
const ADMIN_WALLETS = [
  '0xe327216d843357f1', // Main admin wallet
  // Add more admin wallets here as needed
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet, action, limit } = req.query;

    // Verify admin access
    if (!wallet || !ADMIN_WALLETS.includes(wallet as string)) {
      return res.status(403).json({ error: 'Access denied - admin wallet required' });
    }

    if (action === 'stats') {
      // Get comprehensive statistics
      const { data, error } = await supabase.rpc('get_magic_carpet_stats');
      
      if (error) {
        console.error('Error getting magic carpet stats:', error);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      return res.status(200).json({
        success: true,
        stats: data[0] || {
          total_uses: 0,
          unique_users: 0,
          admin_uses: 0,
          beta_uses: 0,
          community_uses: 0,
          today_uses: 0,
          this_week_uses: 0
        }
      });

    } else if (action === 'recent') {
      // Get recent command usage
      const limitCount = parseInt(limit as string) || 50;
      const { data, error } = await supabase.rpc('get_recent_magic_carpet_commands', {
        limit_count: limitCount
      });
      
      if (error) {
        console.error('Error getting recent magic carpet commands:', error);
        return res.status(500).json({ error: 'Failed to fetch recent commands' });
      }

      return res.status(200).json({
        success: true,
        recent_commands: data || []
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use "stats" or "recent"' });
    }

  } catch (error) {
    console.error('Unexpected error in magic carpet admin API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
