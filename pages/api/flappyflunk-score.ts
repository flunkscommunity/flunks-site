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

  const { wallet, score } = req.body;

  if (!wallet || typeof score !== 'number') {
    console.error('❌ Invalid payload:', req.body);
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const { error } = await supabase
      .from('flappyflunk_scores')
      .insert([{ wallet, score }]);

    if (error) {
      console.error('🔥 Supabase INSERT error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Score saved:', { wallet, score });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🚨 Unexpected server error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });

    console.log("🧪 SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("🧪 SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ MISSING');

  }
}
