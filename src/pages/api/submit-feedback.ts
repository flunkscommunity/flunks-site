import { NextApiRequest, NextApiResponse } from 'next';

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

    // For now, just log the feedback and return success
    console.log('📝 Feedback received:', {
      user_name: user_name || 'Anonymous',
      wallet_address: wallet_address || 'Not connected',
      issues_found: issues_found.substring(0, 100) + '...',
      suggestions: suggestions ? suggestions.substring(0, 100) + '...' : 'None',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Feedback received successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔥 API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: (error as Error).message 
    });
  }
}
