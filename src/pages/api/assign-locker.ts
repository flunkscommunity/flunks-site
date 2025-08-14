// API endpoint to assign a locker to a user
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';

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

  const { wallet_address: raw_wallet_address } = req.body;
  const wallet_address = normalizeWalletAddress(raw_wallet_address);

  if (!wallet_address || typeof wallet_address !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'wallet_address is required' 
    });
  }

  try {
    console.log('🔄 assign-locker API called for wallet:', wallet_address);
    
    // First, check if user already has a profile with a real username
    let { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, locker_number, wallet_address, username')
      .eq('wallet_address', wallet_address)
      .single();

    if (checkError?.code === 'PGRST116' && raw_wallet_address && normalizeWalletAddress(raw_wallet_address) !== raw_wallet_address.toLowerCase()) {
      const { data: legacyUser, error: legacyError } = await supabase
        .from('user_profiles')
        .select('id, locker_number, wallet_address, username')
        .eq('wallet_address', raw_wallet_address)
        .single();
      if (!legacyError && legacyUser) {
        existingUser = legacyUser as any;
        checkError = null;
        try {
          await supabase
            .from('user_profiles')
            .update({ wallet_address })
            .eq('id', legacyUser.id);
          console.log('🔧 Normalized legacy wallet address to', wallet_address);
        } catch (e) {
          console.warn('⚠️ Failed to normalize wallet address row', e);
        }
      }
    }

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
      
      try {
        // Use a transaction to safely assign the next locker number
        // First, get the highest locker number currently assigned
        const { data: maxLockerData, error: maxLockerError } = await supabase
          .from('user_profiles')
          .select('locker_number')
          .not('locker_number', 'is', null)
          .order('locker_number', { ascending: false })
          .limit(1)
          .single();

        let nextLockerNumber = 1; // Default to 1 if no lockers assigned yet
        
        if (!maxLockerError && maxLockerData?.locker_number) {
          nextLockerNumber = maxLockerData.locker_number + 1;
        }

        console.log('📋 Next locker number to assign:', nextLockerNumber);

        // Update the user with the new locker number
        const { data: updateData, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            locker_number: nextLockerNumber,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', wallet_address)
          .select('locker_number')
          .single();

        if (updateError) {
          console.error('❌ Error updating user with locker number:', updateError);
          return res.status(500).json({
            success: false,
            error: 'Failed to assign locker'
          });
        }

        const assignedLocker = updateData.locker_number;
        console.log('✅ Locker assigned via manual assignment:', assignedLocker);
        
        return res.status(200).json({
          success: true,
          locker_number: assignedLocker,
          message: `Locker #${assignedLocker} assigned successfully!`
        });

      } catch (error) {
        console.error('❌ Error in locker assignment process:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to assign locker due to unexpected error'
        });
      }
    }

  } catch (error) {
    console.error('Unexpected error in assign-locker:', error);
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error'
    });
  }
}
