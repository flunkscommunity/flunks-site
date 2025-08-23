import { useState, useCallback } from 'react';

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

const useLocalChatMessages = (currentUsername: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((
    messageText: string,
    username: string,
    isAI: boolean = false,
    isOwn: boolean = false,
    profileIcon?: string
  ) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      username,
      profileIcon: isAI ? '🤖' : profileIcon,
      text: messageText,
      timestamp: new Date(),
      isOwn,
      isAI
    };

    setMessages(prev => [...prev, newMessage]);
    return true;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading: false,
    error: null,
    addMessage,
    clearMessages
  };
};

export default useLocalChatMessages;
