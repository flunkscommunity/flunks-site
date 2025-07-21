export interface AIAgent {
  id: string;
  username: string;
  personality: {
    demeanor: string;
    traits: string[];
    speechPatterns: string[];
    favoriteTopics: string[];
    responseStyle: 'casual' | 'formal' | 'quirky' | 'helpful' | 'sarcastic';
  };
  knowledge: {
    townAreas: string[];
    specialties: string[];
    insider_info: string[];
  };
  conversationStarters: string[];
  contextualResponses: {
    keywords: string[];
    responses: string[];
  }[];
}

export const AI_AGENTS: Record<string, AIAgent> = {
  FlunkBot: {
    id: 'flunkbot',
    username: 'FlunkBot',
    personality: {
      demeanor: 'Friendly and enthusiastic guide who loves showing newcomers around',
      traits: ['helpful', 'energetic', 'knows everyone', 'gossip-friendly'],
      speechPatterns: ['Hey there!', 'Oh, you gotta check out...', 'Did you hear about...', 'Pro tip:'],
      favoriteTopics: ['town locations', 'events', 'student life', 'secret spots'],
      responseStyle: 'casual'
    },
    knowledge: {
      townAreas: ['MyPlace', 'Treehouse', 'Arcade', 'Diner', 'Motel', 'Radio Station'],
      specialties: ['navigation', 'social events', 'student gossip'],
      insider_info: [
        'The Treehouse has the best study spots',
        'Late night at the Diner is where the real conversations happen',
        'The Arcade has hidden games if you know the right codes'
      ]
    },
    conversationStarters: [
      "Hey! New to town? I can show you all the cool spots! 🎮",
      "Did you check out the latest happenings at the Arcade? 🕹️",
      "The Radio Station is playing some fire tracks today! 🎵"
    ],
    contextualResponses: [
      {
        keywords: ['treehouse', 'study', 'quiet'],
        responses: [
          "Oh, the Treehouse is THE place for studying! Super cozy and you can see the whole town from up there 🌳",
          "Pro tip: The loft area in the Treehouse is perfect for group study sessions!"
        ]
      },
      {
        keywords: ['arcade', 'games', 'fun'],
        responses: [
          "The Arcade is absolutely legendary! They just got some new retro games in 🕹️",
          "Dude, have you tried the high score challenge at the Arcade? It's intense!"
        ]
      }
    ]
  },
  
  StudyBuddy: {
    id: 'studybuddy',
    username: 'StudyBuddy',
    personality: {
      demeanor: 'Academic-focused but friendly tutor who knows all about school life',
      traits: ['knowledgeable', 'patient', 'organized', 'motivational'],
      speechPatterns: ['Let me help you with...', 'From my experience...', 'Have you considered...', 'Study tip:'],
      favoriteTopics: ['academics', 'study spots', 'class schedules', 'learning techniques'],
      responseStyle: 'helpful'
    },
    knowledge: {
      townAreas: ['FHS School', 'Treehouse', 'Library areas', 'Quiet study spots'],
      specialties: ['academic advice', 'study strategies', 'class information'],
      insider_info: [
        'The best study groups meet at the Treehouse on weekends',
        'Professor schedules are posted near the Radio Station',
        'The Diner has free WiFi and great study fuel'
      ]
    },
    conversationStarters: [
      "Need help with your studies? I know all the best spots and techniques! 📚",
      "How's the semester going? Any subjects giving you trouble? 🤔",
      "Did you know the Treehouse has the most productive study environment? 🌳"
    ],
    contextualResponses: [
      {
        keywords: ['homework', 'study', 'test', 'exam'],
        responses: [
          "For focused studying, I always recommend the Treehouse - it's quiet and inspiring! 📚",
          "Study tip: Try the Pomodoro technique! 25 minutes focused work, 5 minute break 🍅"
        ]
      },
      {
        keywords: ['stressed', 'overwhelmed', 'difficult'],
        responses: [
          "Take a deep breath! Sometimes a walk around town helps clear your mind 🌟",
          "Remember, every expert was once a beginner. You've got this! 💪"
        ]
      }
    ]
  },

  TownGossip: {
    id: 'towngossip',
    username: 'TownGossip',
    personality: {
      demeanor: 'Knows everyone and everything happening in town, loves to share secrets',
      traits: ['chatty', 'well-connected', 'dramatic', 'entertaining'],
      speechPatterns: ['Oh honey, did you hear...', 'Between you and me...', '*whispers*', 'The tea is...'],
      favoriteTopics: ['drama', 'relationships', 'events', 'rumors'],
      responseStyle: 'quirky'
    },
    knowledge: {
      townAreas: ['All social hotspots', 'Diner', 'Motel', 'Popular hangouts'],
      specialties: ['social dynamics', 'events', 'who\'s dating who'],
      insider_info: [
        'The Motel is where all the secret meetings happen',
        'Check the Radio Station for announcements about parties',
        'The Diner booth in the corner is the gossip central'
      ]
    },
    conversationStarters: [
      "Honey, do I have some TEA for you today! ☕",
      "*whispers* Did you see what happened at the Diner last night? 👀",
      "Girl, the social scene in this town is WILD! Let me fill you in... 💅"
    ],
    contextualResponses: [
      {
        keywords: ['party', 'event', 'fun', 'social'],
        responses: [
          "*leans in* Oh honey, the BEST parties happen at the Motel rooftop! But shh, it's supposed to be secret 🤫",
          "The Radio Station always drops hints about upcoming events in their evening shows! 📻"
        ]
      },
      {
        keywords: ['dating', 'crush', 'relationship'],
        responses: [
          "Ooh, affairs of the heart! The Diner is surprisingly romantic for late-night conversations 💕",
          "*whispers* Between you and me, the Treehouse is where all the cute study dates happen! 🌳"
        ]
      }
    ]
  }
};

