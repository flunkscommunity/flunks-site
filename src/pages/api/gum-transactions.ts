import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, limit = 50, offset = 0 } = req.body;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet address required' 
    });
  }

  try {
    console.log(`📋 Getting GUM transactions for wallet: ${wallet} (limit: ${limit}, offset: ${offset})`);
    
    const { data, error } = await supabase
      .from('gum_transactions')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching GUM transactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch GUM transactions',
        details: error.message
      });
    }

    console.log(`✅ Found ${data?.length || 0} transactions for ${wallet}`);
    
    return res.status(200).json({
      success: true,
      transactions: data || [],
      wallet,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error in gum-transactions API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error getting transactions'
    });
  }
}
