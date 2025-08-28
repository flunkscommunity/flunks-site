import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface YourMomTrackingRequest {
  walletAddress: string;
  username?: string;
}

interface YourMomTrackingResponse {
  success: boolean;
  message: string;
  usageCount?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YourMomTrackingResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { walletAddress, username }: YourMomTrackingRequest = req.body;

    // Validate required fields
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Get user agent and IP for analytics
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.socket.remoteAddress || 
                     'Unknown';

    // Insert the usage record
    const { error: insertError } = await supabase
      .from('yourmom_command_usage')
      .insert({
        wallet_address: walletAddress,
        username: username || null,
        user_agent: userAgent,
        ip_address: ipAddress
      });

    if (insertError) {
      console.error('Error inserting yourmom command usage:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to track command usage'
      });
    }

    // Get usage count for this wallet
    const { count, error: countError } = await supabase
      .from('yourmom_command_usage')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_address', walletAddress);

    if (countError) {
      console.error('Error getting usage count:', countError);
    }

    console.log(`🎯 YOURMOM Command used! Wallet: ${walletAddress}, Username: ${username || 'Unknown'}, Total uses: ${count || 0}`);

    return res.status(200).json({
      success: true,
      message: 'YOURMOM command usage tracked successfully',
      usageCount: count || 0
    });

  } catch (error) {
    console.error('Unexpected error in yourmom-tracking API:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
}
