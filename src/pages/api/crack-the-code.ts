import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CrackTheCodeRequest {
  walletAddress: string;
  username?: string;
}

interface CrackTheCodeResponse {
  success: boolean;
  message: string;
  isFirstTime?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CrackTheCodeResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { walletAddress, username }: CrackTheCodeRequest = req.body;

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

    // Check if this wallet has already completed the challenge
    const { data: existing, error: checkError } = await supabase
      .from('crack_the_code')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing record:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
    }

    let isFirstTime = !existing;

    if (!existing) {
      // Insert new record for first-time completer
      const { error: insertError } = await supabase
        .from('crack_the_code')
        .insert({
          wallet_address: walletAddress,
          username: username || null,
          user_agent: userAgent,
          ip_address: ipAddress
        });

      if (insertError) {
        console.error('Error inserting crack_the_code record:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save completion record'
        });
      }

      console.log(`🎉 New code cracker! Wallet: ${walletAddress}, Username: ${username || 'Unknown'}`);
    } else {
      // Update existing record with latest completion
      const { error: updateError } = await supabase
        .from('crack_the_code')
        .update({
          username: username || existing.username, // Keep existing username if no new one provided
          completed_at: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);

      if (updateError) {
        console.error('Error updating crack_the_code record:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update completion record'
        });
      }

      console.log(`🔄 Returning code cracker! Wallet: ${walletAddress}, Username: ${username || existing.username}`);
    }

    return res.status(200).json({
      success: true,
      message: isFirstTime ? 
        '🎉 Congratulations! Your achievement has been recorded!' : 
        '👋 Welcome back! Your completion has been updated.',
      isFirstTime
    });

  } catch (error) {
    console.error('Unexpected error in crack-the-code API:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
}
