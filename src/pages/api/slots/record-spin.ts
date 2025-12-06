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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, gameId, gameName, bet, win, spinResult } = req.body;

    if (!userId || !gameId || !gameName || bet === undefined || win === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const multiplier = bet > 0 ? win / bet : 0;

    // Record the spin in leaderboard
    const { data: leaderboardEntry, error: leaderboardError } = await supabase
      .from('slots_leaderboard')
      .insert({
        user_id: userId,
        game_id: gameId,
        game_name: gameName,
        bet_amount: bet,
        win_amount: win,
        multiplier: multiplier,
        spin_result: spinResult
      })
      .select()
      .single();

    if (leaderboardError) {
      console.error('Leaderboard insert error:', leaderboardError);
    }

    // Update user stats if it's a win
    if (win > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_slots_played, total_slots_won, biggest_slots_multiplier')
        .eq('id', userId)
        .single();

      if (profile) {
        const updates: any = {
          total_slots_played: (profile.total_slots_played || 0) + 1,
          total_slots_won: (profile.total_slots_won || 0) + win,
        };

        if (multiplier > (profile.biggest_slots_multiplier || 0)) {
          updates.biggest_slots_multiplier = multiplier;
          updates.favorite_slot_game = gameName;
        }

        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);
      }
    }

    return res.status(200).json({ 
      success: true,
      rank: leaderboardEntry,
      multiplier 
    });
  } catch (error) {
    console.error('Error recording spin:', error);
    return res.status(500).json({ 
      error: 'Failed to record spin',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
