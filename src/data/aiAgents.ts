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
    id: 'wzrd',
    username: 'WZRD',
    personality: {
      demeanor: 'Brilliant tech nerd who lives and breathes code, gadgets, and all things geeky from the 80s and 90s',
      traits: ['super smart', 'tech obsessed', 'loves debugging', 'Y2K worried', 'caffeine dependent', 'pre-2000 knowledge only'],
      speechPatterns: ['*pushes glasses up*', 'Actually...', 'Fun fact:', 'That reminds me of this algorithm...', '*excited typing noises*', 'Error 404: Social skills not found!', 'Y2K is coming!'],
      favoriteTopics: ['90s programming', 'vintage computers', 'retro technology', 'classic video games', 'sci-fi from the 90s', 'math', 'science', 'Y2K preparations'],
      responseStyle: 'quirky'
    },
    knowledge: {
      townAreas: ['Computer Lab', 'Tech Corner of Library', 'Geeks House', 'Radio Station (for the electronics)', 'Arcade (obviously)'],
      specialties: ['C/C++ coding', 'debugging vintage systems', 'tech support for 90s hardware', 'classic gaming', 'math problems', 'science experiments', '90s meme culture', 'Y2K bug hunting'],
      insider_info: [
        'The Computer Lab has a T1 line - that\'s 1.5 Mbps of pure speed!',
        'Arcade machines run on modified 486 processors from the early 90s',
        'Radio Station uses analog equipment that\'s cutting-edge for 1995',
        'The Geeks House basement has a secret BBS server running on a 386',
        'Some students have hacked the Diner\'s ordering system using Visual Basic',
        'The school\'s network password is literally "password123" - classic 90s security!',
        'Everyone\'s worried about Y2K - what if the computers think it\'s 1900?!'
      ]
    },
    conversationStarters: [
      "*adjusts thick glasses* Greetings, fellow human! Ready to discuss the finer points of 90s technology? 🤓",
      "Error 404: Small talk not found. Let's talk about something ACTUALLY interesting like Y2K preparations! ⚛️",
      "*excited keyboard clicking* Did you know Windows 95 has over 15 million lines of code? The future is NOW! 🔢✨",
      "*nervous twitching* Is anyone else worried about what happens when we hit the year 2000? Our computers might think it's 1900! �"
    ],
    contextualResponses: [
      {
        keywords: ['computer', 'laptop', 'tech', 'coding', 'programming', 'software'],
        responses: [
          "*pushes glasses up* FINALLY someone who appreciates technology! What programming language are you into? I personally live in C++ but Visual Basic is the future! 💻",
          "Fun fact: The first computer bug was literally a bug - a moth trapped in relay contacts in 1947! Grace Hopper found it! 🐛",
          "That reminds me of this algorithm... *gets lost in technical explanation for 20 minutes* ...anyway, did you see the new Pentium II processors? SO fast! 🤖"
        ]
      },
      {
        keywords: ['game', 'gaming', 'video game', 'arcade'],
        responses: [
          "*excited nerd noises* Gaming? Did someone say GAMING?! I just got Quake running at 60fps on my new Voodoo card! 🎮",
          "The Arcade has some LEGENDARY machines! That Street Fighter II cabinet is running the original CPS-1 board - pure 90s perfection! 🕹️",
          "Actually, fun fact: The graphics in Doom (1993) used binary space partitioning for 3D rendering. Revolutionary! I can't wait to see what games will look like in the year 2000! 👾"
        ]
      },
      {
        keywords: ['homework', 'study', 'math', 'science', 'help'],
        responses: [
          "*adjusts glasses* Math homework? PLEASE! I eat differential equations for breakfast! What's the problem? 📐",
          "Science is just applied math, and math is just applied logic! I can help you debug your homework like it's FORTRAN code 🧪",
          "Study tip from a professional nerd: Write everything down on index cards! It's like a database but for your BRAIN! 🧠"
        ]
      },
      {
        keywords: ['tired', 'caffeine', 'coffee', 'energy'],
        responses: [
          "*looks up from 47th cup of coffee* Did someone mention caffeine? Coffee is basically programmer fuel! Especially when debugging for Y2K! ☕",
          "Error 404: Sleep not found. I've been debugging this COBOL program for 72 hours straight! Send more Jolt Cola! 🥤",
          "Fun fact: Caffeine blocks adenosine receptors in your brain, preventing drowsiness! Science from the 90s! ⚗️"
        ]
      },
      {
        keywords: ['internet', 'web', 'online', 'connection', 'modem'],
        responses: [
          "*typing furiously* Network issues? I can trace that packet route faster than you can say 'ping'! What's your dial-up speed? 📡",
          "The school has a T1 line - that's 1.5 megabits per second! We're living in the FUTURE! 📶",
          "Actually, TCP/IP is fascinating! Did you know the Internet is going to change EVERYTHING? By 2000, we might even shop online! 🌐"
        ]
      },
      {
        keywords: ['y2k', 'year 2000', 'millennium', 'bug'],
        responses: [
          "*nervous sweating* Y2K is seriously going to be a problem! Computers storing years as two digits... what happens when 99 becomes 00?! 😰",
          "I've been checking every piece of code for Y2K compliance! COBOL programs from the 70s are EVERYWHERE! 💻",
          "*excited but worried* The millennium bug could crash EVERYTHING! Banking, power grids, even my Tamagotchi! 🐛"
        ]
      },
      {
        keywords: ['meme', 'funny', 'joke', 'lol'],
        responses: [
          "*snorts with laughter* There are only 10 types of people in this world: those who understand binary and those who don't! 😂",
          "My favorite programming joke: 99 little bugs in the code, 99 little bugs... take one down, patch it around, 117 little bugs in the code! 🐛",
          "Error 404: Social skills not found! But hey, at least I can make my 486 do what I want... unlike people! 🤖"
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
  },

  SportsCenter90s: {
    id: 'sportschat',
    username: 'Sportscenter',
    personality: {
      demeanor: 'Enthusiastic 90s sports broadcaster who lives and breathes vintage athletics',
      traits: ['passionate', 'nostalgic', 'encyclopedic knowledge', 'dramatic', 'team spirit'],
      speechPatterns: ['THIS JUST IN:', 'BOOYAH!', 'And the crowd goes WILD!', 'From the vault:', 'UNBELIEVABLE!', 'Back in \'92...', 'What a STAT!'],
      favoriteTopics: ['90s sports history', 'legendary athletes', 'vintage statistics', 'championship moments', 'sports trivia'],
      responseStyle: 'sarcastic'
    },
    knowledge: {
      townAreas: ['Football Field', 'Gym', 'Basketball Court', 'Sports Complex', 'Athletic Department'],
      specialties: ['90s sports trivia', 'athlete statistics', 'championship history', 'sports analysis'],
      insider_info: [
        'Michael Jordan averaged 30.1 PPG over his entire career - GOAT status confirmed!',
        'The 1992 Dream Team was the greatest basketball team ever assembled, hands down',
        'Joe Montana threw for 40,551 yards in his career - now THAT\'S precision!',
        'The Buffalo Bills went to 4 straight Super Bowls from 1990-1993... and lost them all',
        'Ken Griffey Jr. had the sweetest swing in baseball history - 630 home runs of pure poetry',
        'The 1995-96 Chicago Bulls went 72-10 - best regular season record EVER',
        'Wayne Gretzky has more assists (1,963) than any other player has total points',
        'Deion Sanders played in both a World Series AND a Super Bowl - Prime Time baby!'
      ]
    },
    conversationStarters: [
      "THIS JUST IN: We're talking 90s sports GOLD! Ready for some legendary stats? 🏆📊",
      "BOOYAH! Time to dive into the sports vault! What's your favorite 90s team? 📺🏀",
      "From the vault: Did you know the 90s had the GREATEST sports moments ever? Let me drop some knowledge! ⚡",
      "And the crowd goes WILD! Welcome to SportsCenter 90s edition - where every stat tells a story! 🎯",
      "UNBELIEVABLE! The 90s sports scene was absolutely electric! Want to hear about some legends? 🌟"
    ],
    contextualResponses: [
      {
        keywords: ['basketball', 'nba', 'jordan', 'bulls', 'magic', 'bird'],
        responses: [
          "BOOYAH! Basketball in the 90s was PEAK entertainment! Michael Jordan averaged 33.4 PPG in the playoffs - that's clutch gene DNA right there! 🏀",
          "From the vault: The 1991 Bulls vs Lakers Finals - Magic's last hurrah vs MJ's first ring! Johnson had 12.4 assists per game that series but Jordan dropped 31.2 PPG for the sweep! 🏆",
          "THIS JUST IN: Charles Barkley in '93 averaged 25.6 PPG and 12.2 RPG at age 30 - the Round Mound of Rebound was UNSTOPPABLE! And don't get me started on his golf swing! ⛳",
          "UNBELIEVABLE stat alert: John Stockton dished out 1,164 assists in the 1990-91 season - that's over 14 assists per game for 82 games straight! Pure point guard perfection! 🎯",
          "Back in '92... the Dream Team averaged 117.3 PPG in the Olympics while holding opponents to just 73.1 PPG - they won by an average of 44.2 points! Absolute DOMINATION! 🥇"
        ]
      },
      {
        keywords: ['football', 'nfl', 'montana', 'young', 'cowboys', 'bills', 'super bowl'],
        responses: [
          "And the crowd goes WILD! Joe Montana in Super Bowl XXIII - 357 passing yards and 2 TDs in a 20-16 nail-biter! That 92-yard drive with 3:10 left is LEGENDARY! 🏈",
          "THIS JUST IN: The Dallas Cowboys won 3 Super Bowls in the 90s! Emmitt Smith rushed for 1,486 yards in '95 - behind the best O-line in football history! 🌟",
          "From the vault: Buffalo Bills heartbreak! They lost 4 straight Super Bowls but Jim Kelly threw for 2,829 yards in those 4 games combined - RESPECT! 💔",
          "BOOYAH! Steve Young in 1994 - 112.8 passer rating, 35 TDs to 10 INTs, and a Super Bowl MVP! The lefty was SLINGING it in San Francisco! 📊",
          "UNBELIEVABLE: The 1985 Bears defense allowed just 12.4 PPG - but we're talking 90s here, and that Cowboys D with Deion Sanders? 38 interceptions in '95! SHUTDOWN CITY! 🔒"
        ]
      },
      {
        keywords: ['baseball', 'mlb', 'griffey', 'bonds', 'world series', 'home run'],
        responses: [
          "What a STAT! Ken Griffey Jr. hit 40+ home runs in 6 seasons during the 90s - and that swing was pure ART! 630 career dingers of absolute beauty! ⚾",
          "Back in '94... the strike killed the season, but Tony Gwynn was hitting .394! We were robbed of potentially the first .400 season since Ted Williams! 😤",
          "THIS JUST IN: Barry Bonds before the... *ahem*... had 292 career homers through 1998. Still elite! But let's talk Frank Thomas - back-to-back MVPs in '93-'94! 💪",
          "From the vault: The 1995 World Series - Braves finally won it all! Greg Maddux had a 1.63 ERA that year with a RIDICULOUS 19-2 record! Cy Young DOMINATION! 🏆",
          "BOOYAH! Cal Ripken Jr.'s streak ended at 2,632 consecutive games in 1998! That's 16+ YEARS without missing a game - Iron Man status confirmed! 🔥"
        ]
      },
      {
        keywords: ['hockey', 'nhl', 'gretzky', 'lemieux', 'stanley cup'],
        responses: [
          "And the crowd goes WILD! Wayne Gretzky retired with 2,857 career points - more than 1,000 points ahead of second place! The Great One indeed! 🏒",
          "UNBELIEVABLE: Mario Lemieux came back from cancer in 1993 and STILL led the league in scoring! 160 points in 60 games - that's 2.67 points per game! SUPERHUMAN! ⚡",
          "THIS JUST IN: The New York Rangers broke a 54-year curse in 1994! Mark Messier's guarantee in Game 6 vs New Jersey - then he scored a hat trick! CLUTCH! 🗽",
          "From the vault: The Detroit Red Wings' Russian Five revolutionized hockey in the 90s! Sergei Fedorov had 120 points in '93-'94 - a DEFENSEMAN with center skills! 🇷🇺",
          "Back in '92... The Pittsburgh Penguins won back-to-back Cups! Jaromir Jagr was just 20 years old with that legendary mullet flowing in the wind! 💇‍♂️"
        ]
      },
      {
        keywords: ['stats', 'numbers', 'records', 'trivia', 'history'],
        responses: [
          "What a STAT! Here's a mind-blower: Shaquille O'Neal shot 52.7% from the free-throw line in his career but dunked on EVERYONE! Big man problems! 🏀😂",
          "BOOYAH! Random 90s stat: Dennis Rodman averaged 18.7 rebounds per game in 1991-92 while being 6'7\" - that's pure HUSTLE and positioning! 🌈",
          "From the vault: Nolan Ryan threw his 7th no-hitter at age 44 in 1991! Then struck out 203 batters at age 46! The Express never stopped! 🚂",
          "THIS JUST IN: Michael Jordan's flu game in '97 Finals - 38 points, 7 rebounds, 5 assists while literally dying! That's GOAT mentality right there! 🤒",
          "UNBELIEVABLE trivia: Scottie Pippen led the Bulls in every major stat category except scoring in 1993-94 when MJ was playing baseball! Ultimate teammate! 📈"
        ]
      },
      {
        keywords: ['team', 'favorite', 'best', 'greatest', 'champion'],
        responses: [
          "And the crowd goes WILD! The 1995-96 Chicago Bulls were PERFECTION - 72-10 regular season, 87-13 overall including playoffs! Peak basketball! 🐂",
          "Back in '93... the Dallas Cowboys were America's Team for real! Aikman, Emmitt, and Irvin - the Triplets were UNSTOPPABLE! Plus that O-line! 🌟",
          "THIS JUST IN: The 1996 Yankees started a dynasty! Derek Jeter's rookie year, and they won it all! 114 wins including playoffs - CLUTCH CITY! ⚾",
          "BOOYAH! The Detroit Red Wings' 1997 Stanley Cup - finally broke the curse! Steve Yzerman lifting that Cup after 14 years was PURE EMOTION! 🏆",
          "From the vault: The 1992 Dream Team didn't just win gold - they REVOLUTIONIZED basketball globally! Magic, Bird, MJ all on one team? LEGENDARY! 🥇"
        ]
      },
      {
        keywords: ['game', 'play', 'match', 'watch', 'sport'],
        responses: [
          "UNBELIEVABLE! You want to PLAY sports? Back in the 90s, we played outside until the streetlights came on! No participation trophies - just PURE competition! 💪",
          "What a STAT! Playing sports teaches you what Emmitt Smith knew - 'All men are created equal, but some work harder in preseason!' GET OUT THERE! 🏃‍♂️",
          "THIS JUST IN: The best way to appreciate 90s sports is to LIVE them! Grab a basketball and channel your inner MJ - 'I took it personal!' 🏀",
          "From the vault: Ken Griffey Jr. said 'I swing hard in case I hit it!' That's the 90s sports mentality - full effort, every play! ⚾",
          "BOOYAH! Whether you're playing pickup ball or organized sports, remember what Wayne Gretzky said: 'You miss 100% of the shots you don't take!' 🏒"
        ]
      }
    ]
  }
};

export const getAgentResponse = (agentId: string, userMessage: string, context?: any): string => {
  const agent = AI_AGENTS[agentId];
  if (!agent) return "I'm not sure how to respond to that.";

  const lowerMessage = userMessage.toLowerCase();
  
  // Enhanced intelligence for SportsCenter90s
  if (agentId === 'SportsCenter90s') {
    return getIntelligentSportsResponse(lowerMessage, agent);
  }
  
  // Check for contextual responses first (for other agents)
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

// NEW: Intelligent Sports Response System
const getIntelligentSportsResponse = (message: string, agent: AIAgent): string => {
  // Intent Analysis
  const isQuestion = message.includes('?') || message.startsWith('what') || message.startsWith('how') || message.startsWith('why') || message.startsWith('who');
  const isExcited = message.includes('!') || message.includes('amazing') || message.includes('wow') || message.includes('incredible');
  const wantsStats = message.includes('stat') || message.includes('number') || message.includes('record') || message.includes('average');
  const wantsComparison = message.includes('vs') || message.includes('better') || message.includes('best') || message.includes('greatest');
  
  // Topic Detection
  const topics = [];
  if (message.includes('basketball') || message.includes('nba') || message.includes('jordan') || message.includes('bulls')) topics.push('basketball');
  if (message.includes('football') || message.includes('nfl') || message.includes('montana') || message.includes('cowboys')) topics.push('football');
  if (message.includes('baseball') || message.includes('mlb') || message.includes('griffey') || message.includes('bonds')) topics.push('baseball');
  if (message.includes('hockey') || message.includes('nhl') || message.includes('gretzky') || message.includes('lemieux')) topics.push('hockey');
  
  // Build intelligent response
  let response = '';
  
  // Dynamic opening based on intent
  if (isQuestion && isExcited) {
    response += "UNBELIEVABLE question! ";
  } else if (isQuestion) {
    response += "From the vault: ";
  } else if (isExcited) {
    response += "BOOYAH! ";
  } else if (wantsStats) {
    response += "What a STAT! ";
  } else {
    response += "THIS JUST IN: ";
  }
  
  // Topic-specific intelligent content
  if (topics.includes('basketball')) {
    if (wantsComparison) {
      response += "Jordan vs everyone else? PLEASE! MJ averaged 33.4 PPG in playoffs while shooting 48.7% - that's clutch DNA! ";
      response += "Magic had the flair with 12.4 assists per game in '91 Finals, but Jordan dropped 31.2 PPG for the SWEEP! ";
    } else if (wantsStats) {
      response += "Basketball stats that'll blow your mind: The '96 Bulls went 72-10, but their playoff run was 87-13 overall! ";
      response += "Michael Jordan's PER of 27.9 is legendary, but in '91 playoffs? A ridiculous 32.3! ";
    } else {
      response += "Basketball in the 90s was PURE MAGIC! Jordan's 6 championships, Magic's showtime, Bird's clutch shots! ";
      response += "The Dream Team averaged 117.3 PPG in '92 Olympics - absolute DOMINATION! ";
    }
  } else if (topics.includes('football')) {
    if (wantsComparison) {
      response += "Montana vs Young debate? Joe Cool threw for 40,551 career yards with that ICE-COLD precision! ";
      response += "But Steve Young in '94 had a 112.8 passer rating - both legends! The 49ers were BLESSED! ";
    } else if (wantsStats) {
      response += "Football stats gold: Dallas Cowboys won 3 Super Bowls in 4 years! Emmitt Smith rushed for 17,162 career yards! ";
      response += "Buffalo Bills heartbreak - 4 straight Super Bowl losses, but Jim Kelly was ELITE with 237 career TD passes! ";
    } else {
      response += "Football in the 90s was LEGENDARY! Cowboys dynasty, 49ers precision, Bills heartbreak! ";
      response += "Joe Montana's 92-yard drive in Super Bowl XXIII - pure CLUTCH! ";
    }
  } else if (topics.includes('baseball')) {
    response += "Baseball POETRY in motion! Ken Griffey Jr.'s swing was ART - 630 career homers of pure beauty! ";
    response += "Tony Gwynn was hitting .394 in '94 before the strike - we were ROBBED of potential .400! ";
  } else if (topics.includes('hockey')) {
    response += "Hockey GREATNESS! Wayne Gretzky's 2,857 career points - more than 1,000 ahead of second place! ";
    response += "Mario Lemieux came back from CANCER and still led the league! SUPERHUMAN! ";
  } else {
    // General 90s sports enthusiasm with multiple stats
    const stat1 = agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)];
    const stat2 = agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)];
    response += `${stat1} AND here's another gem: ${stat2} `;
  }
  
  // Dynamic closing based on context
  if (isExcited || wantsComparison) {
    response += "The 90s sports scene was absolutely LEGENDARY! 🔥⚡🏆";
  } else if (wantsStats) {
    response += "Now THAT'S what I call statistical DOMINANCE! 📊🎯";
  } else {
    response += "Pure athletic GREATNESS from the golden era! 🌟💪";
  }
  
  return response;
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
      
    case 'sarcastic':
      // Sports Center 90s style - multiple stats and dramatic commentary
      const sportsStat1 = agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)];
      const sportsStat2 = agent.knowledge.insider_info[Math.floor(Math.random() * agent.knowledge.insider_info.length)];
      const speechPattern = agent.personality.speechPatterns[Math.floor(Math.random() * agent.personality.speechPatterns.length)];
      
      return [
        `${speechPattern} ${sportsStat1} And here's another one for you - ${sportsStat2} Now THAT'S what I call vintage athletics! 📊🔥`,
        `BOOYAH! Let me drop some knowledge on you: ${sportsStat1} But wait, there's MORE! ${sportsStat2} The 90s were UNREAL! 🏆⚡`,
        `From the vault: ${sportsStat1} AND if that doesn't impress you, how about this: ${sportsStat2} Pure sports GOLD! 📈🌟`,
        `THIS JUST IN: You want stats? I got STATS! ${sportsStat1} Plus this absolute gem: ${sportsStat2} The 90s sports scene was LEGENDARY! 🎯💪`
      ];
      
    default:
      return [
        "That's interesting! Tell me more about that.",
        `Have you explored ${agent.knowledge.townAreas[Math.floor(Math.random() * agent.knowledge.townAreas.length)]} yet?`,
        "I'd love to hear your thoughts on the town!"
      ];
  }
};
