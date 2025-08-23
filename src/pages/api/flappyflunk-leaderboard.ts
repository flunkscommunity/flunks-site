import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get scores first, then manually fetch user profiles for those wallets
  const { data: scoresData, error } = await supabase
    .from('flappyflunk_scores')
    .select('wallet, score')
    .order('score', { ascending: false })
    .limit(100);

  if (error) {
    console.error('🔥 Supabase SELECT error:', error);
    return res.status(500).json({ error: error.message });
  }

  // Get unique wallet addresses
  const walletAddresses = scoresData?.map(row => row.wallet) || [];
  
  // Fetch user profiles for those wallets
  const { data: profilesData } = await supabase
    .from('user_profiles')
    .select('wallet_address, username, profile_icon')
    .in('wallet_address', walletAddresses);

  // Create a lookup map for profiles
  const profileMap = new Map();
  profilesData?.forEach(profile => {
    profileMap.set(profile.wallet_address, profile);
  });

  // Transform the data to include username or fallback to wallet
  const transformedData = scoresData?.map((row: any) => {
    const userProfile = profileMap.get(row.wallet);
    return {
      wallet: row.wallet,
      score: row.score,
      username: userProfile?.username || `${row.wallet.slice(0, 6)}...${row.wallet.slice(-4)}`,
      profile_icon: userProfile?.profile_icon,
      hasProfile: !!userProfile?.username
    };
  });

  return res.status(200).json(transformedData);
}
// This API route fetches the leaderboard scores for the Flappy Flunk game
// and returns them in descending order by score, limited to the top 100 scores.
// It uses Supabase as the backend database to store and retrieve scores.
// The scores are returned in JSON format, ready to be consumed by the frontend.