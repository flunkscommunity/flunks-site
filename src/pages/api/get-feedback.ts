import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50, offset = 0, wallet_address } = req.query;

    let query = supabase
      .from('feedback_reports')
      .select('*')
      .order('submitted_at', { ascending: false });

    // If wallet_address is provided, filter by that user
    if (wallet_address) {
      query = query.eq('wallet_address', wallet_address);
    }

    // Apply pagination
    query = query.range(
      parseInt(offset as string), 
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    const { data, error } = await query;

    if (error) {
      console.error('🔥 Supabase SELECT error:', error);
      return res.status(500).json({ error: 'Failed to retrieve feedback' });
    }

    return res.status(200).json({
      success: true,
      feedback: data,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('🔥 Feedback retrieval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
