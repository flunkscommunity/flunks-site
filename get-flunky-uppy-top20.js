const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getLeaderboardWithProfiles() {
  console.log('Connecting to Supabase...');
  
  // Get all scores
  const { data: allScores, error } = await supabase
    .from('flunky_uppy_scores')
    .select('wallet, score, timestamp')
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching scores:', error);
    return;
  }

  console.log(`Found ${allScores?.length || 0} total score entries`);

  // Get best score per wallet
  const walletBestScores = new Map();
  allScores?.forEach((entry) => {
    const existing = walletBestScores.get(entry.wallet);
    if (!existing || entry.score > existing.score) {
      walletBestScores.set(entry.wallet, entry);
    }
  });

  // Sort by score
  const topScores = Array.from(walletBestScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // Get profiles
  const wallets = topScores.map(s => s.wallet);
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('wallet_address, username')
    .in('wallet_address', wallets);

  if (profileError) {
    console.error('Profile error:', profileError);
  }

  const profileMap = new Map(profiles?.map(p => [p.wallet_address, p.username]) || []);

  console.log('\n🏆 FLUNKY UPPY TOP 20 LEADERBOARD WITH PROFILES 🏆\n');
  console.log('Rank | Score  | Username         | Wallet Address');
  console.log('-----|--------|------------------|------------------------------------------');
  
  topScores.forEach((entry, i) => {
    const username = profileMap.get(entry.wallet) || '(no profile)';
    console.log(`${String(i+1).padStart(4)} | ${String(entry.score).padStart(6)} | ${username.padEnd(16)} | ${entry.wallet}`);
  });

  console.log('\n📋 CSV FORMAT FOR AIRDROP:\n');
  console.log('wallet_address,username,score');
  topScores.forEach((entry) => {
    const username = profileMap.get(entry.wallet) || '';
    console.log(`${entry.wallet},${username},${entry.score}`);
  });
}

getLeaderboardWithProfiles().catch(console.error);
