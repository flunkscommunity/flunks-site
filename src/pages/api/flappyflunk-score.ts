import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("✅ Supabase URL:", supabaseUrl);
console.log("✅ Supabase Key present:", !!supabaseAnonKey);

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet, score } = req.body;

  console.log("📝 Received body:", req.body);

  if (!wallet || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const { error } = await supabase
    .from('flappyflunk_scores')
    .insert([{ wallet, score }]);

  if (error) {
    console.error('🔥 Supabase INSERT error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
