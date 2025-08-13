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
    // First, check if user already has a locker
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('locker_number, wallet_address')
      .eq('wallet_address', wallet_address)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Database error while checking user'
      });
    }

    // If user already exists and has a locker
    if (existingUser && existingUser.locker_number) {
      return res.status(200).json({
        success: true,
        locker_number: existingUser.locker_number,
        message: `You already have locker #${existingUser.locker_number}!`
      });
    }

    // If user exists but doesn't have a locker, update them
    if (existingUser && !existingUser.locker_number) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('wallet_address', wallet_address)
        .select('locker_number')
        .single();

      if (updateError) {
        console.error('Error updating existing user:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to assign locker to existing user'
        });
      }

      return res.status(200).json({
        success: true,
        locker_number: updatedUser.locker_number,
        message: `Locker #${updatedUser.locker_number} assigned successfully!`
      });
    }

    // User doesn't exist, create new user with auto-assigned locker
    const { data: newUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: wallet_address,
        username: null, // They can set this later
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('locker_number')
      .single();

    if (insertError) {
      console.error('Error creating new user:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user and assign locker'
      });
    }

    return res.status(201).json({
      success: true,
      locker_number: newUser.locker_number,
      message: `Welcome! Locker #${newUser.locker_number} is now yours!`
    });

  } catch (error) {
    console.error('Unexpected error in assign-locker:', error);
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error'
    });
  }
}
