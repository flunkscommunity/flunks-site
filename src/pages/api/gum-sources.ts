import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📋 Fetching GUM sources from database...');
    
    const { data, error } = await supabase
      .from('gum_sources')
      .select('*')
      .order('source_name');

    if (error) {
      console.error('Error fetching GUM sources:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch GUM sources'
      });
    }

    console.log(`✅ Found ${data?.length || 0} GUM sources`);
    
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error in gum-sources API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
