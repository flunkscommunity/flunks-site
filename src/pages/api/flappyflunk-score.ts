import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// 🐛 Debug Supabase env values
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 5) + '...'); // shorten for safety

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("💥 Incoming request", req.method);

  if (req.method !== 'POST') {
    console.log("❌ Method not allowed");
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet, score } = req.body;
  console.log("➡️ Payload:", { wallet, score });

  if (!wallet || typeof score !== 'number') {
    console.log("❌ Invalid payload");
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const { error } = await supabase
    .from('flappyflunk_scores')
    .insert([{ wallet, score }]);

  if (error) {
    console.error("🔥 Supabase INSERT error:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("✅ Score saved");
  return res.status(200).json({ success: true });
}

