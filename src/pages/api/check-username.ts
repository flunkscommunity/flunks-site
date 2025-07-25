// API endpoint to check username availability
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

  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'username is required' });
  }

  // Basic validation
  if (username.length < 3 || username.length > 32) {
    return res.status(200).json({ 
      available: false, 
      reason: 'Username must be between 3 and 32 characters' 
    });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(200).json({ 
      available: false, 
      reason: 'Username can only contain letters, numbers, hyphens, and underscores' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('🔥 Supabase SELECT error:', error);
      return res.status(500).json({ error: error.message });
    }

    const available = !data; // Available if no data found

    return res.status(200).json({ 
      available,
      reason: available ? 'Username is available' : 'Username already taken'
    });

  } catch (error) {
    console.error('🔥 Username check error:', error);
    return res.status(500).json({ error: 'Failed to check username availability' });
  }
}
