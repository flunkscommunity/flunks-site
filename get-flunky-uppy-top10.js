const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getTop10() {
  const { data, error } = await supabase
    .from('flunky_uppy_scores')
    .select('wallet, score, timestamp, metadata')
    .order('score', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Get best score per wallet
  const walletBest = new Map();
  data.forEach(row => {
    if (!walletBest.has(row.wallet) || row.score > walletBest.get(row.wallet).score) {
      walletBest.set(row.wallet, row);
    }
  });
  
  const top10 = Array.from(walletBest.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  // Get wallet addresses for profile lookup
  const walletAddresses = top10.map(e => e.wallet);
  
  // Fetch user profiles
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('wallet_address, username, profile_icon')
    .in('wallet_address', walletAddresses);
  
  if (profileError) {
    console.error('Profile fetch error:', profileError);
  }
  
  // Create lookup map
  const profileMap = new Map();
  profiles?.forEach(p => profileMap.set(p.wallet_address, p));
  
  console.log('\n🏆 FLUNKY UPPY TOP 10 LEADERBOARD 🏆\n');
  top10.forEach((entry, i) => {
    const profile = profileMap.get(entry.wallet);
    const name = profile?.username || entry.metadata?.username || entry.wallet.slice(0,6) + '...' + entry.wallet.slice(-4);
    const icon = profile?.profile_icon || '🦘';
    const date = new Date(entry.timestamp).toLocaleDateString();
    console.log(`${(i+1).toString().padStart(2)}. ${icon} ${name.padEnd(20)} - ${entry.score.toString().padStart(6)} pts  (${date})`);
  });
  console.log('\n');
}

getTop10();
