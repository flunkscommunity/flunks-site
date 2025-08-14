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

    // Log the feedback for debugging
    console.log('📝 Feedback received:', {
      user_name: user_name || 'Anonymous',
      wallet_address: wallet_address || 'Not connected',
      issues_found: issues_found.substring(0, 100) + '...',
      suggestions: suggestions ? suggestions.substring(0, 100) + '...' : 'None',
      timestamp: new Date().toISOString()
    });

    // Save to Supabase database
    const { data, error } = await supabase
      .from('feedback_reports')
      .insert([
        {
          user_name: user_name || 'Anonymous',
          wallet_address: wallet_address || null,
          issues_found: issues_found.trim(),
          suggestions: suggestions ? suggestions.trim() : null,
          user_agent: req.headers['user-agent'] || null,
          // Note: IP address can be added if needed for spam prevention
          // ip_address: req.socket.remoteAddress || req.headers['x-forwarded-for']
        }
      ])
      .select();

    if (error) {
      console.error('🔥 Supabase INSERT error:', error);
      return res.status(500).json({ 
        error: 'Failed to save feedback',
        details: error.message 
      });
    }

    console.log('✅ Feedback saved to database:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Feedback received and saved successfully!',
      timestamp: new Date().toISOString(),
      id: data[0]?.id
    });

  } catch (error) {
    console.error('🔥 API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: (error as Error).message 
    });
  }
}
