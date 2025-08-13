// API endpoint to get user profile by wallet address
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet: raw_wallet } = req.query as { wallet?: string };
  const wallet = normalizeWalletAddress(raw_wallet);

  if (!raw_wallet || typeof raw_wallet !== 'string') {
    return res.status(400).json({ error: 'wallet address is required' });
  }

  try {
    let { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error?.code === 'PGRST116' && raw_wallet && raw_wallet !== wallet) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', raw_wallet)
        .single();
      if (!legacyError && legacyData) {
        data = legacyData as any;
        error = null;
      }
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('🔥 Supabase SELECT error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('🔥 Profile fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
