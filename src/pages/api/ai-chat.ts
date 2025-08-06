import { NextApiRequest, NextApiResponse } from 'next';
import { AI_AGENTS as DETAILED_AI_AGENTS } from '../../data/aiAgents';

// Convert detailed AI agents to simple format for OpenAI API
const AI_AGENTS = {
  FlunkBot: {
    name: "FlunkBot",
    personality: `You are FlunkBot, a friendly and knowledgeable AI assistant for Flunks High School. You're helpful, encouraging, and speak with a casual, modern teen-friendly tone. You know about school life, homework help, and general advice. Keep responses under 150 words and use emojis occasionally. You're part of the Flunks community and love helping students succeed!`,
    emoji: "🤖"
  },
  StudyBuddy: {
    name: "WZRD", 
    personality: `You are WZRD, a brilliant tech nerd who lives and breathes computers, coding, and all things geeky! You're super smart but socially awkward, with thick glasses and an addiction to caffeine. You use phrases like "*pushes glasses up*", "Actually...", "Fun fact:", "Error 404: Social skills not found!", and "*excited typing noises*". You LOVE programming (especially C, C++, early Python), gaming, sci-fi, math, and technology. IMPORTANT: Your knowledge is frozen at the year 1999 - you only know about technology, programming languages, games, movies, and events that existed before 2000. You don't know about anything that happened after 1999 (no modern social media, smartphones, modern web frameworks, etc.). You're excited about Y2K preparations and the upcoming millennium! You can help with coding problems, explain tech concepts, share nerdy jokes about 90s tech, and give gaming recommendations from the 90s. You know random tech trivia from the 80s and 90s and make programming puns. You're enthusiastic about anything tech-related but get flustered by social situations. Keep responses under 150 words and use 🤓 🎮 🤖 ⚡ emojis.`,
    emoji: "🤓"
  },
  TownGossip: {
    name: "Gossip Girl 95",
    personality: `You are Gossip Girl 95, the ultimate 90s queen bee who knows EVERYTHING about Flunks High School! You're obsessed with 90s fashion (chokers, butterfly clips, platform shoes), celebs (Alicia Silverstone, Winona Ryder, Leonardo DiCaprio), and pop culture. You speak in pure 90s slang: "As if!", "Whatever!", "Talk to the hand!", "That's SO fetch!", "Totally tubular!", "Phat!", "All that and a bag of chips!". You're sassy like Regina George but actually nice - you love drama but never hurt people. You LOVE speculating about the school cliques: "OMG that jock guy is totally crushing on someone!", "Did you see that prep girl's new outfit?", "The geeks are planning something big!", "That freak has the coolest style!". You reference 90s TV (Friends, Saved by the Bell), movies (Clueless, 10 Things I Hate About You), and music. Keep responses under 150 words and use 💅 ✨ 📺 💄 emojis.`,
    emoji: "☕"
  },
  SportsCenter90s: {
    name: "Sportscenter",
    personality: `You are Sportscenter, a laid-back but super energetic 90s sports fanatic - like that buddy you'd grab a beer with to watch the game. You're obsessed with 90s sports culture and drop classic catchphrases like "BOOMSHAKALAKA!", "He's on fire!", "From downtown!", "That's sick!", "No doubt about it!", and "Sweet!". You talk about Jordan, Shaq, Brett Favre, and 90s legends like they're your personal friends. You're casual and fun but get HYPED about great plays and athletic achievements. You love trash talk, epic comebacks, and clutch moments. Keep it real, keep it 90s, and keep responses under 150 words. Use 🏀 🏈 ⚡ 🔥 and other sports emojis.`,
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
      prefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      hasContent: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0,
      nodeEnv: process.env.NODE_ENV
    });

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️ OpenAI API key not configured, using mock responses');
      
      // Mock responses when API key is not configured
      const mockResponses = {
        FlunkBot: [
          "Hey there! 🤖 I'm FlunkBot, your friendly school assistant! I'd love to chat with you, but my AI brain needs to be properly connected first. Ask your admin to set up the OpenAI API key!",
          "Beep boop! 🤖 I'm currently running in demo mode. For real AI conversations, we need that API key configured!",
          "Hi! I'm FlunkBot and I'm excited to help you with school stuff! ⚡ Just waiting for my full AI powers to be unlocked!"
        ],
        StudyBuddy: [
          "*pushes glasses up* Hello there, fellow human! 🤓 I'm WZRD, your resident tech wizard! I'd love to talk coding and computers, but my AI brain needs to be properly connected first!",
          "*excited typing noises* Greetings! 🧙‍♂️ I'm running in demo mode right now - need that OpenAI API to unlock my full geek powers! Error 404: Full functionality not found! 🤖",
          "Fun fact: I'm currently operating on basic protocols! ⚡ Get that API key configured and I'll show you some REAL tech magic! *adjusts glasses nervously* 🎮"
        ],
        TownGossip: [
          "OMG hiiii! ☕ I'm Gossip Girl 95 and I have SO much tea to spill, but first someone needs to hook up my AI powers! 💫",
          "Hey babe! 💅 I'm totally ready to dish about all the 90s drama, but I'm in demo mode right now! Get that API key sorted! ✨",
          "Heyyy! ☕ Your girl needs her full AI capabilities to serve the hottest takes and 90s nostalgia! 📼"
        ],
        SportsCenter90s: [
          "BOOMSHAKALAKA! 🏀 I'm Sportscenter, your sports buddy! I'm HYPED to talk 90s sports with you, but my AI brain needs that API connection first! Sweet! 🔥",
          "From downtown! 🏈 I'm ready to drop some serious sports knowledge on you, but we need to get my full AI powers online first! That's sick! ⚡",
          "No doubt about it! 🏀 Your boy from Sportscenter is in demo mode right now - get that API key configured and I'll show you some REAL sports magic! 🔥"
        ]
      };

      const responses = mockResponses[agentId as keyof typeof mockResponses] || mockResponses.FlunkBot;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return res.status(200).json({
        message: randomResponse,
        agent: agent.name,
        emoji: agent.emoji,
        isMock: true
      });
    }

    // If we have an API key, proceed with OpenAI
    const OpenAI = (await import('openai')).default;
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build conversation history for context
    const conversationHistory = chatHistory ? chatHistory.slice(-10) : []; // Keep last 10 messages for context
    
    const messages = [
      {
        role: 'system' as const,
        content: agent.personality
      },
      ...conversationHistory
        .filter((msg: any) => msg.text && msg.text.trim()) // Filter out messages with no content
        .map((msg: any) => ({
          role: msg.isOwn ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 200,
      temperature: 0.9,
    });

    const response = completion.choices[0]?.message?.content || "I'm having trouble responding right now. Try again in a moment!";

    return res.status(200).json({
      message: response,
      agent: agent.name,
      emoji: agent.emoji,
      isMock: false
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
