import React, { useState } from 'react';
import { Button } from 'react95';
import CustomCursor from '../components/CustomCursor';

const CursorTest = () => {
  const [cursorType, setCursorType] = useState<'retro' | 'pixel' | 'glitch'>('retro');
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      {/* Animated Cursor Component */}
      <CustomCursor type={cursorType} />
      
      <h1 style={{ marginBottom: '20px' }}>🖱️ Custom Cursor Showcase</h1>
      
      {/* Animated Cursor Controls */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#1a1a1a', 
        color: '#00ff00',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <h2 style={{ color: '#00ff00', marginBottom: '15px' }}>🎮 ANIMATED CURSOR CONTROL</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Button 
            onClick={() => setCursorType('retro')}
            style={{ 
              backgroundColor: cursorType === 'retro' ? '#00ff00' : '#333',
              color: cursorType === 'retro' ? '#000' : '#00ff00'
            }}
          >
            🕹️ RETRO
          </Button>
          <Button 
            onClick={() => setCursorType('pixel')}
            style={{ 
              backgroundColor: cursorType === 'pixel' ? '#00ff00' : '#333',
              color: cursorType === 'pixel' ? '#000' : '#00ff00'
            }}
          >
            🎯 PIXEL
          </Button>
          <Button 
            onClick={() => setCursorType('glitch')}
            style={{ 
              backgroundColor: cursorType === 'glitch' ? '#00ff00' : '#333',
              color: cursorType === 'glitch' ? '#000' : '#00ff00'
            }}
          >
            ⚡ GLITCH
          </Button>
        </div>
        <p style={{ marginTop: '10px', color: '#aaa' }}>
          Current: <span style={{ color: '#00ff00' }}>{cursorType.toUpperCase()}</span> - Move your mouse to see the animation!
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Default cursor */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #ccc', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Default Cursor</h3>
          <p>This is the normal cursor area. Move your mouse here.</p>
        </div>

        {/* Crosshair */}
        <div className="cursor-crosshair" style={{ 
          padding: '20px', 
          border: '2px solid #ff6b6b', 
          borderRadius: '8px',
          backgroundColor: '#ffe3e3'
        }}>
          <h3>Crosshair</h3>
          <p>Precision targeting cursor</p>
        </div>

        {/* Move */}
        <div className="cursor-move" style={{ 
          padding: '20px', 
          border: '2px solid #4ecdc4', 
          borderRadius: '8px',
          backgroundColor: '#e3fffe'
        }}>
          <h3>Move</h3>
          <p>Drag and drop cursor</p>
        </div>

        {/* Not allowed */}
        <div className="cursor-not-allowed" style={{ 
          padding: '20px', 
          border: '2px solid #ffa726', 
          borderRadius: '8px',
          backgroundColor: '#fff3e0'
        }}>
          <h3>Not Allowed</h3>
          <p>Disabled/forbidden cursor</p>
        </div>

        {/* Zoom in */}
        <div className="cursor-zoom-in" style={{ 
          padding: '20px', 
          border: '2px solid #ab47bc', 
          borderRadius: '8px',
          backgroundColor: '#f3e5f5'
        }}>
          <h3>Zoom In</h3>
          <p>Click to zoom in</p>
        </div>

        {/* Zoom out */}
        <div className="cursor-zoom-out" style={{ 
          padding: '20px', 
          border: '2px solid #26a69a', 
          borderRadius: '8px',
          backgroundColor: '#e0f2f1'
        }}>
          <h3>Zoom Out</h3>
          <p>Click to zoom out</p>
        </div>

        {/* Button with pointer */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #42a5f5', 
          borderRadius: '8px',
          backgroundColor: '#e3f2fd'
        }}>
          <h3>Button Pointer</h3>
          <Button>Hover me!</Button>
          <p style={{ marginTop: '10px' }}>Buttons show pointer cursor</p>
        </div>

        {/* Text input */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #66bb6a', 
          borderRadius: '8px',
          backgroundColor: '#e8f5e8'
        }}>
          <h3>Text Input</h3>
          <input type="text" placeholder="Type here..." style={{ 
            width: '100%', 
            padding: '8px',
            marginBottom: '10px'
          }} />
          <p>Input fields show text cursor</p>
        </div>

      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>🎮 Test Instructions:</h2>
        <ol>
          <li><strong>Move your mouse</strong> over each colored box</li>
          <li><strong>Watch the cursor change</strong> in each area</li>
          <li><strong>Click buttons and links</strong> to see pointer cursor</li>
          <li><strong>Click in text fields</strong> to see text cursor</li>
          <li><strong>Try dragging</strong> things to see grab cursors</li>
        </ol>
        
        <h3 style={{ marginTop: '20px' }}>🔧 Next Steps:</h3>
        <ul>
          <li>Add pixel art cursor images to <code>/public/images/cursors/</code></li>
          <li>Import the CustomCursor component for animated effects</li>
          <li>Create Windows 95-style cursor graphics</li>
        </ul>
        
        <h3 style={{ marginTop: '20px' }}>🎮 Animated Cursor Features:</h3>
        <ul>
          <li><strong>RETRO:</strong> Classic gaming cursor with smooth trail</li>
          <li><strong>PIXEL:</strong> Blocky 8-bit style with sharp edges</li>
          <li><strong>GLITCH:</strong> Digital distortion effects and jitter</li>
        </ul>
      </div>
    </div>
  );
};

export default CursorTest;
