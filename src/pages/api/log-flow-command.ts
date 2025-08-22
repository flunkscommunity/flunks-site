import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';
  return ip;
}

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
      command = 'flow' 
    } = req.body;

    // Allow null wallet for anonymous/trial mode users
    if (wallet === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address required (undefined not allowed)' 
      });
    }

    // Get client IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = typeof forwarded === 'string' 
      ? forwarded.split(',')[0] 
      : req.socket.remoteAddress || 'unknown';

    console.log('🔍 Flow Command Logging Request:', {
      wallet: wallet || 'anonymous',
      username: username || 'no username',
      command,
      accessLevel,
      sessionId,
      userAgent
    });

    // Try RPC call to log_flow_command function first
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('log_flow_command', {
        p_wallet_address: wallet,
        p_username: username || null,
        p_access_level: accessLevel || null,
        p_session_id: sessionId || null,
        p_user_agent: userAgent,
        p_ip_address: ipAddress
      });

      if (rpcError) {
        console.log('RPC log_flow_command failed, will fallback:', rpcError);
        throw rpcError;
      }

      console.log('✅ RPC log_flow_command successful!', rpcData);
      
      return res.status(200).json({ 
        success: true,
        message: 'Flow command usage logged',
        timestamp: new Date().toISOString()
      });
    } catch (rpcError) {
      console.log('RPC failed, trying direct insert:', rpcError);
      
      // Fallback to direct insert
      const { data: insertData, error: insertError } = await supabase
        .from('flow_logs')
        .insert({
          wallet_address: wallet,
          username: username || null,
          access_level: accessLevel || null,
          session_id: sessionId || null,
          user_agent: userAgent,
          ip_address: ipAddress,
          command_input: command
        });

      if (insertError) {
        console.error('❌ Insert into flow_logs failed:', insertError);
        throw insertError;
      }

      console.log('✅ Direct insert successful:', insertData);
      
      return res.status(200).json({ 
        success: true,
        message: 'Flow command usage logged via direct insert',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Final fallback failed:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to log command usage'
    });
  }
}
