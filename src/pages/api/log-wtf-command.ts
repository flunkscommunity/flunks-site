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
      username,
      accessLevel,
      sessionId,
      userAgent = req.headers['user-agent'] || null,
      command = 'wtf' 
    } = req.body;

    // Allow null wallet for anonymous/trial mode users
    if (wallet === undefined) {
      return res.status(400).json({ error: 'Wallet address required (undefined not allowed)' });
    }

    // Get client IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0] 
      : req.connection.remoteAddress || null;

    console.log('🔍 WTF Command Logging Request:', {
      wallet,
      username,
      command,
      accessLevel,
      sessionId,
      userAgent
    });

    // Prefer dedicated WTF tracking (table+RPC) if available
    let rpcOk = false;
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('log_wtf_command', {
        p_wallet_address: wallet,
        p_username: username || null,
        p_access_level: accessLevel,
        p_session_id: sessionId,
        p_user_agent: userAgent,
        p_ip_address: ip
      });
      if (rpcError) {
        console.warn('RPC log_wtf_command failed, will fallback:', rpcError);
      } else {
        rpcOk = true;
        console.log('✅ RPC log_wtf_command successful!', rpcData);
      }
    } catch (e) {
      console.warn('RPC log_wtf_command threw, will fallback:', e);
    }

    if (!rpcOk) {
      // Fallback to direct insert into new wtf_logs table
      const { error: insertErr } = await supabase
        .from('wtf_logs')
        .insert({
          wallet_address: wallet,
          username: username || null,
          access_level: accessLevel,
          session_id: sessionId,
          user_agent: userAgent,
          ip_address: ip ?? null
        } as any);
      if (insertErr) {
        console.error('❌ Insert into wtf_logs failed:', insertErr);
        // As last resort, write to terminal_activities with schema compatibility
        const { error: finalErr } = await supabase
          .from('terminal_activities')
          .insert({
            wallet_address: wallet,
            command_entered: command,
            command_type: 'CODE',
            response_given: 'WTF tracked',
            success: true,
            session_id: sessionId
          } as any);
        if (finalErr) {
          console.error('❌ Final fallback failed:', finalErr);
          return res.status(500).json({ error: 'Failed to log command usage' });
        }
      }
    }

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
