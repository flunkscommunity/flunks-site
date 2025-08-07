import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_name, wallet_address, issues_found, suggestions } = req.body;

    // Validate required fields
    if (!issues_found || issues_found.trim().length === 0) {
      return res.status(400).json({ error: 'Issues description is required' });
    }

    // Get user agent and IP for debugging context
    const user_agent = req.headers['user-agent'] || '';
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback_reports')
      .insert([
        {
          user_name: user_name?.trim() || 'Anonymous',
          wallet_address: wallet_address || null,
          issues_found: issues_found.trim(),
          suggestions: suggestions?.trim() || null,
          user_agent,
          ip_address: Array.isArray(ip_address) ? ip_address[0] : ip_address
        }
      ])
      .select();

    if (error) {
      console.error('🔥 Supabase INSERT error:', error);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    console.log('✅ Feedback saved successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Feedback submitted successfully!',
      id: data[0]?.id 
    });

  } catch (error) {
    console.error('🔥 Feedback submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
