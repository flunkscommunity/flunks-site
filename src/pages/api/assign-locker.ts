// API endpoint to assign a locker to a user
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LockerAssignmentResponse {
  success: boolean;
  locker_number?: number;
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LockerAssignmentResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false,
      error: 'Method Not Allowed' 
    });
  }

  const { wallet_address } = req.body;

  if (!wallet_address || typeof wallet_address !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'wallet_address is required' 
    });
  }

  try {
    console.log('🔄 assign-locker API called for wallet:', wallet_address);
    
    // First, check if user already has a profile with a real username
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('locker_number, wallet_address, username')
      .eq('wallet_address', wallet_address)
      .single();

    console.log('🔍 Existing user check result:', { existingUser, checkError: checkError?.code });

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing user:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Database error while checking user'
      });
    }

    // If user doesn't exist, they need to create a profile first
    if (!existingUser) {
      console.log('❌ User has no profile - they need to create one first');
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create your profile first through the character creation process.'
      });
    }

    // If user has a temp/auto-generated username, they need to create a proper profile
    if (existingUser.username && existingUser.username.startsWith('user_')) {
      console.log('❌ User has temp username - they need to create proper profile');
      return res.status(400).json({
        success: false,
        error: 'Please create your character profile first to get your locker assigned.'
      });
    }

    // If user already exists and has a locker
    if (existingUser && existingUser.locker_number) {
      console.log('✅ User already has locker:', existingUser.locker_number);
      return res.status(200).json({
        success: true,
        locker_number: existingUser.locker_number,
        message: `You already have locker #${existingUser.locker_number}!`
      });
    }

    // If user has proper profile but no locker, assign them one
    if (existingUser && !existingUser.locker_number) {
      console.log('⚠️ User has profile but no locker - assigning one...');
      
      // Get the next locker number from the sequence
      const { data: nextLockerData, error: sequenceError } = await supabase
        .rpc('assign_next_locker', { 
          p_wallet_address: wallet_address 
        });

      if (sequenceError) {
        console.error('❌ Error calling assign_next_locker function:', sequenceError);
        return res.status(500).json({
          success: false,
          error: 'Failed to assign locker'
        });
      }

      const assignedLocker = nextLockerData;
      console.log('✅ Locker assigned via function:', assignedLocker);
      
      return res.status(200).json({
        success: true,
        locker_number: assignedLocker,
        message: `Locker #${assignedLocker} assigned successfully!`
      });
    }

  } catch (error) {
    console.error('Unexpected error in assign-locker:', error);
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error'
    });
  }
}
