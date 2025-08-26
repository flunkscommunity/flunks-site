// API endpoint to create or update user profile
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { normalizeWalletAddress } from 'utils/walletAddress';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UserProfileData {
  wallet_address: string;
  username: string;
  profile_icon?: string;
  discord_id?: string;
  email?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet_address: raw_wallet_address, username, profile_icon, discord_id, email }: UserProfileData = req.body;
  const wallet_address = normalizeWalletAddress(raw_wallet_address);

  // Validation
  if (!wallet_address || !username) {
    return res.status(400).json({ 
      error: 'wallet_address and username are required' 
    });
  }

  // Username validation
  if (username.length < 3 || username.length > 32) {
    return res.status(400).json({ 
      error: 'Username must be between 3 and 32 characters' 
    });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ 
      error: 'Username can only contain letters, numbers, hyphens, and underscores' 
    });
  }

  // Profile icon validation - required field
  if (!profile_icon || profile_icon.trim() === '') {
    return res.status(400).json({ 
      error: 'Profile icon is required' 
    });
  }

  // Email validation (if provided)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  try {
    // Check if username is already taken by another wallet
    const { data: existingUsername } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('username', username)
      .neq('wallet_address', wallet_address)
      .single();

    if (existingUsername) {
      return res.status(409).json({ 
        error: 'Username already taken' 
      });
    }

    // Check if Discord ID is already taken (if provided)
    if (discord_id) {
      const { data: existingDiscord } = await supabase
        .from('user_profiles')
        .select('wallet_address')
        .eq('discord_id', discord_id)
        .neq('wallet_address', wallet_address)
        .single();

      if (existingDiscord) {
        return res.status(409).json({ 
          error: 'Discord ID already linked to another account' 
        });
      }
    }

    // Upsert the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        wallet_address,
        username,
        profile_icon, // Use the selected icon directly - no fallback
        discord_id: discord_id || null,
        email: email || null,
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (error) {
      console.error('🔥 Supabase upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      profile: data 
    });

  } catch (error) {
    console.error('🔥 Profile creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create/update profile' 
    });
  }
}
