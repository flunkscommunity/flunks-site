// components/FlunksTerminal.tsx
import { useState } from 'react';
import { Window, WindowHeader, WindowContent, TextField, Button } from 'react95';

const FlunksTerminal = ({ onClose }: { onClose: () => void }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);


  const handleCommand = () => {
    const newHistory = [...history, `> ${input}`];
    let response = '';

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
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        response = 'Command not recognized. Type "help" to see available commands.';
    }

    setHistory([...newHistory, response]);
    setInput('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <Window
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
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
            minHeight: 0,
            padding: 8,
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
              minHeight: 0,
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
