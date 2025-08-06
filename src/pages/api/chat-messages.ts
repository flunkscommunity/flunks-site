import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get messages for a specific room
    try {
      const { room } = req.query;
      
      if (!room || typeof room !== 'string') {
        return res.status(400).json({ error: 'Room name is required' });
      }

      // Get recent messages for the room (last 100)
      const { data: messages, error } = await supabase
        .from('recent_chat_messages')
        .select('*')
        .eq('room_name', room)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('🔥 Supabase fetch error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ messages: messages || [] });

    } catch (error) {
      console.error('🔥 Chat messages fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    // Post a new message
    try {
      const { room_name, username, wallet_address, message_text, is_ai, ai_agent_id } = req.body;

      if (!room_name || !username || !message_text) {
        return res.status(400).json({ 
          error: 'Room name, username, and message text are required' 
        });
      }

      if (message_text.length > 2000) {
        return res.status(400).json({ 
          error: 'Message too long (max 2000 characters)' 
        });
      }

      // Insert the message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_name,
          username,
          wallet_address: wallet_address || null,
          message_text,
          is_ai: is_ai || false,
          ai_agent_id: ai_agent_id || null
        })
        .select()
        .single();

      if (error) {
        console.error('🔥 Supabase insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ 
        success: true, 
        message: data 
      });

    } catch (error) {
      console.error('🔥 Chat message post error:', error);
      return res.status(500).json({ error: 'Failed to post message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
