import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action = 'stats', limit = '50' } = req.query;

    if (action === 'stats') {
      // Get Flow command statistics
      const { data, error } = await supabase.rpc('get_flow_command_stats');
      
      if (error) {
        console.error('Error getting Flow command stats:', error);
        return res.status(500).json({ error: 'Failed to fetch Flow command statistics' });
      }

      return res.status(200).json({
        success: true,
        stats: data?.[0] || {
          total_commands: 0,
          unique_wallets: 0,
          unique_usernames: 0,
          commands_today: 0,
          commands_this_week: 0,
          commands_this_month: 0
        }
      });

    } else if (action === 'recent') {
      // Get recent command usage
      const limitCount = parseInt(limit as string) || 50;
      const { data, error } = await supabase.rpc('get_recent_flow_commands', {
        p_limit: limitCount,
        p_offset: 0
      });
      
      if (error) {
        console.error('Error getting recent Flow commands:', error);
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
    console.error('Unexpected error in Flow admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
