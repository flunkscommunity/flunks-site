import { NextApiRequest, NextApiResponse } from 'next';
import { checkGumCooldown } from '../../utils/gumAPI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, source } = req.body;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet address required' 
    });
  }

  if (!source || typeof source !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Source name required' 
    });
  }

  try {
    console.log(`🔍 Checking cooldown for wallet ${wallet}, source: ${source}`);
    
    const cooldownResult = await checkGumCooldown(wallet, source);
    
    console.log('📊 Cooldown check result:', cooldownResult);
    
    return res.status(200).json({
      success: true,
      ...cooldownResult
    });
  } catch (error) {
    console.error('Error checking cooldown:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error checking cooldown'
    });
  }
}
