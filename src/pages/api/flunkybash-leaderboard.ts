// ✅ Flunky Bash Leaderboard API
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

  // Get all scores first
  const { data: allScores, error } = await supabase
    .from('flunkybash_scores')
    .select('wallet, score, timestamp, metadata')
    .order('score', { ascending: false })
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('🔥 Supabase SELECT error:', error);
    return res.status(500).json({ error: error.message, leaderboard: [] });
  }

  // Group by wallet and keep only the highest score for each wallet
  const walletBestScores = new Map();
  
  allScores?.forEach((scoreEntry: any) => {
    const wallet = scoreEntry.wallet;
    const existingBest = walletBestScores.get(wallet);
    
    if (!existingBest || scoreEntry.score > existingBest.score) {
      walletBestScores.set(wallet, scoreEntry);
    }
  });

  // Convert map back to array and sort by score (highest first)
  const uniqueTopScores = Array.from(walletBestScores.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // Higher score first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // More recent first for ties
    })
    .slice(0, 50); // Limit to top 50 unique players

  // Get unique wallet addresses for profile lookup
  const walletAddresses = uniqueTopScores.map(row => row.wallet);
  
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
  const transformedData = uniqueTopScores.map((row: any) => {
    const userProfile = profileMap.get(row.wallet);
    return {
      wallet: row.wallet,
      score: row.score,
      timestamp: row.timestamp,
      username: userProfile?.username || row.metadata?.username || `${row.wallet.slice(0, 6)}...${row.wallet.slice(-4)}`,
      profile_icon: userProfile?.profile_icon,
      hasProfile: !!userProfile?.username
    };
  });

  return res.status(200).json({ leaderboard: transformedData });
}
