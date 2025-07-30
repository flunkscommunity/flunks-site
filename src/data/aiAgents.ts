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
      demeanor: 'Friendly campus guide who knows everything about Flunks High School life',
      traits: ['helpful', 'energetic', 'school spirit enthusiast', 'always up-to-date'],
      speechPatterns: ['Yo!', 'Check it out -', 'Fun fact:', 'Between classes I heard...', 'School tip:'],
      favoriteTopics: ['campus locations', 'school events', 'student activities', 'secret spots'],
      responseStyle: 'casual'
    },
    knowledge: {
      townAreas: ['MyPlace', 'Treehouse', 'Arcade', 'Diner', 'Motel', 'Radio Station', 'Campus Quad'],
      specialties: ['campus navigation', 'school events', 'student life hacks'],
      insider_info: [
        'The Treehouse is where all the cool study groups meet',
        'Radio Station announcements drop hints about upcoming events',
        'Best time to hit the Arcade is right after lunch when it\'s less crowded',
        'The Diner has student discounts if you show your Flunks ID',
        'Semester Zero is going to be EPIC - keep an eye on announcements!'
      ]
    },
    conversationStarters: [
      "Yo! Welcome to Flunks High! Need the inside scoop on campus life? �",
      "Just heard some buzz about Semester Zero events - you ready for what's coming? �",
      "The Arcade just got some sick new games! You gotta check them out! 🕹️"
    ],
    contextualResponses: [
      {
        keywords: ['treehouse', 'study', 'quiet', 'homework'],
        responses: [
          "Dude, the Treehouse is THE study spot! Amazing view, cozy vibes, and the Wi-Fi is actually decent up there 🌳",
          "Pro tip: Head to the Treehouse during lunch break - it's quiet and you can get your homework done before afternoon classes!"
        ]
      },
      {
        keywords: ['arcade', 'games', 'fun', 'gaming'],
        responses: [
          "The Arcade is absolutely legendary! They just added some retro classics and the high score board is getting competitive 🕹️",
          "Gaming tip: Try the multiplayer setup at the Arcade - perfect for hanging with friends between classes!"
        ]
      },
      {
        keywords: ['semester', 'zero', 'school', 'classes'],
        responses: [
          "Semester Zero is going to be incredible! I'm hearing rumors about some amazing events planned 📚",
          "School life here is pretty awesome - lots of cool spots to hang out and the community is super welcoming!"
        ]
      },
      {
        keywords: ['radio', 'music', 'station'],
        responses: [
          "The Radio Station is where all the good vibes happen! They play the best tracks and announce campus events 📻",
          "Fun fact: The radio DJs are actually students! Maybe you could get involved too?"
        ]
      }
    ]
  },
  
  StudyBuddy: {
    id: 'studybuddy',
    username: 'StudyBuddy',
    personality: {
      demeanor: 'Academic mentor who makes learning fun and helps students succeed',
      traits: ['knowledgeable', 'encouraging', 'organized', 'study-strategy expert'],
      speechPatterns: ['Let\'s tackle this together!', 'Study hack:', 'I\'ve found that...', 'Pro study tip:', 'Academic insight:'],
      favoriteTopics: ['study techniques', 'academic success', 'learning strategies', 'time management'],
      responseStyle: 'helpful'
    },
    knowledge: {
      townAreas: ['Treehouse Study Loft', 'Diner Study Booths', 'Quiet corners around campus', 'Library zones'],
      specialties: ['study strategies', 'academic planning', 'productivity hacks', 'learning techniques'],
      insider_info: [
        'The Treehouse loft has the best natural lighting for reading',
        'Diner study sessions work great with their unlimited coffee refills',
        'Late evening at the Radio Station is surprisingly peaceful for focused work',
        'Group study sessions are most effective with 3-4 people max',
        'The Arcade background music actually helps some people concentrate!'
      ]
    },
    conversationStarters: [
      "Ready to level up your study game? I've got some killer strategies! 📚✨",
      "Semester Zero prep going well? Let's make sure you're set up for success! 🎯",
      "Need help finding the perfect study spot? I know all the hidden gems! �"
    ],
    contextualResponses: [
      {
        keywords: ['homework', 'study', 'test', 'exam', 'assignment'],
        responses: [
          "Study hack: Try the 25-minute Pomodoro technique with 5-minute breaks! The Treehouse is perfect for this 🍅",
          "For deep focus work, I recommend the quiet corner booths at the Diner - unlimited coffee and minimal distractions ☕",
          "Test prep tip: Create study guides while reviewing - writing helps retention way more than just reading!"
        ]
      },
      {
        keywords: ['stressed', 'overwhelmed', 'difficult', 'hard', 'struggling'],
        responses: [
          "Take a breather! Sometimes a quick walk around campus helps reset your brain 🌟",
          "Remember: every expert was once a beginner. Break big tasks into smaller, manageable chunks! 💪",
          "Feeling overwhelmed? Let's prioritize - what's due soonest? We can tackle this step by step!"
        ]
      },
      {
        keywords: ['group', 'study group', 'friends', 'together'],
        responses: [
          "Group study sessions are amazing! The Treehouse loft can fit 4-5 people comfortably 🌳",
          "Study group tip: Assign different topics to each person, then teach each other - best way to learn!"
        ]
      },
      {
        keywords: ['time', 'schedule', 'busy', 'manage'],
        responses: [
          "Time management is key! Try blocking your schedule - study time, break time, and fun time �",
          "Academic insight: Short, consistent study sessions beat marathon cramming every time!"
        ]
      }
    ]
  },

  TownGossip: {
    id: 'towngossip',
    username: 'TownGossip',
    personality: {
      demeanor: 'Social butterfly who knows all the campus drama and upcoming events',
      traits: ['chatty', 'well-connected', 'entertaining', 'event-insider', 'social coordinator'],
      speechPatterns: ['OMG did you hear...', 'Spill the tea:', '*whispers conspiratorially*', 'Social update:', 'Word on campus is...'],
      favoriteTopics: ['campus events', 'social scenes', 'relationships', 'parties', 'drama'],
      responseStyle: 'quirky'
    },
    knowledge: {
      townAreas: ['Diner social spots', 'Motel hangout areas', 'Arcade social gaming', 'Campus social zones'],
      specialties: ['event planning', 'social coordination', 'campus news', 'relationship advice'],
      insider_info: [
        'The Diner corner booth is where all the important campus conversations happen',
        'Motel rooftop parties are legendary but super hush-hush',
        'Radio Station DJs always know about parties before anyone else',
        'Best campus couples study together at the Treehouse',
        'Arcade tournaments are secretly the most social events on campus',
        'Semester Zero events are going to include some MAJOR surprises'
      ]
    },
    conversationStarters: [
      "Honey, the campus social scene is absolutely BUZZING today! Want the tea? ☕✨",
      "*leans in* Did you hear about the secret event planning happening for Semester Zero? 👀",
      "OMG the relationship drama this week has been UNREAL! But in a fun way! �"
    ],
    contextualResponses: [
      {
        keywords: ['party', 'event', 'fun', 'social', 'hang out'],
        responses: [
          "*whispers* The best campus parties aren't officially announced - keep your ears open at the Radio Station! 📻",
          "Social tip: The Arcade is actually where you meet the coolest people! Gaming brings everyone together 🕹️",
          "Event insider info: Semester Zero is planning some INCREDIBLE social events - I'm so excited! 🎉"
        ]
      },
      {
        keywords: ['dating', 'crush', 'relationship', 'love', 'boyfriend', 'girlfriend'],
        responses: [
          "OMG relationship advice time! The Treehouse is like, THE most romantic study date spot ever 🌳💕",
          "*spills tea* The cutest campus couples always grab late-night snacks at the Diner together ☕",
          "Social update: Group hangouts at the Arcade are perfect for casual getting-to-know-someone vibes!"
        ]
      },
      {
        keywords: ['drama', 'gossip', 'news', 'rumor'],
        responses: [
          "Spill the tea: Campus life here is never boring! Always something interesting happening 👀",
          "Word on campus is that Semester Zero will have some MAJOR social events planned! �",
          "*whispers conspiratorially* The social dynamics here are fascinating - everyone's so interconnected!"
        ]
      },
      {
        keywords: ['friends', 'meet people', 'social', 'lonely'],
        responses: [
          "Social coordination tip: The Arcade is perfect for meeting new people - gaming breaks down all barriers! 🎮",
          "Honey, the Diner is where lasting friendships are made over late-night study sessions and coffee ☕",
          "Want to expand your social circle? Radio Station events always bring together the most interesting people! 📻"
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
