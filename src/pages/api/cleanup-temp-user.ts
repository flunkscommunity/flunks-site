// API endpoint to clean up temporary auto-generated users
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet_address: raw_wallet_address } = req.body;
  const wallet_address = normalizeWalletAddress(raw_wallet_address);

  if (!wallet_address || typeof wallet_address !== 'string') {
    return res.status(400).json({ 
      error: 'wallet_address is required' 
    });
  }

  try {
    console.log('🧹 Cleaning up auto-generated user for wallet:', wallet_address);
    
    // Check if user has auto-generated username
    let { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('username, wallet_address, locker_number')
      .eq('wallet_address', wallet_address)
      .single();

    if (checkError?.code === 'PGRST116' && raw_wallet_address && wallet_address !== raw_wallet_address) {
      const { data: legacyUser, error: legacyError } = await supabase
        .from('user_profiles')
        .select('username, wallet_address, locker_number')
        .eq('wallet_address', raw_wallet_address)
        .single();
      if (!legacyError && legacyUser) {
        existingUser = legacyUser as any;
        checkError = null;
      }
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!existingUser) {
      return res.status(404).json({ 
        message: 'No user found to clean up',
        cleaned: false
      });
    }

    // Check if it's an auto-generated username
    if (!existingUser.username.startsWith('user_')) {
      return res.status(400).json({ 
        message: 'User has a real username - not cleaning up',
        username: existingUser.username,
        cleaned: false
      });
    }

    console.log('🗑️ Deleting auto-generated user:', existingUser.username);
    
    // Delete the auto-generated user
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('wallet_address', wallet_address);

    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    console.log('✅ Successfully cleaned up auto-generated user');
    
    return res.status(200).json({ 
      message: 'Auto-generated user cleaned up successfully',
      deleted_username: existingUser.username,
      cleaned: true
    });

  } catch (error) {
    console.error('Unexpected error in cleanup:', error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
