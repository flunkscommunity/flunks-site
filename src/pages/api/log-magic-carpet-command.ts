import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

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
      command = 'magic carpet' 
    } = req.body;

    // Get client IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0] 
      : req.connection.remoteAddress || null;

    console.log('Logging Magic Carpet command:', {
      wallet: wallet || 'anonymous',
      username: username || 'no username',
      accessLevel,
      sessionId,
      userAgent,
      ip,
      command
    });

    // Try RPC function first (more reliable)
    let rpcOk = false;
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('log_magic_carpet_command', {
        p_wallet_address: wallet,
        p_username: username,
        p_access_level: accessLevel,
        p_session_id: sessionId,
        p_user_agent: userAgent,
        p_ip_address: ip
      });
      if (rpcError) {
        console.warn('RPC log_magic_carpet_command failed, will fallback:', rpcError);
      } else {
        rpcOk = true;
        console.log('✅ RPC log_magic_carpet_command successful!', rpcData);
      }
    } catch (e) {
      console.warn('RPC log_magic_carpet_command threw, will fallback:', e);
    }

    if (!rpcOk) {
      // Fallback to direct insert into magic_carpet_logs
      const { error: insertErr } = await supabase
        .from('magic_carpet_logs')
        .insert({
          wallet_address: wallet,
          username: username,
          command_input: command,
          access_level: accessLevel,
          session_id: sessionId,
          user_agent: userAgent,
          ip_address: ip ?? null
        } as any);
      if (insertErr) {
        console.error('❌ Insert into magic_carpet_logs failed:', insertErr);
        // As last resort, write to terminal_activities with schema compatibility
        const { error: finalErr } = await supabase
          .from('terminal_activities')
          .insert({
            wallet_address: wallet,
            command_entered: command,
            command_type: 'CODE',
            response_given: 'Magic Carpet tracked',
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
      message: 'Magic Carpet command usage logged',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error in Magic Carpet logging:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