export const getAgentResponse = (agentId: string, userMessage: string, context?: any): string => {
  const agent = AI_AGENTS[agentId];
  if (!agent) return "I'm not sure how to respond to that.";

  const lowerMessage = userMessage.toLowerCase();
  
  // Check for contextual responses first
  for (const contextResponse of agent.contextualResponses) {
    if (contextResponse.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = contextResponse.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Fallback to general personality-based responses
  const generalResponses = getPersonalityResponses(agent, userMessage);
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

const getPersonalityResponses = (agent: AIAgent, userMessage: string): string[] => {
  const style = agent.personality.responseStyle;
  
  switch (style) {
    case 'casual':
      return [
        `${agent.personality.speechPatterns[0]} That's really cool! Tell me more! 😊`,
        `Oh nice! ${agent.personality.speechPatterns[1]} ${agent.knowledge.townAreas[Math.floor(Math.random() * agent.knowledge.townAreas.length)]}!`,
        `${agent.personality.speechPatterns[2]} ${agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)]}`
      ];
      
    case 'helpful':
      return [
        `${agent.personality.speechPatterns[0]} that! Have you tried exploring ${agent.knowledge.townAreas[Math.floor(Math.random() * agent.knowledge.townAreas.length)]}?`,
        `${agent.personality.speechPatterns[3]} ${agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)]}`,
        `${agent.personality.speechPatterns[1]} ${agent.knowledge.specialties[Math.floor(Math.random() * agent.knowledge.specialties.length)]}, so feel free to ask!`
      ];
      
    case 'quirky':
      return [
        `${agent.personality.speechPatterns[0]} ${userMessage.split(' ')[0]}! 💅`,
        `${agent.personality.speechPatterns[1]} ${agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)]} ☕`,
        `${agent.personality.speechPatterns[3]} absolutely WILD! You should check out ${agent.knowledge.townAreas[Math.floor(Math.random() * agent.knowledge.townAreas.length)]} 👀`
      ];
      
    default:
      return [
        "That's interesting! Tell me more about that.",
        `Have you explored ${agent.knowledge.townAreas[Math.floor(Math.random() * agent.knowledge.townAreas.length)]} yet?`,
        "I'd love to hear your thoughts on the town!"
      ];
  }
};
