import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, score, challenge_id, metadata } = req.body as {
    wallet?: string;
    score?: number;
    challenge_id?: string;
    metadata?: any;
  };

  if (!wallet || typeof score !== 'number') {
    return res.status(400).json({ error: 'wallet and score required' });
  }

  const { error } = await supabase.from('flappyflunk_scores').insert({
    wallet,
    score,
    challenge_id,
    metadata,
  });

  if (error) {
    console.error('Supabase insert error', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
