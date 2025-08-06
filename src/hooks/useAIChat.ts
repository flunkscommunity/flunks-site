import { useState, useCallback } from 'react';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
  isAI?: boolean;
}

interface AIResponse {
  message: string;
  agent: string;
  emoji: string;
  isMock?: boolean;
}

const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendToAI = useCallback(async (
    message: string,
    agentId: string,
    username: string,
    chatHistory: Message[] = []
  ): Promise<AIResponse | null> => {
    if (!message.trim() || !agentId) return null;

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          agentId,
          username,
          chatHistory: chatHistory.slice(-6) // Send last 6 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data;

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Return a fallback response
      return {
        message: "Sorry, I'm having trouble connecting right now! 🤔 Please try again in a moment.",
        agent: "System",
        emoji: "⚠️"
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendToAI,
    isLoading
  };
};

export default useAIChat;
