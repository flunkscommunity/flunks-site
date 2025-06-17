import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const challengeId = req.query.challenge_id as string | undefined;

  let query = supabase
    .from('flappyflunk_scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (challengeId) {
    query = query.eq('challenge_id', challengeId);
  }

  const { data, error } = await query;

 if (error) {
  console.error('🔥 Supabase SELECT error:', error); // ✅ add this
  return res.status(500).json({ error: error.message });
}



  return res.status(200).json({ scores: data });
}
