import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../utils/apiBaseUrl';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: number;
  room_name: string;
  username: string;
  wallet_address?: string;
  message_text: string;
  is_ai: boolean;
  ai_agent_id?: string;
  created_at: string;
  profile_icon?: string;
}

interface Message {
  id: string;
  username: string;
  profileIcon?: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
  isAI?: boolean;
}

const useChatMessages = (roomName: string, currentUsername: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert database message to component message format
  const convertMessage = useCallback((dbMessage: ChatMessage): Message => {
    return {
      id: dbMessage.id.toString(),
      username: dbMessage.username,
      profileIcon: dbMessage.profile_icon,
      text: dbMessage.message_text,
      timestamp: new Date(dbMessage.created_at),
      isOwn: dbMessage.username === currentUsername,
      isSystem: dbMessage.username === 'System',
      isAI: dbMessage.is_ai
    };
  }, [currentUsername]);

  // Fetch messages for a room
  const fetchMessages = useCallback(async () => {
    if (!roomName) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Use direct Supabase query (works on mobile without CORS issues)
      if (!supabase) {
        console.error('💬 Supabase client not available');
        setError('Chat service not available');
        setIsLoading(false);
        return;
      }
      
      console.log('💬 Fetching messages from public_chat_messages view for room:', roomName);
      
      // Try the public view first (bypasses RLS for mobile)
      let { data, error: supaError } = await supabase
        .from('public_chat_messages')
        .select('*')
        .eq('room_name', roomName)
        .order('created_at', { ascending: true })
        .limit(100);

      // Fallback to direct table if view doesn't exist
      if (supaError && supaError.code === '42P01') {
        console.log('💬 View not found, falling back to chat_messages table');
        const fallbackResult = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_name', roomName)
          .order('created_at', { ascending: true })
          .limit(100);
        data = fallbackResult.data;
        supaError = fallbackResult.error;
      }

      if (supaError) {
        console.error('💬 Supabase fetch error:', supaError);
        throw new Error(supaError.message);
      }

      console.log('💬 Fetched', data?.length || 0, 'messages from Supabase');
      const formattedMessages = (data || []).map(convertMessage);
      setMessages(formattedMessages);

    } catch (error) {
      console.error('🔥 Fetch messages error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomName, convertMessage]);

  // Post a new message
  const postMessage = useCallback(async (
    messageText: string,
    walletAddress?: string,
    isAI: boolean = false,
    aiAgentId?: string,
    customUsername?: string,
    profileIcon?: string
  ) => {
    if (!messageText.trim() || !roomName) return false;
    if (!supabase) {
      console.error('💬 Supabase client not available for posting');
      return false;
    }

    // Use custom username for AI agents, otherwise use current username
    const displayUsername = customUsername || currentUsername;
    if (!displayUsername) return false;

    try {
      // Use direct Supabase insert (works on mobile without CORS issues)
      console.log('💬 Posting message directly to Supabase for room:', roomName);
      const insertData: any = {
        room_name: roomName,
        username: displayUsername,
        wallet_address: walletAddress,
        message_text: messageText.trim(),
        is_ai: isAI,
        ai_agent_id: aiAgentId
      };
      
      const { data, error: supaError } = await supabase
        .from('chat_messages')
        .insert(insertData)
        .select()
        .single();

      if (supaError) {
        console.error('💬 Supabase post error:', supaError);
        throw new Error(supaError.message);
      }

      console.log('💬 Message posted successfully:', data?.id);
      
      // Add the new message to local state immediately for better UX
      const newMessage = convertMessage(data);
      setMessages(prev => [...prev, newMessage]);

      return true;

    } catch (error) {
      console.error('🔥 Post message error:', error);
      setError(error instanceof Error ? error.message : 'Failed to post message');
      return false;
    }
  }, [roomName, currentUsername, convertMessage]);

  // Set up real-time subscription
  useEffect(() => {
    if (!roomName || !supabase) return;

    const channel = supabase
      .channel(`chat_${roomName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_name=eq.${roomName}`
        },
        (payload) => {
          const newMessage = convertMessage(payload.new as ChatMessage);
          setMessages(prev => {
            // Avoid duplicates if we already have this message
            if (prev.find(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [roomName, convertMessage]);

  // Fetch messages when room changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    postMessage,
    refetch: fetchMessages
  };
};

export default useChatMessages;
