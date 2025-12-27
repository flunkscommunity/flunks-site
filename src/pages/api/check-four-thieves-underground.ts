import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UndergroundAccessCheckResponse {
  success: boolean;
  hasAccess: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UndergroundAccessCheckResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      hasAccess: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        hasAccess: false,
        message: 'Valid wallet address is required'
      });
    }

    console.log('🔍 Checking Underground access for:', walletAddress.slice(0, 8) + '...');

    // Check if user has Underground access
    const { data: existingAccess, error: checkError } = await supabase
      .from('four_thieves_underground_access')
      .select('id, access_timestamp')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Database error checking Underground access:', checkError);
      return res.status(500).json({
        success: false,
        hasAccess: false,
        message: 'Database error while checking access'
      });
    }

    const hasAccess = !!existingAccess;
    
    console.log('📊 Underground access check result:', {
      wallet: walletAddress.slice(0, 8) + '...',
      hasAccess,
      accessTimestamp: existingAccess?.access_timestamp
    });

    return res.status(200).json({
      success: true,
      hasAccess,
      message: hasAccess 
        ? 'User has accessed Four Thieves Underground' 
        : 'User has not accessed Four Thieves Underground yet'
    });

  } catch (error) {
    console.error('❌ Underground access check error:', error);
    return res.status(500).json({
      success: false,
      hasAccess: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
