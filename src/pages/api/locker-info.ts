// API endpoint to get user's locker information
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';
import { handleCors } from '../../utils/corsHeaders';

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
  // Handle CORS for mobile app
  if (handleCors(req, res)) return;

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
    // Get user's locker information (order by created_at desc and take first to handle duplicates)
    let { data: lockerInfoArray, error } = await supabase
      .from('user_profiles')
      .select('locker_number, username, created_at')
      .eq('wallet_address', wallet_address)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let lockerInfo = lockerInfoArray && lockerInfoArray.length > 0 ? lockerInfoArray[0] : null;

    // Fallback: try raw wallet address if normalized didn't work
    if (!lockerInfo && raw_wallet_address && wallet_address !== raw_wallet_address) {
      const { data: legacyInfoArray } = await supabase
        .from('user_profiles')
        .select('locker_number, username, created_at')
        .eq('wallet_address', raw_wallet_address)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (legacyInfoArray && legacyInfoArray.length > 0) {
        lockerInfo = legacyInfoArray[0];
      }
    }

    if (error && error.code !== 'PGRST116') {
      console.error('🔥 Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!lockerInfo) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
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
