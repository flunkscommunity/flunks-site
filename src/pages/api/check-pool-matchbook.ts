import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { handleCors } from '../../utils/corsHeaders';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/check-pool-matchbook?walletAddress=0x...
 * Checks if a wallet has earned the Four Thieves Matchbook
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS for mobile app
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address is required' 
      });
    }

    const { data, error } = await supabase
      .from('pool_game_matchbook')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('❌ [CHECK-MATCHBOOK] Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check matchbook status',
        details: error.message 
      });
    }

    const hasMatchbook = !!data;

    return res.status(200).json({
      success: true,
      hasMatchbook,
      obtainedAt: data?.obtained_at || null,
    });

  } catch (error: any) {
    console.error('💥 [CHECK-MATCHBOOK] Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
