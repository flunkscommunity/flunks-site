import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet, action = 'stats' } = req.query;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required for admin verification' });
    }

    // Verify admin access
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('access_level')
      .eq('wallet_address', wallet)
      .single();

    if (profileError || !userProfile || userProfile.access_level !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (action === 'stats') {
      // Get WTF command statistics
      const { data: stats, error: statsError } = await supabase.rpc('get_wtf_command_stats');

      if (statsError) {
        console.error('Error getting WTF stats:', statsError);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      return res.status(200).json({
        success: true,
        stats: stats[0] || {
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
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Get recent WTF command usage
      const { data: recent, error: recentError } = await supabase.rpc('get_recent_wtf_commands', {
        limit_count: limit
      });

      if (recentError) {
        console.error('Error getting recent WTF commands:', recentError);
        return res.status(500).json({ error: 'Failed to fetch recent commands' });
      }

      return res.status(200).json({
        success: true,
        recent_commands: recent || []
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use "stats" or "recent"' });
    }

  } catch (error) {
    console.error('Unexpected error in WTF admin API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
