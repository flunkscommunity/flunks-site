import { useEffect, useRef, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../contexts/UserProfileContext';
import { trackTerminalActivity, generateSessionId, COMMAND_TYPES } from 'utils/activityTracking';

const errorSound = typeof Audio !== "undefined" ? new Audio('/sounds/incorrect.mp3') : null;
const successSound = typeof Audio !== "undefined" ? new Audio('/sounds/correct.mp3') : null;
const paradiseMotelSound = typeof Audio !== "undefined" ? new Audio('/sounds/paradise-motel.mp3') : null;

// Client-side command fallback for mobile/static builds where API routes don't work
const CLIENT_TERMINAL_COMMANDS: Record<string, { response: string; type: string }> = {
  'help': {
    response: `📟 FLUNKS TERMINAL COMMANDS 📟

Available commands:
• help      - Show this help message
• whoami    - Display your identity
• flunks    - Learn about Flunks High
• clear     - Clear the terminal screen
• wtf       - What's this feature?
• flow      - Tap into the Flow blockchain
• yourmom   - Classic jokes never die
• fetty wap - 1738! 🎤
• magic carpet - Take flight! 🧞‍♂️

Type any command and press Enter to execute.`,
    type: 'SYSTEM'
  },
  'whoami': {
    response: 'You are a misfit of Flunks High. 🎓 A digital rebel navigating the halls of this chaotic high school simulation.',
    type: 'SYSTEM'
  },
  'flunks': {
    response: '🏫 Flunks is a 90s-inspired digital universe full of secrets, Easter eggs, and nostalgic vibes. Welcome to the chaos!',
    type: 'SYSTEM'
  },
  'wtf': {
    response: "🎰 surprise, we just stole all your NFT's! jk, you're entered into a drawing for FLOW. 💎",
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
    response: '__CLEAR__',
    type: 'SYSTEM'
  },
  'paradise motel': {
    response: "🏨 Paradise Motel... Yes, that's where our search begins! The neon sign flickers in the digital night, casting pink and blue shadows. This is indeed the first place we'll look for Flunko. You've unlocked a clue! 🔍✨",
    type: 'CODE'
  }
};

// Process command locally (fallback for mobile builds)
const processCommandLocally = (command: string): { response: string; type: string; validCommand: boolean } => {
  const lowerCommand = command.toLowerCase().trim();
  const commandData = CLIENT_TERMINAL_COMMANDS[lowerCommand];
  
  if (commandData) {
    return {
      response: commandData.response,
      type: commandData.type,
      validCommand: true
    };
  }
  
  return {
    response: 'Command not recognized. Type "help" to see available commands.',
    type: 'UNKNOWN',
    validCommand: false
  };
};

const FlunksTerminal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useDynamicContext();
  const { profile } = useUserProfile();
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => generateSessionId());

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async () => {
    const newHistory = [...history, `> ${input}`];
    let response = '';
    let validCommand = true;
    let commandType = 'unknown';

    try {
      // Try API first (works on web, not on mobile static builds)
      const apiResponse = await fetch('/api/terminal-commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: input.toLowerCase() }),
      });

      // Check if response is valid JSON (API routes don't exist in static builds)
      const contentType = apiResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API not available - using local fallback');
      }

      const result = await apiResponse.json();

      if (result.success) {
        response = result.response;
        commandType = result.type;
        validCommand = result.validCommand;

        // Special handling for clear command
        if (result.response === '__CLEAR__') {
          setHistory([]);
          setInput('');
          // Track clear command (non-blocking)
          trackTerminalActivity(
            user?.verifiedCredentials?.[0]?.address || null,
            input,
            commandType,
            'Terminal cleared',
            true,
            sessionId
          ).catch(() => {});
          return;
        }
      } else {
        response = 'Command not recognized. Type "help" to see available commands.';
        validCommand = false;
        commandType = 'UNKNOWN';
      }
    } catch (error) {
      // API failed - use local command processing (mobile/static builds)
      console.log('Using local terminal commands (API unavailable)');
      const localResult = processCommandLocally(input);
      response = localResult.response;
      commandType = localResult.type;
      validCommand = localResult.validCommand;

      // Special handling for clear command (local)
      if (response === '__CLEAR__') {
        setHistory([]);
        setInput('');
        return;
      }
    }

    // Play error sound for invalid commands
    if (!validCommand && errorSound) {
      errorSound.currentTime = 0;
      errorSound.play();
    }

    // Track terminal activity (non-blocking for better UX)
    trackTerminalActivity(
      user?.verifiedCredentials?.[0]?.address || null,
      input,
      commandType,
      response,
      validCommand,
      sessionId
    ).catch(error => {
      console.error('Failed to track terminal activity:', error);
    });

    // Special logging for WTF command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'wtf' && validCommand) {
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/wtf-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null,
          command: input.trim()
        })
      }).catch(error => {
        console.error('Failed to track WTF command:', error);
        // Don't show error to user, just log it
      });
    }

    // Special logging for Fetty Wap command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'fetty wap' && validCommand) {
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/fetty-wap-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null,
          command: input.trim()
        })
      }).catch(error => {
        console.error('Failed to track Fetty Wap command:', error);
        // Don't show error to user, just log it
      });
    }

    // Special logging for Magic Carpet command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'magic carpet' && validCommand) {
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/log-magic-carpet-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null,
          accessLevel: 'BETA', // Users with terminal access have BETA level
          sessionId: sessionId,
          command: input
        })
      }).catch(error => {
        console.error('Failed to log Magic Carpet command:', error);
        // Don't show error to user, just log it
      });
    }

    // Special logging for Flow command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'flow' && validCommand) {
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/log-flow-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null,
          accessLevel: 'BETA', // Users with terminal access have BETA level
          sessionId: sessionId,
          command: input
        })
      }).catch(error => {
        console.error('Failed to log Flow command:', error);
        // Don't show error to user, just log it
      });
    }

    // Special logging for YourmMom command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'yourmom' && validCommand) {
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/yourmom-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null
        })
      }).catch(error => {
        console.error('Failed to track YourMom command:', error);
        // Don't show error to user, just log it
      });
    }

    // Special logging for Paradise Motel command (non-blocking for better UX)
    if (input.toLowerCase().trim() === 'paradise motel' && validCommand) {
      // Play special Paradise Motel sound
      if (paradiseMotelSound) {
        paradiseMotelSound.currentTime = 0;
        paradiseMotelSound.play().catch(e => console.log('Could not play paradise motel sound:', e));
      }
      
      // Fire and forget - don't await this to avoid UI delay
      fetch('/api/paradise-motel-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user?.verifiedCredentials?.[0]?.address || null,
          username: profile?.username || null
        })
      }).catch(error => {
        console.error('Failed to track Paradise Motel command:', error);
        // Don't show error to user, just log it
      });
    }

    // Play regular success sound for other valid commands (but not paradise motel)
    if (validCommand && successSound && input.toLowerCase().trim() !== 'paradise motel') {
      successSound.currentTime = 0;
      successSound.play();
    }

    setHistory([...newHistory, response]);
    setInput('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: 0,
        height: '100%',
        minHeight: 0,
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CRT Screen Effect Container */}
      <div
        style={{
          position: 'relative',
          flexGrow: 1,
          margin: '12px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: `
            inset 0 0 60px rgba(0, 255, 0, 0.1),
            inset 0 0 100px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(0, 255, 0, 0.15),
            0 0 40px rgba(0, 0, 0, 0.5)
          `,
          border: '4px solid #333',
          background: '#000',
        }}
      >
        {/* Scanlines Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* CRT Flicker Effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 255, 0, 0.03)',
            pointerEvents: 'none',
            zIndex: 9,
            animation: 'crtFlicker 0.15s infinite',
          }}
        />

        {/* Screen Curve Effect (corners) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(
              ellipse at center,
              transparent 0%,
              transparent 70%,
              rgba(0, 0, 0, 0.4) 100%
            )`,
            pointerEvents: 'none',
            zIndex: 8,
          }}
        />

        {/* Terminal Header */}
        <div
          style={{
            background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)',
            borderBottom: '2px solid #00ff00',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              color: '#00ff00', 
              fontSize: '12px',
              fontFamily: 'monospace',
              textShadow: '0 0 10px #00ff00',
            }}>
              ▶ FLUNKS OS v1.0.7
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', boxShadow: '0 0 5px #ff5f56' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 5px #ffbd2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27ca40', boxShadow: '0 0 5px #27ca40' }} />
          </div>
        </div>

        {/* Terminal Output */}
        <div
          style={{
            color: '#00ff00',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '14px',
            lineHeight: '1.6',
            flexGrow: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 100px)',
            textShadow: '0 0 5px #00ff00, 0 0 10px rgba(0, 255, 0, 0.5)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Welcome Message */}
          {history.length === 0 && (
            <div style={{ marginBottom: '16px', opacity: 0.8 }}>
              <div style={{ color: '#00ffff', marginBottom: '8px' }}>
                ╔══════════════════════════════════════════╗
              </div>
              <div style={{ color: '#00ffff' }}>
                ║  Welcome to FLUNKS TERMINAL              ║
              </div>
              <div style={{ color: '#00ffff' }}>
                ║  Type "help" for available commands      ║
              </div>
              <div style={{ color: '#00ffff' }}>
                ╚══════════════════════════════════════════╝
              </div>
            </div>
          )}
          
          {history.map((line, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: '4px',
                color: line.startsWith('>') ? '#00ffff' : '#00ff00',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {line}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0d1f0d 0%, #0a150a 100%)',
            borderTop: '2px solid #00ff00',
            padding: '12px',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCommand();
            }}
            style={{ 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ 
              color: '#00ff00', 
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: '0 0 5px #00ff00',
            }}>
              {'>'}
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#00ff00',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '14px',
                textShadow: '0 0 5px #00ff00',
                caretColor: '#00ff00',
              }}
              placeholder="Enter command..."
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(180deg, #00aa00 0%, #006600 100%)',
                border: '2px solid #00ff00',
                borderRadius: '4px',
                padding: '6px 16px',
                color: '#fff',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                textShadow: '0 0 5px #00ff00',
                boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              EXEC
            </button>
          </form>
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a15 100%)',
          borderTop: '1px solid #333',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#00ff00',
          textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
        }}
      >
        <span>◉ CONNECTED</span>
        <span>SESSION: {sessionId.slice(0, 8)}</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes crtFlicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        input::placeholder {
          color: rgba(0, 255, 0, 0.3);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #00aa00;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00ff00;
        }
      `}</style>
    </div>
  );
  };

  export default FlunksTerminal;
