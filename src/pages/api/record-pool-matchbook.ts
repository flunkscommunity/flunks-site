import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/record-pool-matchbook
 * Records that a player earned the Four Thieves Matchbook by defeating The Wizard
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address is required' 
      });
    }

    console.log('🔥 [MATCHBOOK] Recording matchbook for wallet:', walletAddress);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';

    const { data, error } = await supabase
      .from('pool_game_matchbook')
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          obtained_at: new Date().toISOString(),
          opponent_defeated: 'medium',
          user_agent: userAgent,
          ip_address: ipAddress,
        },
        {
          onConflict: 'wallet_address',
          ignoreDuplicates: true, // Don't update if already exists
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ [MATCHBOOK] Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to record matchbook',
        details: error.message 
      });
    }

    console.log('✅ [MATCHBOOK] Successfully recorded matchbook for:', walletAddress);

    return res.status(200).json({
      success: true,
      message: 'Four Thieves Matchbook obtained!',
      data: {
        wallet_address: data.wallet_address,
        obtained_at: data.obtained_at,
      }
    });

  } catch (error: any) {
    console.error('💥 [MATCHBOOK] Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
