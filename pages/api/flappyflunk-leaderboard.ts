import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { data, error } = await supabase
    .from('flappyflunk_scores')
    .select('wallet, score, challenge_id, metadata, timestamp')
    .order('score', { ascending: false });

  if (error) {
    console.error('Supabase SELECT error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data || []);
}
