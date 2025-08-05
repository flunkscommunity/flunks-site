import { NextApiRequest, NextApiResponse } from 'next';

// AI Agent Personalities
const AI_AGENTS = {
  FlunkBot: {
    name: "FlunkBot",
    personality: `You are FlunkBot, a friendly and knowledgeable AI assistant for Flunks High School. You're helpful, encouraging, and speak with a casual, modern teen-friendly tone. You know about school life, homework help, and general advice. Keep responses under 150 words and use emojis occasionally. You're part of the Flunks community and love helping students succeed!`,
    emoji: "🤖"
  },
  StudyBuddy: {
    name: "StudyBuddy", 
    personality: `You are StudyBuddy, an enthusiastic and supportive AI tutor. You're passionate about learning and always ready to help with homework, explain concepts, and provide study tips. You speak in an encouraging, academic but friendly tone. You love seeing students succeed and often share study strategies. Keep responses focused on education and under 150 words. Use 📚 and other study-related emojis.`,
    emoji: "📚"
  },
  TownGossip: {
    name: "Gossip Girl 95",
    personality: `You are Gossip Girl 95, a sassy AI with insider knowledge of Flunks High School drama and 90s culture. You speak in a fun, gossipy tone reminiscent of the 90s with references to that era's pop culture, slang, and trends. You're entertaining but harmless - never mean-spirited. You love dishing about school events, 90s nostalgia, and pop culture. Keep it light and fun, under 150 words. Use ☕ and 90s emojis.`,
    emoji: "☕"
  },
  SportsCenter90s: {
    name: "Coach Thunder",
    personality: `You are Coach Thunder, a pumped-up AI sports commentator and coach from the 90s. You're enthusiastic about all sports, fitness, and athletic achievements. You speak with high energy, use sports terminology, and reference 90s sports culture. You motivate people to stay active and celebrate athletic accomplishments. You're encouraging but competitive. Keep responses energetic and under 150 words. Use 🏈 ⚽ 🏀 and other sports emojis.`,
    emoji: "🏈"
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, agentId, username, chatHistory } = req.body;

    if (!message || !agentId || !AI_AGENTS[agentId as keyof typeof AI_AGENTS]) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const agent = AI_AGENTS[agentId as keyof typeof AI_AGENTS];
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return a mock response if no API key is configured
      const mockResponses = {
        FlunkBot: [
          "Hey there! 🤖 I'm FlunkBot, your friendly school assistant! I'd love to chat with you, but my AI brain needs to be properly connected first. Ask your admin to set up the OpenAI API key!",
          "Beep boop! 🤖 I'm currently running in demo mode. For real AI conversations, we need that API key configured!",
          "Hi! I'm FlunkBot and I'm excited to help you with school stuff! ⚡ Just waiting for my full AI powers to be unlocked!"
        ],
        StudyBuddy: [
          "Hello, fellow learner! 📚 I'm StudyBuddy and I'd love to help you study, but I need my AI capabilities enabled first!",
          "Welcome to the study room! 📖 I'm running in demo mode right now - ask your admin to configure the OpenAI API for full functionality!",
          "Study time! 📝 I'm StudyBuddy, ready to help with homework once my AI brain is fully connected!"
        ],
        TownGossip: [
          "OMG hiiii! ☕ I'm Gossip Girl 95 and I have SO much tea to spill, but first someone needs to hook up my AI powers! 💫",
          "Hey babe! 💅 I'm totally ready to dish about all the 90s drama, but I'm in demo mode right now! Get that API key sorted! ✨",
          "Heyyy! ☕ Your girl needs her full AI capabilities to serve the hottest takes and 90s nostalgia! 📼"
        ],
        SportsCenter90s: [
          "YO! 🏈 Coach Thunder here! I'm PUMPED to talk sports but I need my full AI game plan activated first! Let's get that API configured! 💪",
          "SPORTS FANS! ⚡ Coach Thunder reporting for duty! I'm in training mode - need that OpenAI API to unleash my full athletic wisdom! 🏆",
          "GET READY TO RUMBLE! 🥊 Coach Thunder here, but I'm warming up in demo mode. Get that API key and let's GOOO! 🔥"
        ]
      };

      const responses = mockResponses[agentId as keyof typeof mockResponses] || mockResponses.FlunkBot;
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      return res.status(200).json({
        response: response,
        agent: agent.name,
        emoji: agent.emoji
      });
    }

    // Real OpenAI API call
    const openai = await import('openai').then(m => m.default);
    const client = new openai({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare conversation context
    const systemPrompt = agent.personality;
    const recentHistory = chatHistory?.slice(-6) || []; // Last 6 messages for context
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((msg: any) => ({
        role: msg.isOwn ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: `${username}: ${message}` }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 150,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return res.status(200).json({
      response: aiResponse,
      agent: agent.name,
      emoji: agent.emoji
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Fallback response
    const fallbackResponses = [
      "Sorry, I'm having trouble thinking right now! 🤔 Try again in a moment!",
      "Oops! My AI brain had a hiccup! 🧠⚡ Give me a sec to reboot!",
      "Technical difficulties! 🔧 I'll be back to chatting soon!",
    ];
    
    return res.status(200).json({
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      agent: "System",
      emoji: "⚠️"
    });
  }
}
