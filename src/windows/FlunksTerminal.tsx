// components/FlunksTerminal.tsx
import { useState } from 'react';
import { Window, WindowHeader, WindowContent, TextField, Button } from 'react95';
import Draggable from 'react-draggable';

const FlunksTerminal = ({ onClose }: { onClose: () => void }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');

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
    <Draggable handle=".drag-handle">
      <div
        style={{
          position: 'fixed',
          top: 120,
          left: 120,
          zIndex: 9999,
          width: 500,
          height: 400,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Window
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="drag-handle">
            <WindowHeader className="window-title">
              <span>flunks-terminal.exe</span>
              <Button onClick={onClose} style={{ float: 'right' }}>
                <span style={{ fontWeight: 'bold' }}>×</span>
              </Button>
            </WindowHeader>
          </div>
          <WindowContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              height: '100%',
              minHeight: 0,
            }}
          >
            <div
              style={{
                backgroundColor: 'black',
                color: 'lime',
                fontFamily: 'monospace',
                flexGrow: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '10px',
                marginBottom: '10px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {history.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
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
    </Draggable>
  );
};

export default FlunksTerminal;
