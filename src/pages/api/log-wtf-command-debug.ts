import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      wallet, 
      accessLevel,
      sessionId,
      userAgent = req.headers['user-agent'] || null,
      command = 'wtf' 
    } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Get client IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0] 
      : req.connection.remoteAddress || null;

    console.log('Attempting to log WTF command:', {
      wallet,
      accessLevel,
      sessionId,
      userAgent,
      ip
    });

    // Try direct table insert first (simpler approach)
    const { data, error } = await supabase
      .from('wtf_command_logs')
      .insert([{
        wallet_address: wallet,
        command_input: command,
        access_level: accessLevel,
        session_id: sessionId,
        user_agent: userAgent,
        ip_address: ip
      }]);

    if (error) {
      console.error('Error logging WTF command (direct insert):', error);
      
      // Fallback to function call
      console.log('Trying function call fallback...');
      const { data: funcData, error: funcError } = await supabase.rpc('log_wtf_command', {
        p_wallet_address: wallet,
        p_access_level: accessLevel,
        p_session_id: sessionId,
        p_user_agent: userAgent,
        p_ip_address: ip
      });

      if (funcError) {
        console.error('Error with function call too:', funcError);
        return res.status(500).json({ 
          error: 'Failed to log command usage',
          details: funcError.message 
        });
      }
    }

    console.log('WTF command logged successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'WTF command usage logged',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error in WTF logging:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
