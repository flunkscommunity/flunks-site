// API endpoint to get locker system statistics
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LockerStats {
  total_assigned: number;
  active_lockers: number;
  reserved_lockers: number;
  highest_locker_number: number;
  next_locker_number: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get locker statistics using our SQL function
    const { data, error } = await supabase
      .rpc('get_locker_stats');

    if (error) {
      console.error('🔥 Supabase RPC error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data as LockerStats);

  } catch (error) {
    console.error('🔥 Locker stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to get locker statistics' 
    });
  }
}
