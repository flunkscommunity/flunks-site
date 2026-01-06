import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { handleCors } from '../../utils/corsHeaders';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log('🔑 [CHECK-KEY] Checking if wallet has key:', walletAddress);

    const { data, error } = await supabase
      .from('paradise_motel_room7_keys')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ [CHECK-KEY] Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check key status',
        details: error.message 
      });
    }

    const hasKey = !!data;
    console.log(`${hasKey ? '✅' : '❌'} [CHECK-KEY] Wallet ${hasKey ? 'HAS' : 'DOES NOT HAVE'} key:`, walletAddress);

    return res.status(200).json({
      success: true,
      hasKey,
      obtainedAt: data?.obtained_at || null,
    });

  } catch (error: any) {
    console.error('💥 [CHECK-KEY] Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
