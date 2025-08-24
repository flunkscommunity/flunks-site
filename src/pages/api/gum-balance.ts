import { NextApiRequest, NextApiResponse } from 'next';
import { getUserGumBalance } from '../../utils/gumAPI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.body;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet address required' 
    });
  }

  try {
    console.log(`💰 Getting GUM balance for wallet: ${wallet}`);
    
    const balance = await getUserGumBalance(wallet);
    
    console.log(`✅ Balance for ${wallet}: ${balance} GUM`);
    
    return res.status(200).json({
      success: true,
      balance,
      wallet
    });
  } catch (error) {
    console.error('Error getting GUM balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error getting balance'
    });
  }
}
