import { useEffect, useRef, useState } from 'react';
import {
  Window,
  WindowHeader,
  WindowContent,
  TextField,
  Button
} from 'react95';

const errorSound = typeof Audio !== "undefined" ? new Audio('/sounds/incorrect.mp3') : null;
const successSound = typeof Audio !== "undefined" ? new Audio('/sounds/correct.mp3') : null;
const FlunksTerminal = ({ onClose }: { onClose: () => void }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = () => {
    const newHistory = [...history, `> ${input}`];
    let response = '';

let validCommand = true;

switch (input.toLowerCase()) {
  case 'help':
    response = 'Available commands: help, whoami, flunks, clear';
    break;
  case 'whoami':
    response = 'You are a misfit of Flunks High.';
    break;
  case 'flunks':
    response = 'Flunks is a 90s-inspired digital universe full of secrets.';
    break;
  case 'wtf':
    response = '🎉 SURPRISE! WE JUST STOLE ALL YOUR NFTS!!! jk, you\'re entered into a FLOW giveaway! Keep exploring for more secrets...';
    break;
  case 'clear':
    setHistory([]);
    setInput('');
    return;
  default:
    response = 'Command not recognized. Type "help" to see available commands.';
    validCommand = false;
    if (errorSound) {
      errorSound.currentTime = 0;
      errorSound.play();
    }
    break;
}

if (validCommand && successSound) {
  successSound.currentTime = 0;
  successSound.play();
}

    setHistory([...newHistory, response]);
    setInput('');
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Window style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <WindowHeader className="window-title">
          <span>flunks-terminal.exe</span>
          <Button onClick={onClose} style={{ float: 'right' }}>
            <span style={{ fontWeight: 'bold' }}>×</span>
          </Button>
        </WindowHeader>

        <WindowContent
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
        </WindowContent>
      </Window>
    </div>
  );
};

export default FlunksTerminal;
