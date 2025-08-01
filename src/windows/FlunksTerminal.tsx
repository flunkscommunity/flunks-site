import { useEffect, useRef, useState } from 'react';
import {
  TextField
} from 'react95';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { trackTerminalActivity, generateSessionId, COMMAND_TYPES } from 'utils/activityTracking';

const errorSound = typeof Audio !== "undefined" ? new Audio('/sounds/incorrect.mp3') : null;
const successSound = typeof Audio !== "undefined" ? new Audio('/sounds/correct.mp3') : null;

const FlunksTerminal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useDynamicContext();
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

    const command = input.toLowerCase();

    switch (command) {
      case 'help':
        response = 'Available commands: help, whoami, flunks, clear';
        commandType = COMMAND_TYPES.SYSTEM;
        break;
      case 'whoami':
        response = 'You are a misfit of Flunks High.';
        commandType = COMMAND_TYPES.SYSTEM;
        break;
      case 'flunks':
        response = 'Flunks is a 90s-inspired digital universe full of secrets.';
        commandType = COMMAND_TYPES.SYSTEM;
        break;
      case 'wtf':
        response = "surprise, we just stole all your NFT's! jk, you're entered into a drawing for FLOW.";
        commandType = COMMAND_TYPES.CODE;
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        commandType = COMMAND_TYPES.SYSTEM;
        // Track clear command
        await trackTerminalActivity(
          user?.verifiedCredentials?.[0]?.address || null,
          input,
          commandType,
          'Terminal cleared',
          true,
          sessionId
        );
        return;
      default:
        response = 'Command not recognized. Type "help" to see available commands.';
        validCommand = false;
        commandType = COMMAND_TYPES.UNKNOWN;
        if (errorSound) {
          errorSound.currentTime = 0;
          errorSound.play();
        }
        break;
    }

    // Track terminal activity
    await trackTerminalActivity(
      user?.verifiedCredentials?.[0]?.address || null,
      input,
      commandType,
      response,
      validCommand,
      sessionId
    );

    if (validCommand && successSound) {
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
        padding: 8,
        height: '100%',
        minHeight: 0
      }}
    >
      <div
        style={{
          backgroundColor: 'black',
          color: 'lime',
          fontFamily: 'monospace',
          flexGrow: 1,
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand();
        }}
        style={{ margin: 0 }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
        />
      </form>
    </div>
  );
  };

  export default FlunksTerminal;
