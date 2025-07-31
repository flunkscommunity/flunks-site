// Integration guide for upgrading your chat system

// Step 1: Update FlunksMessenger.tsx to use intelligent responses
// Add this to your imports:
import { getIntelligentAgentResponse } from '../data/intelligentAI';

// Step 2: Replace the AI response logic in your sendMessage function
const sendMessageWithIntelligentAI = () => {
  if (currentMessage.trim() && username) {
    // Play send sound
    if (soundsEnabled) sounds.messageSend();
    
    const newMessage: Message = {
      id: Date.now().toString(),
      username: username,
      text: currentMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    const messageToAnalyze = currentMessage.trim();
    setCurrentMessage('');
    setIsTyping(false);

    // Enhanced AI response for AI rooms
    const room = chatRooms.find(r => r.username === selectedContact);
    if (room?.isAI && room.agentId && AI_AGENTS[room.agentId]) {
      setTimeout(() => {
        if (soundsEnabled) sounds.messageReceive();
        
        // Get conversation history for context
        const recentMessages = messages.slice(-5).map(m => m.text);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          username: room.agentId,
          text: getIntelligentAgentResponse(room.agentId, messageToAnalyze, recentMessages),
          timestamp: new Date(),
          isOwn: false
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000 + Math.random() * 2000);
    }
  }
};

// Step 3: For Real AI (OpenAI), you'd need to:
// 1. Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local
// 2. Install: npm install openai
// 3. Create an API route: /pages/api/ai-chat.ts

/*
// /pages/api/ai-chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId, userMessage, conversationHistory } = req.body;
    
    const systemPrompt = getSystemPrompt(agentId);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: "user", content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    res.status(200).json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
}

function getSystemPrompt(agentId: string): string {
  switch (agentId) {
    case 'SportsCenter90s':
      return "You are SportsCenter90s, an enthusiastic 90s sports broadcaster...";
    default:
      return "You are a helpful AI assistant.";
  }
}
*/

// Step 4: Then in your chat component, call the API:
const getRealAIResponse = async (agentId: string, userMessage: string, history: string[]) => {
  try {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        userMessage,
        conversationHistory: history.map(msg => ({ role: 'user', content: msg }))
      })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI API Error:', error);
    return "My sports database is temporarily down! Try again in a moment! 🏆";
  }
};

export { sendMessageWithIntelligentAI, getRealAIResponse };
