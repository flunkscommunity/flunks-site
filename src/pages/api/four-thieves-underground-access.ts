import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { awardGum } from '../../utils/gumAPI';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UndergroundAccessResponse {
  success: boolean;
  message: string;
  gumAwarded?: number;
  alreadyCompleted?: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UndergroundAccessResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { walletAddress, username } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    console.log('🎰 [UNDERGROUND] Recording access for wallet:', walletAddress.slice(0, 8) + '...');

    // Get user agent and IP for tracking
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';

    // Check if user has already accessed The Underground
    const { data: existingAccess, error: checkError } = await supabase
      .from('four_thieves_underground_access')
      .select('id, access_timestamp, gum_amount')
      .eq('wallet_address', walletAddress)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing access:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Database error while checking access',
        error: checkError.message
      });
    }

    if (existingAccess) {
      console.log('✅ User already accessed Underground:', walletAddress.slice(0, 8) + '...');
      // Return success since they already earned their reward
      return res.status(200).json({
        success: true,
        message: `You already earned ${existingAccess.gum_amount || 75} GUM as a Chapter 6 Slacker!`,
        gumAwarded: existingAccess.gum_amount || 75,
        alreadyCompleted: true
      });
    }

    // Record access and award 75 GUM
    const gumAmount = 75;
    
    const { data: insertData, error: insertError } = await supabase
      .from('four_thieves_underground_access')
      .insert({
        wallet_address: walletAddress,
        username: username || 'Anonymous',
        gum_amount: gumAmount,
        user_agent: userAgent,
        ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        access_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error recording Underground access:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to record Underground access',
        error: insertError.message
      });
    }

    // Award GUM using the proper gumAPI utility
    console.log('🎰 Attempting to award Underground access GUM...');
    const gumResult = await awardGum(
      walletAddress, 
      'chapter6_four_thieves_underground',
      {
        description: 'Chapter 6 Slacker - Four Thieves Underground password discovered',
        username: username || null
      }
    );

    console.log('🎰 Underground GUM result:', gumResult);

    if (!gumResult.success) {
      console.warn('⚠️ GUM award failed but access recorded:', gumResult.error);
    }

    const actualGumAwarded = gumResult.success ? gumResult.earned : 0;

    console.log('✅ Underground access recorded successfully:', {
      id: insertData.id,
      wallet: walletAddress.slice(0, 8) + '...' + walletAddress.slice(-6),
      gumAwarded: actualGumAwarded
    });

    return res.status(200).json({
      success: true,
      message: `🎰 Chapter 6 Slacker objective completed! You earned ${actualGumAwarded} GUM!`,
      gumAwarded: actualGumAwarded
    });

  } catch (error) {
    console.error('❌ Underground access API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
