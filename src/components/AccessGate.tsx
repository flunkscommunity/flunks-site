import React, { useState } from 'react';
import { Button, Frame, Window, WindowContent, WindowHeader } from 'react95';
import styled from 'styled-components';
import { BACKGROUND_CONFIG } from 'config/backgroundConfig';
import useThemeSettings from 'store/useThemeSettings';

const GateContainer = styled.div<{ backgroundImage?: string }>`
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'MS Sans Serif', sans-serif;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    
    /* Use your pretty my-background.png file */
    background: url('/images/my-background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    
    /* Fallback to clouds if image doesn't load */
    background-color: #87CEEB;
    
    opacity: ${BACKGROUND_CONFIG.opacity};
    z-index: -1;
  }
  
  /* Remove the old animation */
  @keyframes slowPanBackground {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 100% center;
    }
  }
`;

const GateWindow = styled(Window)`
  max-width: 600px;
  width: 90%;
`;

interface AccessGateProps {
  onAccessGranted: () => void;
}

// Debug: Log the configuration being used
console.log('AccessGate Background Config:', BACKGROUND_CONFIG);

const AccessGate: React.FC<AccessGateProps> = ({ onAccessGranted }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { backgroundImage } = useThemeSettings();

  // Debug logging
  console.log('AccessGate backgroundImage:', backgroundImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        // Store access in session
        sessionStorage.setItem('flunks-access-granted', 'true');
        sessionStorage.setItem('flunks-access-level', result.accessLevel);
        sessionStorage.setItem('flunks-access-code', result.code);
        onAccessGranted();
      } else {
        setError('Invalid access code. Please contact the Flunks team for access.');
      }
    } catch (error) {
      console.error('Access validation error:', error);
      setError('Connection error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <GateContainer backgroundImage={backgroundImage}>
      <GateWindow>
        <WindowHeader>
          <span>🏫 Flunks High School - Access Required</span>
        </WindowHeader>
        <WindowContent>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <img 
                  src="/images/icons/astro-mascot.png" 
                  alt="Astro Mascot" 
                  style={{ 
                    width: '80px', 
                    height: '96px',
                    imageRendering: 'pixelated',
                    animation: 'floatLeftRight 4s ease-in-out infinite'
                  }}
                />
              </div>
              
              {/* CSS Animation Styles */}
              <style jsx>{`
                @keyframes floatLeftRight {
                  0% {
                    transform: translateX(-15px);
                  }
                  50% {
                    transform: translateX(15px);
                  }
                  100% {
                    transform: translateX(-15px);
                  }
                }
              `}</style>
              
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
                Welcome to Flunks High School
              </h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                This site is currently in beta testing. Enter your access code to continue.
              </p>
            </div>

            <Frame variant="field" style={{ padding: '15px', marginBottom: '15px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Access Code:
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your access code"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px inset #dfdfdf',
                      fontFamily: 'inherit',
                      fontSize: '14px'
                    }}
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div style={{ 
                    color: 'red', 
                    fontSize: '12px', 
                    marginBottom: '15px',
                    textAlign: 'left'
                  }}>
                    ❌ {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || !code.trim()}
                  style={{ width: '100%' }}
                >
                  {loading ? '⏳ Checking...' : '🚪 Enter School'}
                </Button>
              </form>
            </Frame>

            <div style={{ fontSize: '12px', color: '#666', textAlign: 'left' }}>
              <strong>Need access?</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Follow <a href="https://twitter.com/FlunksCommunity" target="_blank" rel="noopener">@FlunksCommunity</a></li>
                <li>Join our <a href="https://discord.gg/wuukvhHhS3" target="_blank" rel="noopener">Discord</a></li>
                <li>Contact the team for beta access</li>
              </ul>
            </div>
          </div>
        </WindowContent>
      </GateWindow>
    </GateContainer>
  );
};

export default AccessGate;
