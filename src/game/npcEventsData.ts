// src/game/npcEventsData.ts
// Static NPC event data for the Underground and other locations
// These can later be loaded from Supabase for dynamic content

import { NpcEvent } from "./npcEvents";

/**
 * Underground / Four Thieves Bar NPC Events
 * Theme: Gambling den, hustlers, fortune tellers, loan sharks, regulars with tips
 */
export const UNDERGROUND_EVENTS: NpcEvent[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // HUSTLERS & GAMBLERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "underground-three-card-monty",
    npcName: "Slick Eddie",
    npcDescription: "A fast-talking kid with a cardboard box table and three bent playing cards.",
    dialogue: "Hey, hey, hey! Step right up, friend. Find the queen, win double your gum. It's easy money! ...Most of the time.",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 10,
    playerChoices: [
      "Bet 5 gum on the game",
      "Bet 10 gum (double or nothing!)",
      "Watch someone else play first",
      "Walk away"
    ],
    outcomes: {
      "Bet 5 gum on the game": {
        success: "You pick the queen! Eddie looks genuinely surprised. 'Lucky guess...' He hands over 10 gum reluctantly.",
        fail: "You pick a jack. Eddie grins. 'Ohhh so close! The queen was here the whole time.' He pockets your gum.",
        successEffects: [
          { type: "currency", target: "gum", amount: 5 }, // Net gain (bet 5, win 10)
          { type: "reputation", target: "underground", amount: 1 }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -5 }
        ]
      },
      "Bet 10 gum (double or nothing!)": {
        success: "Against all odds, you nail it! Eddie's eye twitches. 'Beginner's luck...' He reluctantly hands over 20 gum.",
        fail: "You were so sure it was the middle card. It wasn't. Eddie is already shuffling for the next sucker.",
        successEffects: [
          { type: "currency", target: "gum", amount: 10 },
          { type: "reputation", target: "underground", amount: 2 },
          { type: "flag", target: "", flagsToSet: ["beat_slick_eddie"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -10 }
        ]
      },
      "Watch someone else play first": {
        success: "You notice Eddie's pinky finger always hovers over the real queen. Useful information...",
        fail: "You watch three people lose. Eddie notices you watching. 'You gonna play or just breathe on me?'",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["knows_eddies_tell"] }
        ],
        failEffects: []
      },
      "Walk away": {
        success: "You find a piece of gum someone dropped near Eddie's table. Score!",
        fail: "Eddie calls after you: 'Chicken! Bawk bawk bawk!' A few people laugh.",
        successEffects: [
          { type: "currency", target: "gum", amount: 1 }
        ],
        failEffects: [
          { type: "reputation", target: "underground", amount: -1 }
        ]
      }
    },
    isRepeatable: true,
    cooldownSeconds: 1800, // 30 minutes
    npcSprite: "slick-eddie"
  },

  {
    id: "underground-dice-guy",
    npcName: "Lucky Lou",
    npcDescription: "A nervous guy with homemade dice that look slightly... off.",
    dialogue: "*rattle rattle* C'mon lucky sevens! Hey, you look like someone with good dice karma. Wanna roll? My dice. My rules. Small house edge.",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 8,
    playerChoices: [
      "Roll the dice (2 gum entry)",
      "Examine the dice first",
      "Offer your own dice",
      "Pass on this one"
    ],
    outcomes: {
      "Roll the dice (2 gum entry)": {
        success: "Natural seven! Lou looks like he might cry. 'H-how?!' He slides you 6 gum with shaking hands.",
        fail: "Snake eyes. Lou visibly relaxes. 'Tough break, friend. The house always wins... eventually.'",
        successEffects: [
          { type: "currency", target: "gum", amount: 4 } // Bet 2, win 6, net 4
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -2 }
        ]
      },
      "Examine the dice first": {
        success: "You notice one die is weighted. Lou sees you notice. 'Okay okay, forget this whole thing.' He slips you 2 gum for your silence.",
        fail: "The dice look totally normal to you. Lou smiles too wide. 'See? Completely legit!'",
        successEffects: [
          { type: "currency", target: "gum", amount: 2 },
          { type: "flag", target: "", flagsToSet: ["caught_lucky_lou"] }
        ],
        failEffects: []
      },
      "Offer your own dice": {
        success: "Lou's face falls. 'I, uh... prefer my own dice actually. You know what, I just remembered I have to be somewhere.'",
        fail: "Lou shrugs. 'Sure, whatever. Same rules though.' You realize you don't actually have any dice.",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["called_lous_bluff"] }
        ],
        failEffects: []
      },
      "Pass on this one": {
        success: "You walk away. Behind you, someone else rolls and loses immediately. Good call.",
        fail: "You walk away. Behind you, someone else rolls a seven and cheers. Could've been you...",
        successEffects: [],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 2400, // 40 minutes
    npcSprite: "lucky-lou"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORTUNE TELLERS & MYSTICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "underground-fortune-teller",
    npcName: "Madame Zelda",
    npcDescription: "An older lady with way too many rings and a crystal ball that's definitely a bowling ball.",
    dialogue: "*dramatic gesture* I see... I see... great fortune OR terrible doom in your future! Cross my palm with gum and I shall reveal which!",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 7,
    playerChoices: [
      "Get your fortune read (3 gum)",
      "Ask about someone specific",
      "Question the crystal ball",
      "Leave the mystic alone"
    ],
    outcomes: {
      "Get your fortune read (3 gum)": {
        success: "Zelda's eyes widen genuinely. 'The spirits say... check behind the jukebox. Something waits there.' A real tip!",
        fail: "'Your aura is... purple! This means... things will happen. To you. In the future.' Wow, groundbreaking.",
        successEffects: [
          { type: "currency", target: "gum", amount: -3 },
          { type: "lore", target: "jukebox_secret", flagsToSet: ["fortune_jukebox_hint"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -3 }
        ]
      },
      "Ask about someone specific": {
        success: "Zelda leans in. 'I know who you mean. They come here on Thursdays. Usually sit in the back booth.' Interesting...",
        fail: "Zelda waves vaguely. 'They are... somewhere. Doing... something. The spirits are unclear.' Thanks for nothing.",
        successEffects: [
          { type: "lore", target: "regular_schedule", flagsToSet: ["knows_thursday_visitor"] }
        ],
        failEffects: []
      },
      "Question the crystal ball": {
        success: "Zelda laughs. 'You caught me, kid. It's a bowling ball. But the readings? Those are real.' She winks mysteriously.",
        fail: "Zelda gasps dramatically. 'You DARE question the ancient orb of seeing?!' Several people turn to stare.",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["bowling_ball_truth"] }
        ],
        failEffects: [
          { type: "reputation", target: "underground", amount: -1 }
        ]
      },
      "Leave the mystic alone": {
        success: "As you walk away, Zelda calls out: 'The winds favor the patient!' You find 2 gum on the ground.",
        fail: "Zelda shouts after you: 'Fine! But don't come crying when the prophecy comes TRUE!' What prophecy?",
        successEffects: [
          { type: "currency", target: "gum", amount: 2 }
        ],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 3600, // 1 hour
    npcSprite: "madame-zelda"
  },

  {
    id: "underground-tarot-kid",
    npcName: "Cornfield Psychic",
    npcDescription: "A mysterious kid reading tarot cards made from old homework pages.",
    dialogue: "The winds of Arcadia whisper a message... but spirits require payment. Gum sustains them between worlds.",
    room: "underground",
    minChapter: 2,
    maxChapter: null,
    weight: 8,
    playerChoices: [
      "Give 3 gum for a reading",
      "Ask what the spirits want",
      "Walk away slowly"
    ],
    outcomes: {
      "Give 3 gum for a reading": {
        success: "The kid draws a card with 'ROOM 7' scribbled on it. 'The spirits say this number is... significant.' A real clue!",
        fail: "You get a useless prophecy: 'Beware vending machines that hum at night.' Spooky, but unhelpful.",
        successEffects: [
          { type: "currency", target: "gum", amount: -3 },
          { type: "lore", target: "room7_clue", flagsToSet: ["has_room7_hint"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -3 }
        ]
      },
      "Ask what the spirits want": {
        success: "The psychic gives you a gum wrapper map with cryptic markings. 'They left this for someone. Maybe you.'",
        fail: "They stare at you unblinking for an uncomfortable amount of time until you leave.",
        successEffects: [
          { type: "item", target: "gum_wrapper_map", amount: 1 }
        ],
        failEffects: []
      },
      "Walk away slowly": {
        success: "You find 1 gum on the floor. The kid whispers: 'The spirits provide.'",
        fail: "You trip over a mop bucket. No damage, just embarrassment. The kid doesn't even look up.",
        successEffects: [
          { type: "currency", target: "gum", amount: 1 }
        ],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 3600,
    npcSprite: "cornfield-psychic"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAN SHARKS & DEALERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "underground-loan-shark",
    npcName: "Big Vinnie",
    npcDescription: "A surprisingly small guy named Big Vinnie who runs the gum lending operation.",
    dialogue: "Running low on gum, friend? I can front you some. Interest is only 20%. Per hour. Simple terms, yeah?",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 6,
    playerChoices: [
      "Borrow 10 gum",
      "Borrow 25 gum (high risk!)",
      "Ask who else owes him",
      "Politely decline"
    ],
    outcomes: {
      "Borrow 10 gum": {
        success: "Vinnie counts out the gum. 'You got one hour. Don't make me come find you.' He seems... reasonable?",
        fail: "Vinnie squints. 'Actually, you look like a flight risk. Come back when you've got collateral.' Rejected!",
        successEffects: [
          { type: "currency", target: "gum", amount: 10 },
          { type: "flag", target: "", flagsToSet: ["owes_vinnie_10"] }
        ],
        failEffects: []
      },
      "Borrow 25 gum (high risk!)": {
        success: "Vinnie's eyebrows raise. 'Bold. I respect bold.' He hands over the gum. 'Don't disappoint me.'",
        fail: "'Twenty-five? To YOU?' Vinnie laughs. 'I like you kid, but I'm not stupid. Start smaller.'",
        successEffects: [
          { type: "currency", target: "gum", amount: 25 },
          { type: "flag", target: "", flagsToSet: ["owes_vinnie_25"] }
        ],
        failEffects: []
      },
      "Ask who else owes him": {
        success: "Vinnie grins. 'Information ain't free, but... I like your style.' He drops a name you recognize.",
        fail: "'That's confidential, friend. But if you hear anyone's got gum trouble, you send 'em my way.'",
        successEffects: [
          { type: "lore", target: "debtor_info", flagsToSet: ["knows_vinnies_debtors"] }
        ],
        failEffects: []
      },
      "Politely decline": {
        success: "Vinnie nods respectfully. 'Smart. Most folks here ain't smart.' He tosses you a piece of gum. 'Stay lucky.'",
        fail: "Vinnie shrugs. 'Suit yourself. But when you're down to your last piece, remember Big Vinnie's always here.'",
        successEffects: [
          { type: "currency", target: "gum", amount: 1 }
        ],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 7200, // 2 hours
    npcSprite: "big-vinnie"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REGULARS & TIPSTERS  
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "underground-old-regular",
    npcName: "Dusty Pete",
    npcDescription: "An old-timer who claims he's been coming here 'since before the bar had walls.'",
    dialogue: "*sips something from a paper bag* You're new here. I can tell. Got that 'still has hope' look in your eyes.",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 9,
    playerChoices: [
      "Buy him a soda (2 gum)",
      "Ask for gambling tips",
      "Ask about the bar's history",
      "Just nod and walk away"
    ],
    outcomes: {
      "Buy him a soda (2 gum)": {
        success: "Pete's eyes light up. 'A kind soul! Here's a tip: the slot machine on the left pays out more after 9pm. Don't tell nobody I told ya.'",
        fail: "Pete takes the soda. 'Thanks kid.' He stares into the distance. That's... that's the whole interaction.",
        successEffects: [
          { type: "currency", target: "gum", amount: -2 },
          { type: "lore", target: "slot_timing", flagsToSet: ["knows_slot_timing"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -2 }
        ]
      },
      "Ask for gambling tips": {
        success: "'Never bet on a sure thing - they're never sure. And never play cards with anyone named after a city.' Wise words.",
        fail: "'Tip? Here's a tip: don't gamble.' He gestures at himself. 'Look where it got me.'",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["petes_gambling_wisdom"] }
        ],
        failEffects: []
      },
      "Ask about the bar's history": {
        success: "Pete lowers his voice. 'This place used to be a speakeasy. There's still a hidden room... somewhere.' He won't say more.",
        fail: "'History? It's a bar. People drink. They gamble. They leave poorer. Same as always.'",
        successEffects: [
          { type: "lore", target: "speakeasy_hint", flagsToSet: ["knows_speakeasy_history"] }
        ],
        failEffects: []
      },
      "Just nod and walk away": {
        success: "Pete mutters something that sounds like a blessing. You feel slightly luckier.",
        fail: "Pete doesn't seem to notice you left. He's arguing with someone who isn't there.",
        successEffects: [
          { type: "stat", target: "luck", amount: 1 }
        ],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 5400, // 90 minutes
    npcSprite: "dusty-pete"
  },

  {
    id: "underground-nervous-newcomer",
    npcName: "Twitchy Mike",
    npcDescription: "A guy who keeps looking over his shoulder like someone's after him.",
    dialogue: "*whispers* Hey. HEY. You didn't see me here, okay? I was never here. But while I'm not here... wanna buy some info?",
    room: "underground",
    minChapter: 3,
    maxChapter: null,
    weight: 5,
    playerChoices: [
      "Pay 5 gum for info",
      "Ask what he's running from",
      "Pretend you didn't see him",
      "Threaten to tell someone"
    ],
    outcomes: {
      "Pay 5 gum for info": {
        success: "Mike presses a crumpled note into your hand. 'Locker 7-7. Arcade. Don't say where you got this.' He vanishes into the crowd.",
        fail: "Mike takes your gum and starts to talk... then freezes. 'They're here. THEY'RE HERE.' He bolts. Great.",
        successEffects: [
          { type: "currency", target: "gum", amount: -5 },
          { type: "lore", target: "arcade_locker", flagsToSet: ["has_locker_code"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -5 }
        ]
      },
      "Ask what he's running from": {
        success: "'Let's just say I saw something I shouldn't have. At the motel. Room with the green door.' His eyes dart around.",
        fail: "'None of your business! Why are you asking so many questions? Are you one of THEM?!' He backs away.",
        successEffects: [
          { type: "lore", target: "motel_secret", flagsToSet: ["green_door_hint"] }
        ],
        failEffects: [
          { type: "reputation", target: "underground", amount: -1 }
        ]
      },
      "Pretend you didn't see him": {
        success: "Mike nods gratefully. He slips you 3 gum. 'You're good people. If you need something, I owe you.' A future favor!",
        fail: "You turn away. Mike has already disappeared. Was he ever really there?",
        successEffects: [
          { type: "currency", target: "gum", amount: 3 },
          { type: "flag", target: "", flagsToSet: ["mike_owes_favor"] }
        ],
        failEffects: []
      },
      "Threaten to tell someone": {
        success: "'NO! Okay okay, here, take this, just keep quiet!' Mike shoves 10 gum at you and runs.",
        fail: "Mike's fear turns to anger. 'You'll regret this.' He disappears. You've made an enemy.",
        successEffects: [
          { type: "currency", target: "gum", amount: 10 }
        ],
        failEffects: [
          { type: "flag", target: "", flagsToSet: ["mike_is_enemy"] },
          { type: "reputation", target: "underground", amount: -3 }
        ]
      }
    },
    isRepeatable: false, // Story event, one-time only
    cooldownSeconds: null,
    npcSprite: "twitchy-mike"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTERTAINMENT & DISTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "underground-jukebox-guy",
    npcName: "DJ Scratch",
    npcDescription: "A kid who guards the jukebox like it's his kingdom.",
    dialogue: "This jukebox is MINE. You want a song? Gonna cost ya. But pick the right track and good things happen...",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 7,
    playerChoices: [
      "Pay 2 gum for a song",
      "Request 'The Secret Track'",
      "Challenge him for jukebox control",
      "Leave the jukebox alone"
    ],
    outcomes: {
      "Pay 2 gum for a song": {
        success: "A banger starts playing. The whole bar vibes. DJ Scratch nods approvingly. 'You got taste, friend.'",
        fail: "The song you picked is... weird. People give you looks. DJ Scratch sighs. 'Amateurs.'",
        successEffects: [
          { type: "currency", target: "gum", amount: -2 },
          { type: "reputation", target: "underground", amount: 1 }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -2 }
        ]
      },
      "Request 'The Secret Track'": {
        success: "Scratch's eyes widen. 'You know about THAT?' The jukebox plays a strange melody. Something clicks behind it...",
        fail: "'The what now? There's no secret track.' Scratch looks at you like you're crazy. Maybe you are.",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["activated_secret_track"] },
          { type: "lore", target: "jukebox_mechanism", flagsToSet: ["jukebox_unlocked"] }
        ],
        failEffects: []
      },
      "Challenge him for jukebox control": {
        success: "You beat Scratch in a music trivia battle! He steps aside, impressed. 'It's yours... for now.'",
        fail: "Scratch demolishes you with obscure 80s B-sides. 'Come back when you've studied, rookie.'",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["jukebox_master"] },
          { type: "reputation", target: "underground", amount: 3 }
        ],
        failEffects: [
          { type: "reputation", target: "underground", amount: -1 }
        ]
      },
      "Leave the jukebox alone": {
        success: "Scratch respects your non-interference. He tips his hat. 'Smart. Most people aren't.'",
        fail: "You walk away. The current song is terrible. Everyone suffers.",
        successEffects: [],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 2700, // 45 minutes
    requiredFlags: [], 
    npcSprite: "dj-scratch"
  },

  {
    id: "underground-arm-wrestler",
    npcName: "Crusher Cathy",
    npcDescription: "A surprisingly strong person sitting at a table with a 'BEAT ME, WIN BIG' sign.",
    dialogue: "*cracks knuckles* Think you're tough? Put your gum where your arm is. Beat me, you get triple. Lose... I keep it.",
    room: "underground",
    minChapter: null,
    maxChapter: null,
    weight: 6,
    playerChoices: [
      "Challenge! (5 gum bet)",
      "Go for the big pot (15 gum)",
      "Offer to be her promoter",
      "Wisely back away"
    ],
    outcomes: {
      "Challenge! (5 gum bet)": {
        success: "Against all odds, your grip holds! Cathy's arm wavers... and SLAMS down! You WIN! '...Not bad, kid.'",
        fail: "Your arm hits the table so fast you think time skipped. Cathy doesn't even look strained.",
        successEffects: [
          { type: "currency", target: "gum", amount: 10 }, // Bet 5, win 15, net 10
          { type: "flag", target: "", flagsToSet: ["beat_crusher_cathy"] }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -5 }
        ]
      },
      "Go for the big pot (15 gum)": {
        success: "Cathy starts sweating. YOU'RE WINNING. The crowd goes WILD as her arm goes DOWN! 'IMPOSSIBLE!'",
        fail: "Cathy laughs as she pins you in 0.3 seconds. 'Thanks for the donation, champ.' Ouch.",
        successEffects: [
          { type: "currency", target: "gum", amount: 30 },
          { type: "flag", target: "", flagsToSet: ["arm_wrestling_legend"] },
          { type: "reputation", target: "underground", amount: 5 }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -15 }
        ]
      },
      "Offer to be her promoter": {
        success: "Cathy grins. 'I like your hustle. Bring me challengers, you get 10% of my winnings.' DEAL!",
        fail: "'I don't need a promoter, I need OPPONENTS.' She flexes. You feel inadequate.",
        successEffects: [
          { type: "flag", target: "", flagsToSet: ["cathy_business_partner"] }
        ],
        failEffects: []
      },
      "Wisely back away": {
        success: "Cathy nods. 'Knowing when not to fight is also strength.' Respect earned without pain.",
        fail: "'CHICKEN!' someone in the crowd yells. Cathy shrugs. 'Smart chicken, at least.'",
        successEffects: [],
        failEffects: [
          { type: "reputation", target: "underground", amount: -1 }
        ]
      }
    },
    isRepeatable: true,
    cooldownSeconds: 3600,
    npcSprite: "crusher-cathy"
  }
];

/**
 * Arcade NPC Events (bonus, for when arcade is wired up)
 */
export const ARCADE_EVENTS: NpcEvent[] = [
  {
    id: "arcade-token-trader",
    npcName: "Token Tony",
    npcDescription: "A kid with pockets full of arcade tokens who always wants to trade.",
    dialogue: "Psst! Official tokens are 1 gum each at the counter. But I got 'em for cheaper. Fell off a truck. Don't ask which truck.",
    room: "arcade",
    minChapter: null,
    maxChapter: null,
    weight: 8,
    playerChoices: [
      "Buy 5 tokens (3 gum)",
      "Buy 10 tokens (5 gum)",
      "Report him to management",
      "No thanks"
    ],
    outcomes: {
      "Buy 5 tokens (3 gum)": {
        success: "Tony slips you 5 legit tokens. 'Pleasure doing business. Come back anytime.'",
        fail: "The tokens Tony gives you are... spray-painted bottle caps. 'No refunds!' He's already gone.",
        successEffects: [
          { type: "currency", target: "gum", amount: -3 },
          { type: "item", target: "arcade_tokens", amount: 5 }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -3 }
        ]
      },
      "Buy 10 tokens (5 gum)": {
        success: "Tony checks if anyone's watching, then hands you a small pouch. '10 tokens, as promised. You never saw me.'",
        fail: "Tony starts counting out tokens... then spots someone. 'ABORT!' He vanishes. Your gum is gone.",
        successEffects: [
          { type: "currency", target: "gum", amount: -5 },
          { type: "item", target: "arcade_tokens", amount: 10 }
        ],
        failEffects: [
          { type: "currency", target: "gum", amount: -5 }
        ]
      },
      "Report him to management": {
        success: "The arcade manager thanks you with 3 free tokens. 'We've been trying to catch him for weeks!'",
        fail: "The manager shrugs. 'We know about Tony. He's the owner's nephew. Can't do anything.'",
        successEffects: [
          { type: "item", target: "arcade_tokens", amount: 3 },
          { type: "flag", target: "", flagsToSet: ["reported_token_tony"] }
        ],
        failEffects: []
      },
      "No thanks": {
        success: "Tony respects your decision. 'A careful customer. I like that. Offer stands if you change your mind.'",
        fail: "Tony looks offended. 'Fine! Pay full price like a CHUMP!' He storms off.",
        successEffects: [],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 1800,
    npcSprite: "token-tony"
  }
];

/**
 * Paradise Motel NPC Events
 */
export const PARADISE_MOTEL_EVENTS: NpcEvent[] = [
  {
    id: "motel-night-clerk",
    npcName: "Chester",
    npcDescription: "The night clerk who's seen everything and says nothing... usually.",
    dialogue: "*barely looks up from magazine* Room? No room. We're full. Have been for years. Unless you got... information to trade.",
    room: "paradise_motel",
    minChapter: 2,
    maxChapter: null,
    weight: 9,
    playerChoices: [
      "Ask about Room 7",
      "Offer 10 gum for information",
      "Ask about strange guests",
      "Just passing through"
    ],
    outcomes: {
      "Ask about Room 7": {
        success: "Chester's eye twitches. 'Room 7 doesn't exist. Never did. Stop asking.' He slides you a key anyway.",
        fail: "'Room 7?' Chester laughs. 'You kids and your ghost stories. There's no Room 7.'",
        successEffects: [
          { type: "item", target: "mysterious_key", amount: 1 },
          { type: "flag", target: "", flagsToSet: ["has_room7_key"] }
        ],
        failEffects: []
      },
      "Offer 10 gum for information": {
        success: "Chester pockets the gum. 'Guest in Room 4 leaves at 3am every night. Comes back at dawn. Smells like soil.'",
        fail: "'Ten gum? For prime intel?' Chester scoffs. 'Come back when you're serious.'",
        successEffects: [
          { type: "currency", target: "gum", amount: -10 },
          { type: "lore", target: "room4_guest", flagsToSet: ["knows_room4_schedule"] }
        ],
        failEffects: []
      },
      "Ask about strange guests": {
        success: "'ALL our guests are strange. But the one in Room 9... she's been here since 1987. Never leaves.' He shudders.",
        fail: "'Strange? Here?' Chester gestures at the flickering lobby. 'What could possibly be strange about this place?'",
        successEffects: [
          { type: "lore", target: "room9_guest", flagsToSet: ["knows_room9_secret"] }
        ],
        failEffects: []
      },
      "Just passing through": {
        success: "Chester nods. 'Smart. Don't linger here after dark.' He goes back to his magazine.",
        fail: "'Passing through WHERE exactly? There's nowhere TO go.' He has a point.",
        successEffects: [],
        failEffects: []
      }
    },
    isRepeatable: true,
    cooldownSeconds: 4500, // 75 minutes
    npcSprite: "chester"
  }
];

/**
 * All NPC events combined
 */
export const ALL_NPC_EVENTS: NpcEvent[] = [
  ...UNDERGROUND_EVENTS,
  ...ARCADE_EVENTS,
  ...PARADISE_MOTEL_EVENTS,
];

/**
 * Get events for a specific room
 */
export function getEventsForRoom(room: string): NpcEvent[] {
  return ALL_NPC_EVENTS.filter(e => e.room === room);
}

/**
 * Get an event by ID
 */
export function getEventById(id: string): NpcEvent | undefined {
  return ALL_NPC_EVENTS.find(e => e.id === id);
}
