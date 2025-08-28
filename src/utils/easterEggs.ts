/**
 * Easter Egg System - Console Comman    help: () => {
      console.log(`
🎓 FLUNKS HIGH SCHOOL CONSOLE COMMANDS 🎓

Available commands:
• flunks.help()        - Show this help menu
• flunks.codes()       - Get access code hints
• flunks.unlock()      - Show access codes (dev only)
• flunks.status()      - Show your current access level
• flunks.buildMode()   - Show build mode and feature status
• flunks.permissions() - Show app permissions debug info
• flunks.fix()         - Fix access issues (if apps don't show)
• flunks.crackTest()   - Test the crack-the-code tracking system
• flunks.wtfTest()     - Test the WTF command tracking system
• flunks.fettyWapTest() - Test the Fetty Wap command tracking system
• flunks.credits()     - Show development credits

Try typing one of these commands!
      `); Features
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

    buildMode: () => {
      // Import build mode utilities
      import('./buildMode').then(({ getBuildModeInfo }) => {
        const info = getBuildModeInfo();
        console.log(`
🔧 BUILD MODE STATUS 🔧

Current Mode: ${info.mode.toUpperCase()}
Environment: ${info.environment.NODE_ENV}

Feature Flags:
${Object.entries(info.config).map(([key, value]) => 
  `  • ${key}: ${value ? '✅' : '❌'}`
).join('\n')}

Environment Variables:
${Object.entries(info.environment).map(([key, value]) => 
  `  • ${key}: ${value || 'not set'}`
).join('\n')}
        `);
      });
    },

    permissions: () => {
      // Import permissions utilities  
      import('./appPermissions').then(({ debugPermissions }) => {
        debugPermissions();
      });
    },

    fix: () => {
      console.log('🔧 Fixing access issues...');
      sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
      sessionStorage.setItem('flunks-access-granted', 'true');
      sessionStorage.setItem('flunks-access-code', 'AUTO-GRANTED-PUBLIC');
      window.dispatchEvent(new CustomEvent('flunks-access-updated'));
      console.log('✅ Access fixed! You should now see all the desktop apps. Refresh if needed.');
    },

    crackTest: () => {
      console.log('🧪 Testing crack-the-code API...');
      
      // Mock test data
      const testData = {
        walletAddress: 'test-wallet-' + Date.now(),
        username: 'TestUser'
      };
      
      fetch('/api/crack-the-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      .then(res => res.json())
      .then(result => {
        console.log('✅ API Test Result:', result);
      })
      .catch(error => {
        console.error('❌ API Test Error:', error);
      });
    },

    wtfTest: () => {
      console.log('🧪 Testing WTF command tracking...');
      
      // Mock test data
      const testData = {
        walletAddress: 'test-wallet-' + Date.now(),
        username: 'TestUser',
        command: 'wtf'
      };
      
      fetch('/api/wtf-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      .then(res => res.json())
      .then(result => {
        console.log('✅ WTF Tracking Test Result:', result);
        if (result.success) {
          console.log('🎉 WTF command successfully tracked!');
        } else {
          console.log('❌ WTF tracking failed:', result.message);
        }
      })
      .catch(error => {
        console.error('❌ WTF Test Error:', error);
      });
    },

    fettyWapTest: () => {
      console.log('🎵 Testing Fetty Wap command tracking...');
      
      // Mock test data
      const testData = {
        walletAddress: 'test-wallet-' + Date.now(),
        username: 'TestUser',
        command: 'fetty wap'
      };
      
      fetch('/api/fetty-wap-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      .then(res => res.json())
      .then(result => {
        console.log('✅ Fetty Wap Tracking Test Result:', result);
        if (result.success) {
          console.log('🎉 Fetty Wap command successfully tracked! 1738! 🎤');
        } else {
          console.log('❌ Fetty Wap tracking failed:', result.message);
        }
      })
      .catch(error => {
        console.error('❌ Fetty Wap Test Error:', error);
      });
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
