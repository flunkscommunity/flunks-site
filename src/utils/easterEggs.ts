/**
 * Easter Egg System - Console Commands and Hidden Features
 * Users can discover access codes through various means
 */

export interface AccessCodeInfo {
  code: string;
  level: string;
  description: string;
  hint: string;
}

export const ACCESS_CODES: AccessCodeInfo[] = [
  {
    code: 'FLUNKS2025',
    level: 'ADMIN',
    description: 'Full administrator access - all features unlocked',
    hint: 'The year everything changed... 🎓'
  },
  {
    code: 'SEMESTER0',
    level: 'BETA',
    description: 'Beta tester access - core features and testing tools',
    hint: 'Before the first semester began... 📚'
  },
  {
    code: 'HIGHSCHOOL95',
    level: 'COMMUNITY',
    description: 'Community member access - essential features',
    hint: 'When high school went digital... 💻'
  }
];

/**
 * Console commands that users can type in dev tools
 */
export const initializeEasterEggs = () => {
  if (typeof window === 'undefined') return;

  // Make access codes discoverable through console commands
  (window as any).flunks = {
    help: () => {
      console.log(`
🏫 FLUNKS HIGH SCHOOL - CONSOLE COMMANDS 🏫

Available commands:
• flunks.help()        - Show this help
• flunks.codes()       - Show access code hints
• flunks.unlock()      - Show all access codes (dev only)
• flunks.status()      - Show your current access level
• flunks.credits()     - Show development credits

Try typing one of these commands!
      `);
    },

    codes: () => {
      console.log(`
🔑 ACCESS CODE HINTS 🔑

Need an access code? Look for these clues:
      `);
      ACCESS_CODES.forEach(info => {
        console.log(`💡 ${info.level}: ${info.hint}`);
      });
      console.log(`
💭 Still stuck? Check the GitHub repo README or ask in Discord!
      `);
    },

    unlock: () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isLocalhost || isDev) {
        console.log(`
🚀 DEVELOPER ACCESS CODES 🚀

${ACCESS_CODES.map(info => `
${info.level}: ${info.code}
${info.description}
`).join('')}

🔥 Use these codes in the access gate to unlock features!
        `);
      } else {
        console.log(`
🕵️ Nice try! Access codes must be earned...
Try flunks.codes() for hints instead!
        `);
      }
    },

    status: () => {
      const accessLevel = sessionStorage.getItem('flunks-access-level');
      const accessCode = sessionStorage.getItem('flunks-access-code');
      
      if (accessLevel) {
        console.log(`
👤 YOUR ACCESS STATUS 👤

Level: ${accessLevel}
Code Used: ${accessCode}
Access Granted: ✅

${ACCESS_CODES.find(c => c.code === accessCode)?.description || 'Unknown access level'}
        `);
      } else {
        console.log(`
🚫 NO ACCESS DETECTED 🚫

You haven't entered an access code yet.
Type flunks.codes() for hints on how to get one!
        `);
      }
    },

    credits: () => {
      console.log(`
🎮 FLUNKS HIGH SCHOOL 🎮

A nostalgic Web3 social platform
Built with React, Next.js, and love

Find us:
• GitHub: flunkscommunity
• Discord: Join our community
• Twitter: @flunkshighschool

Made with 💚 by the Flunks team
      `);
    }
  };

  // Auto-run help on first console interaction
  console.log(`
🎓 Welcome to Flunks High School! 🎓

Type 'flunks.help()' in the console for available commands!
Looking for access codes? Try 'flunks.codes()' for hints...
  `);
};

/**
 * Add hints to the page source
 */
export const addSourceCodeHints = () => {
  if (typeof window === 'undefined') return;

  // Add HTML comments with hints
  const hints = [
    '🔍 DEVELOPERS: Looking for access codes?',
    '💡 Try typing "flunks.help()" in the console!',
    '🎯 Or check the GitHub repo README for more info',
    '🏫 Access levels: ADMIN > BETA > COMMUNITY',
    '📚 Each level unlocks different features'
  ];

  hints.forEach(hint => {
    document.head.appendChild(document.createComment(` ${hint} `));
  });
};
