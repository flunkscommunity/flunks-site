import { useEffect, useRef, useState } from 'react';
import {
  TextField
} from 'react95';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../contexts/UserProfileContext';
import { trackTerminalActivity, generateSessionId, COMMAND_TYPES } from 'utils/activityTracking';

const errorSound = typeof Audio !== "undefined" ? new Audio('/sounds/incorrect.mp3') : null;
const successSound = typeof Audio !== "undefined" ? new Audio('/sounds/correct.mp3') : null;

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
