import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'all_time', gameId } = req.query;

    let query = supabase
      .from('slots_leaderboard')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('multiplier', { ascending: false })
      .limit(100);

    // Filter by time period
    if (period === 'daily') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', oneDayAgo);
    } else if (period === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', oneWeekAgo);
    } else if (period === 'monthly') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', oneMonthAgo);
    }

    // Filter by game
    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Add rank to results
    const leaderboard = data.map((entry, index) => ({
      rank: index + 1,
      username: entry.profiles?.username || 'Anonymous',
      avatar_url: entry.profiles?.avatar_url,
      game_name: entry.game_name,
      bet_amount: entry.bet_amount,
      win_amount: entry.win_amount,
      multiplier: entry.multiplier,
      created_at: entry.created_at
    }));

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
