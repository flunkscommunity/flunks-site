import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { trackDigitalLockAttempt } from '../utils/digitalLockTracking';

const LockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  border: 3px solid #444;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
`;

const DoorFrame = styled.div`
  width: 100%;
  max-width: 350px;
  height: 200px;
  background: linear-gradient(180deg, #8B4513 0%, #654321 100%);
  border: 4px solid #333;
  border-radius: 8px;
  position: relative;
  margin-bottom: 20px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
`;

const DoorHandle = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 40px;
  background: linear-gradient(45deg, #FFD700 0%, #FFA500 100%);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const LockPanel = styled.div`
  background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
  border: 3px inset #666;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
`;

const Display = styled.div<{ $error?: boolean; $success?: boolean }>`
  background: #0f0f0f;
  border: 2px inset #333;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.$error ? '#ff3333' : props.$success ? '#33ff33' : '#33ff33'};
  text-shadow: 0 0 5px currentColor;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(255,255,255,0.03) 1px,
    rgba(255,255,255,0.03) 2px
  );
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 15px;
`;

const KeyButton = styled.button`
  background: linear-gradient(135deg, #666 0%, #333 100%);
  border: 2px outset #555;
  border-radius: 6px;
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.1s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);

  &:hover {
    background: linear-gradient(135deg, #777 0%, #444 100%);
    transform: translateY(-1px);
  }

  &:active {
    border: 2px inset #555;
    transform: translateY(1px);
    background: linear-gradient(135deg, #555 0%, #222 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button<{ $variant?: string }>`
  background: ${props => props.$variant === 'clear' ? 
    'linear-gradient(135deg, #cc3333 0%, #aa1111 100%)' : 
    'linear-gradient(135deg, #33cc33 0%, #11aa11 100%)'};
  border: 2px outset ${props => props.$variant === 'clear' ? '#cc3333' : '#33cc33'};
  border-radius: 6px;
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  padding: 8px 16px;
  margin: 5px;
  cursor: pointer;
  transition: all 0.1s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    border: 2px inset ${props => props.$variant === 'clear' ? '#cc3333' : '#33cc33'};
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusLight = styled.div<{ $status?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => 
    props.$status === 'locked' ? '#ff3333' :
    props.$status === 'unlocked' ? '#33ff33' : '#ffaa33'
  };
  box-shadow: 0 0 10px currentColor;
  margin-bottom: 10px;
`;

interface DigitalLockProps {
  onUnlock: () => void;
  onCancel: () => void;
}

const DigitalLock: React.FC<DigitalLockProps> = ({ onUnlock, onCancel }) => {
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<'locked' | 'unlocked' | 'checking'>('locked');
  const [displayMessage, setDisplayMessage] = useState('ENTER 4-DIGIT CODE');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Get user authentication data
  const { walletAddress, user } = useAuth();

  // The correct sequence is "8004"
  const correctSequence = "8004";

  // Create audio context and sounds
  const createBeep = (frequency: number, duration: number, type: 'success' | 'error' = 'success') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type === 'success' ? 'sine' : 'square';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Play sound for correct digit in sequence
  const playCorrectDigitSound = () => {
    createBeep(800, 0.15, 'success'); // Higher pitch beep
  };

  // Play sound for incorrect digit
  const playIncorrectDigitSound = () => {
    createBeep(200, 0.3, 'error'); // Lower pitch buzz
  };

  // Hidden code verification using hash comparison
  const verifyCode = (code: string): boolean => {
    // Hash of "8004" - the correct code (using the actual hash from our function)
    const correctHashedCode = "83650000000000000000000000000000";
    
    // Simple hash function for the input
    const hashInput = (input: string): string => {
      let hash = '';
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash += ((char * 7 + i * 3) % 16).toString(16);
      }
      return hash.padEnd(32, '0').substring(0, 32);
    };

    return hashInput(code) === correctHashedCode;
  };

  const handleKeyPress = (digit: string) => {
    if (isLocked || inputCode.length >= 4 || digit === '*' || digit === '#') return;
    
    const newCode = inputCode + digit;
    const currentPosition = inputCode.length; // Position of the digit being entered (0-based)
    
    // Check if the digit is correct for this position in the sequence
    const isCorrectDigit = digit === correctSequence[currentPosition];
    
    // Play appropriate sound based on whether digit is correct
    if (isCorrectDigit) {
      playCorrectDigitSound();
    } else {
      playIncorrectDigitSound();
    }
    
    setInputCode(newCode);
    setDisplayMessage(`CODE: ${'*'.repeat(newCode.length)}`);
    
    if (newCode.length === 4) {
      setTimeout(() => checkCode(newCode), 500);
    }
  };

  const checkCode = async (code: string) => {
    setStatus('checking');
    setDisplayMessage('VERIFYING...');
    
    setTimeout(async () => {
      const isSuccess = verifyCode(code);
      
      // If successful, record in the crack_the_code table
      if (isSuccess && walletAddress) {
        try {
          const response = await fetch('/api/crack-the-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress,
              username: user?.username || null,
            }),
          });

          const result = await response.json();
          if (result.success) {
            console.log('✅ Code crack recorded successfully!');
            // Dispatch event to update objectives
            window.dispatchEvent(new CustomEvent('codeAccessed', { 
              detail: { walletAddress, username: user?.username } 
            }));
          } else {
            console.error('Failed to record code crack:', result.message);
          }
        } catch (error) {
          console.error('Error recording code crack:', error);
        }
      }
      
      if (isSuccess) {
        setStatus('unlocked');
        setDisplayMessage('ACCESS GRANTED');
        
        // Play success sequence - rising tones
        setTimeout(() => createBeep(400, 0.1, 'success'), 0);
        setTimeout(() => createBeep(600, 0.1, 'success'), 100);
        setTimeout(() => createBeep(800, 0.1, 'success'), 200);
        setTimeout(() => createBeep(1000, 0.2, 'success'), 300);
        
        setTimeout(() => {
          onUnlock();
        }, 1500);
      } else {
        setStatus('locked');
        setDisplayMessage('ACCESS DENIED');
        setAttempts(prev => prev + 1);
        
        // Play failure sound - descending buzz
        setTimeout(() => createBeep(300, 0.2, 'error'), 0);
        setTimeout(() => createBeep(200, 0.2, 'error'), 200);
        setTimeout(() => createBeep(150, 0.3, 'error'), 400);
        
        if (attempts >= 2) {
          setDisplayMessage('SYSTEM LOCKED');
          setIsLocked(true);
          setTimeout(() => {
            setIsLocked(false);
            setDisplayMessage('ENTER 4-DIGIT CODE');
            setAttempts(0);
          }, 10000); // 10 second lockout
        } else {
          setTimeout(() => {
            setDisplayMessage('ENTER 4-DIGIT CODE');
          }, 2000);
        }
        
        setInputCode('');
      }
    }, 1500);
  };

  const clearCode = () => {
    setInputCode('');
    setDisplayMessage('ENTER 4-DIGIT CODE');
    setStatus('locked');
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <LockContainer>
      <h2 style={{ color: '#ccc', marginBottom: '20px', textAlign: 'center' }}>
        🚪 PRINCIPAL'S OFFICE - SECURE ACCESS
      </h2>
      
      <DoorFrame>
        <DoorHandle />
      </DoorFrame>

      <LockPanel>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <StatusLight $status={status} />
        </div>
        
        <Display $error={status === 'locked' && attempts > 0} $success={status === 'unlocked'}>
          {displayMessage}
        </Display>

        <KeypadGrid>
          {keypadNumbers.flat().map((num) => (
            <KeyButton
              key={num}
              onClick={() => {
                if (num >= '0' && num <= '9') {
                  handleKeyPress(num);
                }
              }}
              disabled={isLocked || (num !== '0' && (num < '0' || num > '9'))}
            >
              {num}
            </KeyButton>
          ))}
        </KeypadGrid>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <ActionButton $variant="clear" onClick={clearCode} disabled={isLocked}>
            CLEAR
          </ActionButton>
          <ActionButton onClick={onCancel}>
            CANCEL
          </ActionButton>
        </div>

        {isLocked && (
          <div style={{ 
            color: '#ff3333', 
            textAlign: 'center', 
            marginTop: '10px', 
            fontSize: '12px',
            textShadow: '0 0 5px currentColor'
          }}>
            SYSTEM LOCKOUT: 10 SECONDS
          </div>
        )}
        
        <div style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginTop: '15px', 
          fontSize: '10px' 
        }}>
          FLUNKS SECURITY SYSTEM v2.0
        </div>
      </LockPanel>
    </LockContainer>
  );
};

export default DigitalLock;
