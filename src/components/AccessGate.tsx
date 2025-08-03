import React, { useState } from 'react';
import { Button, Frame, Window, WindowContent, WindowHeader } from 'react95';
import styled from 'styled-components';

const GateContainer = styled.div`
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
    background: 
      linear-gradient(90deg, transparent 0px, transparent 18px, #00ff00 18px, #00ff00 20px, transparent 20px, transparent 40px),
      linear-gradient(0deg, transparent 0px, transparent 18px, #00ff00 18px, #00ff00 20px, transparent 20px, transparent 40px),
      linear-gradient(45deg, transparent 0px, transparent 28px, #ff00ff 28px, #ff00ff 30px, transparent 30px, transparent 60px),
      linear-gradient(-45deg, transparent 0px, transparent 28px, #ffff00 28px, #ffff00 30px, transparent 30px, transparent 60px);
    background-size: 40px 40px, 40px 40px, 60px 60px, 60px 60px;
    animation: pipes 20s linear infinite;
    opacity: 0.3;
    z-index: -1;
  }
`;

const GateWindow = styled(Window)`
  max-width: 600px;
  width: 90%;
`;

const AccessCode = {
  ADMIN: 'FLUNKS2025',
  BETA: 'SEMESTER0',
  COMMUNITY: 'HIGHSCHOOL95'
};

const AccessLevel = {
  ADMIN: 'ADMIN',
  BETA: 'BETA', 
  COMMUNITY: 'COMMUNITY'
};

interface AccessGateProps {
  onAccessGranted: () => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onAccessGranted }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate checking access code
    await new Promise(resolve => setTimeout(resolve, 1000));

    const upperCode = code.toUpperCase();
    if (Object.values(AccessCode).includes(upperCode as any)) {
      // Determine access level
      let accessLevel;
      if (upperCode === AccessCode.ADMIN) {
        accessLevel = AccessLevel.ADMIN;
      } else if (upperCode === AccessCode.BETA) {
        accessLevel = AccessLevel.BETA;
      } else if (upperCode === AccessCode.COMMUNITY) {
        accessLevel = AccessLevel.COMMUNITY;
      }

      // Store access in session
      sessionStorage.setItem('flunks-access-granted', 'true');
      sessionStorage.setItem('flunks-access-level', accessLevel);
      sessionStorage.setItem('flunks-access-code', upperCode);
      onAccessGranted();
    } else {
      setError('Invalid access code. Please contact the Flunks team for access.');
    }
    
    setLoading(false);
  };

  return (
    <GateContainer>
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
                
                @keyframes pipes {
                  0% {
                    transform: translate(0, 0);
                  }
                  25% {
                    transform: translate(-20px, -20px);
                  }
                  50% {
                    transform: translate(-40px, 0);
                  }
                  75% {
                    transform: translate(-20px, 20px);
                  }
                  100% {
                    transform: translate(0, 0);
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
