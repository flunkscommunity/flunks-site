// API endpoint to get user's locker information
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LockerInfo {
  locker_number: number | null;
  username: string | null;
  signup_date: string;
  locker_status: 'Active' | 'Reserved';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet_address: raw_wallet_address } = req.query as { wallet_address?: string };
  const wallet_address = normalizeWalletAddress(raw_wallet_address);

  if (!raw_wallet_address || typeof raw_wallet_address !== 'string') {
    return res.status(400).json({ 
      error: 'wallet_address is required' 
    });
  }

  try {
    // Get user's locker information
    let { data: lockerInfo, error } = await supabase
      .from('user_profiles')
      .select('locker_number, username, created_at')
      .eq('wallet_address', wallet_address)
      .single();

    if (error?.code === 'PGRST116' && raw_wallet_address && wallet_address !== raw_wallet_address) {
      const { data: legacyInfo, error: legacyError } = await supabase
        .from('user_profiles')
        .select('locker_number, username, created_at')
        .eq('wallet_address', raw_wallet_address)
        .single();
      if (!legacyError && legacyInfo) {
        lockerInfo = legacyInfo as any;
        error = null;
      }
    }

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }
      console.error('🔥 Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Format the response
    const response: LockerInfo = {
      locker_number: lockerInfo.locker_number,
      username: lockerInfo.username,
      signup_date: lockerInfo.created_at,
      locker_status: lockerInfo.username ? 'Active' : 'Reserved'
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('🔥 Locker info error:', error);
    return res.status(500).json({ 
      error: 'Failed to get locker information' 
    });
  }
}
