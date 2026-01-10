import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Room7VisitResponse {
  success: boolean;
  hasVisited: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Room7VisitResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      hasVisited: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        hasVisited: false,
        message: 'Valid wallet address is required'
      });
    }

    console.log('🔍 Checking Room 7 key for:', walletAddress.slice(0, 8) + '...');

    // Check if user has a Room 7 key (use ilike for case-insensitive matching)
    const { data: existingKey, error: checkError } = await supabase
      .from('paradise_motel_room7_keys')
      .select('id, obtained_at')
      .ilike('wallet_address', walletAddress)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Database error checking Room 7 key:', checkError);
      return res.status(500).json({
        success: false,
        hasVisited: false,
        message: 'Database error while checking key'
      });
    }

    const hasVisited = !!existingKey;
    
    console.log('📊 Room 7 key check result:', {
      wallet: walletAddress.slice(0, 8) + '...',
      hasVisited,
      keyObtainedAt: existingKey?.obtained_at
    });

    return res.status(200).json({
      success: true,
      hasVisited,
      message: hasVisited 
        ? 'User has already visited Paradise Motel Room 7' 
        : 'User has not visited Paradise Motel Room 7 yet'
    });

  } catch (error: any) {
    console.error('❌ Unexpected error checking Room 7 visit:', error);
    return res.status(500).json({
      success: false,
      hasVisited: false,
      message: 'Internal server error'
    });
  }
}
