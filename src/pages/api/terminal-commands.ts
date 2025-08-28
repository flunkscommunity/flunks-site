import { NextApiRequest, NextApiResponse } from 'next';

// PRIVATE: Terminal commands stored only on backend
const TERMINAL_COMMANDS = {
  'help': {
    response: 'Available commands: whoami, flunks',
    type: 'SYSTEM'
  },
  'whoami': {
    response: 'You are a misfit of Flunks High.',
    type: 'SYSTEM'
  },
  'flunks': {
    response: 'Flunks is a 90s-inspired digital universe full of secrets.',
    type: 'SYSTEM'
  },
  'wtf': {
    response: "surprise, we just stole all your NFT's! jk, you're entered into a drawing for FLOW.",
    type: 'CODE'
  },
  'fetty wap': {
    response: "🎵 Yeah baby! 1738! You just unlocked the Fetty Wap easter egg! 🎤 The trap music echoes through the digital halls of Flunks High... Remy Boyz unite! 💎",
    type: 'CODE'
  },
  'magic carpet': {
    response: "🧞‍♂️ Whoosh! You've summoned the magic carpet! ✨ You're now floating above Flunks High School, getting a bird's eye view of all the chaos below. The carpet whispers ancient secrets of the digital realm... 🪐",
    type: 'CODE'
  },
  'flow': {
    response: "🌊 The Flow blockchain awakens! ⚡ Digital currents surge through the network, and your wallet resonates with the power of decentralized possibilities. You've tapped into the flow state... 💫",
    type: 'CODE'
  },
  'yourmom': {
    response: "🤣 Oh snap! You went there! 💀 Your mom jokes are eternal - they transcend time, space, and blockchain networks. Even in the metaverse, your mom's cooking is still better than the cafeteria! 👩‍🍳✨",
    type: 'CODE'
  },
  'clear': {
    response: '__CLEAR__', // Special response to indicate clear action
    type: 'SYSTEM'
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { command } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Command required' 
    });
  }

  const lowerCommand = command.toLowerCase().trim();
  const commandData = TERMINAL_COMMANDS[lowerCommand as keyof typeof TERMINAL_COMMANDS];

  if (commandData) {
    return res.status(200).json({
      success: true,
      response: commandData.response,
      type: commandData.type,
      validCommand: true
    });
  } else {
    return res.status(200).json({
      success: true,
      response: 'Command not recognized. Type "help" to see available commands.',
      type: 'UNKNOWN',
      validCommand: false
    });
  }
}
