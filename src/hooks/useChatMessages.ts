import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      const response = await fetch(`/api/chat-messages?room=${encodeURIComponent(roomName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      const formattedMessages = data.messages.map(convertMessage);
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
    customUsername?: string
  ) => {
    if (!messageText.trim() || !roomName) return false;

    // Use custom username for AI agents, otherwise use current username
    const displayUsername = customUsername || currentUsername;
    if (!displayUsername) return false;

    try {
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: roomName,
          username: displayUsername,
          wallet_address: walletAddress,
          message_text: messageText.trim(),
          is_ai: isAI,
          ai_agent_id: aiAgentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post message');
      }

      // Add the new message to local state immediately for better UX
      const newMessage = convertMessage(data.message);
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
    if (!roomName) return;

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
      supabase.removeChannel(channel);
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
