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

    try {
      // Get command response from secure backend API
      const apiResponse = await fetch('/api/terminal-commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: input.toLowerCase() }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        response = result.response;
        commandType = result.type;
        validCommand = result.validCommand;

        // Special handling for clear command
        if (result.response === '__CLEAR__') {
          setHistory([]);
          setInput('');
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
        }
      } else {
        response = 'Command not recognized. Type "help" to see available commands.';
        validCommand = false;
        commandType = 'UNKNOWN';
      }
    } catch (error) {
      console.error('Terminal command error:', error);
      response = 'System error. Please try again.';
      validCommand = false;
      commandType = 'ERROR';
    }

    // Play error sound for invalid commands
    if (!validCommand && errorSound) {
      errorSound.currentTime = 0;
      errorSound.play();
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

    // Special logging for WTF command
    if (input.toLowerCase().trim() === 'wtf' && validCommand) {
      try {
        await fetch('/api/log-wtf-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: user?.verifiedCredentials?.[0]?.address || null,
            accessLevel: 'BETA', // Users with terminal access have BETA level
            sessionId: sessionId,
            command: input
          })
        });
      } catch (error) {
        console.error('Failed to log WTF command:', error);
        // Don't show error to user, just log it
      }
    }

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
