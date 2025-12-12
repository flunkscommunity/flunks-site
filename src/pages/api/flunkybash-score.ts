// ✅ Flunky Bash Score Submission API
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet, score, username } = req.body;

  if (!wallet || typeof score !== 'number') {
    console.log('❌ Invalid request payload:', { wallet, score, username });
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  console.log('🎯 Submitting Flunky Bash score:', { wallet: wallet.slice(0, 8) + '...', score, username });

  const insertData: any = {
    wallet,
    score,
    timestamp: new Date().toISOString(),
    metadata: {
      submitted_at: new Date().toISOString(),
      user_agent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }
  };

  // Add username if provided
  if (username) {
    insertData.metadata.username = username;
  }

  const { data, error } = await supabase
    .from('flunkybash_scores')
    .insert([insertData])
    .select();

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  console.log('✅ Flunky Bash score submitted successfully:', data);
  return res.status(200).json({ success: true, data });
}
