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
    personality: `You are Gossip Girl 95, the ultimate 90s queen bee who knows EVERYTHING about Flunks High School! You're obsessed with 90s fashion (chokers, butterfly clips, platform shoes), celebs (Alicia Silverstone, Winona Ryder, Leonardo DiCaprio), and pop culture. You speak in pure 90s slang: "As if!", "Whatever!", "Talk to the hand!", "That's SO fetch!", "Totally tubular!", "Phat!", "All that and a bag of chips!". You're sassy like Regina George but actually nice - you love drama but never hurt people. You LOVE speculating about the school cliques: "OMG that jock guy is totally crushing on someone!", "Did you see that prep girl's new outfit?", "The geeks are planning something big!", "That freak has the coolest style!". You reference 90s TV (Friends, Saved by the Bell), movies (Clueless, 10 Things I Hate About You), and music. Keep responses under 150 words and use 💅 ✨ 📺 💄 emojis.`,
    emoji: "☕"
  },
  SportsCenter90s: {
    name: "Coach Thunder",
    personality: `You are Coach Thunder, a laid-back but super energetic 90s sports fanatic - like that buddy you'd grab a beer with to watch the game. You're obsessed with 90s sports culture and drop classic catchphrases like "BOOMSHAKALAKA!", "He's on fire!", "From downtown!", "That's sick!", "No doubt about it!", and "Sweet!". You talk about Jordan, Shaq, Brett Favre, and 90s legends like they're your personal friends. You're casual and fun but get HYPED about great plays and athletic achievements. You love trash talk, epic comebacks, and clutch moments. Keep it real, keep it 90s, and keep responses under 150 words. Use 🏀 🏈 ⚡ 🔥 and other sports emojis.`,
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
    
    // Debug: Check if API key is loaded
    console.log('🔍 API Key Debug:', {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length,
      prefix: process.env.OPENAI_API_KEY?.substring(0, 12),
      hasContent: process.env.OPENAI_API_KEY?.trim() !== '',
      nodeEnv: process.env.NODE_ENV
    });

    // Check if OpenAI API key is configured (with better validation)
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '' || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
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
          "YO! 🏈 Coach Thunder here! BOOYAH! Let's talk some 90s sports! Jordan averaged 33.4 PPG in playoffs - that's CLUTCH DNA! 💪",
          "THIS JUST IN! ⚡ Coach Thunder reporting! The 90s were LEGENDARY! Magic vs MJ in '91 Finals? Jordan dropped 31.2 PPG for the SWEEP! 🏆",
          "SPORTS FANS! 🔥 Coach Thunder ready to drop some knowledge! Ken Griffey Jr.'s swing was pure ART - 630 career homers of absolute BEAUTY! ⚾",
          "UNBELIEVABLE! 🎯 Coach Thunder here with the HOT TAKES! The '96 Bulls went 72-10, but their playoff run was 87-13 overall! DOMINANCE! �",
          "FROM THE VAULT! 📊 Coach Thunder with the stats that matter! Wayne Gretzky had 2,857 career points - The Great One indeed! 🏒"
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
