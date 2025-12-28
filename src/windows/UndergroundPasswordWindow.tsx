import { useState, useEffect } from 'react';
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';

interface UndergroundPasswordWindowProps {
  onClose?: () => void;
}

const UndergroundPasswordWindow: React.FC<UndergroundPasswordWindowProps> = ({ onClose }) => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const walletAddress = unifiedAddress || primaryWallet?.address;

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [showAccessGranted, setShowAccessGranted] = useState(false);
  
  // The secret word
  const SECRET_WORDS = ['snicklefritz'];

  // Check if user already has Underground access
  useEffect(() => {
    const checkExistingAccess = async () => {
      if (!walletAddress) return;
      
      try {
        const response = await fetch(`/api/check-four-thieves-underground?walletAddress=${walletAddress}`);
        const data = await response.json();
        
        if (data.success && data.hasAccess) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking Underground access:', error);
      }
    };

    checkExistingAccess();
  }, [walletAddress]);

  // Check password
  const checkPassword = async () => {
    const input = passwordInput.toLowerCase().trim();
    if (SECRET_WORDS.includes(input)) {
      setHasAccess(true);
      setShowAccessGranted(true);
      setPasswordError('');
      setPasswordInput('');
      
      // Record Chapter 6 Slacker completion
      if (walletAddress) {
        try {
          const response = await fetch('/api/four-thieves-underground-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: walletAddress,
              username: 'Anonymous'
            })
          });
          
          const data = await response.json();
          
          if (data.success && !data.alreadyCompleted) {
            console.log('✅ Chapter 6 Slacker objective completed! +' + (data.gumAwarded || 75) + ' GUM');
            // Refresh GUM balance
            window.dispatchEvent(new CustomEvent('gum-balance-updated'));
            // Refresh objectives
            window.dispatchEvent(new CustomEvent('objectives-updated'));
          } else if (data.alreadyCompleted) {
            console.log('ℹ️ Underground already accessed');
          }
        } catch (error) {
          console.error('Failed to record Underground access:', error);
        }
      }
    } else {
      setPasswordError('...the door remains closed');
      // Clear error after 2 seconds
      setTimeout(() => setPasswordError(''), 2000);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeWindow(WINDOW_IDS.UNDERGROUND_PASSWORD);
    }
  };

  // Access granted view
  if (hasAccess && showAccessGranted) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div 
          style={{
            maxWidth: '500px',
            width: '90%',
            background: '#000',
            border: '6px solid #90EE90',
            boxShadow: '0 0 0 6px #000, 0 0 0 12px #32CD32, 0 0 40px rgba(50, 205, 50, 0.5)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          {/* Success Icon */}
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'doorPulse 2s ease-in-out infinite' }}>
            🎰
          </div>
          
          {/* Title */}
          <div style={{
            color: '#90EE90',
            fontSize: '14px',
            letterSpacing: '3px',
            textShadow: '3px 3px 0 #32CD32, 6px 6px 0 #000',
            marginBottom: '24px',
          }}>
            ≋ ACCESS GRANTED ≋
          </div>
          
          {/* Message */}
          <div style={{
            background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
            border: '4px solid #90EE90',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              color: '#fff',
              fontSize: '10px',
              lineHeight: '2',
              textShadow: '2px 2px 0 #000',
            }}>
              THE BOUNCER NODS AND<br/>
              STEPS ASIDE...<br/><br/>
              <span style={{ color: '#FFD700' }}>
                ★ WELCOME TO THE ★<br/>
                ★ UNDERGROUND ★
              </span>
            </div>
          </div>
          
          {/* Info */}
          <div style={{
            color: '#888',
            fontSize: '8px',
            lineHeight: '1.8',
            marginBottom: '20px',
          }}>
            Visit 4 Thieves Bar in<br/>
            Semester Zero to enter<br/>
            the secret casino
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(180deg, #90EE90 0%, #32CD32 100%)',
              border: '4px solid #fff',
              borderStyle: 'outset',
              color: '#000',
              padding: '12px 32px',
              fontSize: '10px',
              fontFamily: '"Press Start 2P", monospace',
              cursor: 'pointer',
              boxShadow: '0 0 0 4px #000, 0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '2px',
            }}
            onMouseDown={(e) => e.currentTarget.style.borderStyle = 'inset'}
            onMouseUp={(e) => e.currentTarget.style.borderStyle = 'outset'}
          >
            CONTINUE ►
          </button>
        </div>
        
        <style jsx>{`
          @keyframes doorPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Already has access view (visited before)
  if (hasAccess) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div 
          style={{
            maxWidth: '500px',
            width: '90%',
            background: '#000',
            border: '6px solid #cc3366',
            boxShadow: '0 0 0 6px #000, 0 0 0 12px #990033, 0 0 40px rgba(204, 51, 102, 0.5)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'doorPulse 2s ease-in-out infinite' }}>
            🎰
          </div>
          
          {/* Title */}
          <div style={{
            color: '#ff6699',
            fontSize: '14px',
            letterSpacing: '3px',
            textShadow: '3px 3px 0 #990033, 6px 6px 0 #000',
            marginBottom: '24px',
          }}>
            ≋ THE UNDERGROUND ≋
          </div>
          
          {/* Message */}
          <div style={{
            background: 'linear-gradient(135deg, #cc3366 0%, #990033 100%)',
            border: '4px solid #ff6699',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              color: '#fff',
              fontSize: '10px',
              lineHeight: '2',
              textShadow: '2px 2px 0 #000',
            }}>
              YOU ALREADY KNOW<br/>
              THE SECRET...<br/><br/>
              <span style={{ color: '#FFD700' }}>
                ★ THE BOUNCER REMEMBERS ★<br/>
                ★ YOUR FACE ★
              </span>
            </div>
          </div>
          
          {/* Info */}
          <div style={{
            color: '#888',
            fontSize: '8px',
            lineHeight: '1.8',
            marginBottom: '20px',
          }}>
            Visit 4 Thieves Bar in<br/>
            Semester Zero to access<br/>
            the secret casino
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(180deg, #cc3366 0%, #990033 100%)',
              border: '4px solid #ff6699',
              borderStyle: 'outset',
              color: '#fff',
              padding: '12px 32px',
              fontSize: '10px',
              fontFamily: '"Press Start 2P", monospace',
              cursor: 'pointer',
              boxShadow: '0 0 0 4px #000, 0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '2px',
            }}
            onMouseDown={(e) => e.currentTarget.style.borderStyle = 'inset'}
            onMouseUp={(e) => e.currentTarget.style.borderStyle = 'outset'}
          >
            CLOSE ►
          </button>
        </div>
        
        <style jsx>{`
          @keyframes doorPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Password prompt view
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
        fontFamily: '"Press Start 2P", monospace',
        imageRendering: 'pixelated',
      }}
    >
      <div 
        style={{
          maxWidth: '600px',
          width: '90%',
        }}
      >
        {/* NES-style Box */}
        <div 
          style={{
            background: '#000',
            border: '6px solid #90EE90',
            boxShadow: '0 0 0 6px #000, 0 0 0 12px #FF7F50, 0 0 30px rgba(255, 127, 80, 0.5)',
            padding: '32px',
          }}
        >
          {/* Ash / Door crack visual */}
          <div className="text-center mb-8">
            <img 
              src="/images/locations/four-thieves/password-icon.png"
              alt="Back Door"
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                animation: 'doorPulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 10px rgba(255, 127, 80, 0.8))',
                imageRendering: 'pixelated',
              }}
              onError={(e) => {
                // Fallback to emoji if image not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div style="font-size: 64px; animation: doorPulse 2s ease-in-out infinite; filter: drop-shadow(0 0 10px rgba(255, 127, 80, 0.8));">🚪</div>';
              }}
            />
          </div>
          
          {/* Title - NES style */}
          <div 
            className="text-center mb-8"
            style={{
              color: '#90EE90',
              fontSize: '16px',
              letterSpacing: '3px',
              textShadow: '3px 3px 0 #FF7F50, 6px 6px 0 #000',
            }}
          >
            ≋ THE UNDERGROUND ≋
          </div>
          
          {/* Description - NES text box style */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #FF7F50 0%, #FF6347 100%)',
              border: '4px solid #90EE90',
              padding: '24px',
              marginBottom: '24px',
              position: 'relative',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <div 
              style={{
                color: '#fff',
                fontSize: '11px',
                lineHeight: '2',
                textAlign: 'center',
                textShadow: '2px 2px 0 #000',
              }}
            >
              ◆ A HIDDEN ENTRANCE... ◆<br/>
              <br/>
              SOMEWHERE IN THE SHADOWS<br/>
              LIES A SECRET WORLD...<br/>
              <br/>
              <span style={{ 
                color: '#90EE90', 
                fontSize: '13px',
                textShadow: '2px 2px 0 #000, 0 0 10px #90EE90',
              }}>
                ★ "PASSWORD?" ★
              </span>
            </div>
          </div>
          
          {/* Password Input - NES name entry style */}
          <div 
            style={{
              background: '#000',
              border: '4px solid #90EE90',
              padding: '16px',
              marginBottom: '24px',
              boxShadow: '0 0 20px rgba(144, 238, 144, 0.3)',
            }}
          >
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              maxLength={16}
              className="w-full bg-transparent text-white text-center outline-none"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                letterSpacing: '6px',
                caretColor: '#90EE90',
                textShadow: '0 0 5px #90EE90',
              }}
              autoFocus
              placeholder="_ _ _ _ _ _ _ _ _"
            />
          </div>
          
          {/* Error Message - NES style */}
          {passwordError && (
            <div 
              className="text-center mb-6"
              style={{
                color: '#FF6347',
                fontSize: '10px',
                animation: 'blink 0.5s steps(1) infinite',
                textShadow: '2px 2px 0 #000',
              }}
            >
              ✖ {passwordError} ✖
            </div>
          )}
          
          {/* Hint */}
          <div 
            className="text-center mb-6"
            style={{
              color: '#666',
              fontSize: '8px',
              lineHeight: '1.8',
            }}
          >
            HINT: The password can be found<br/>
            somewhere in Semester Zero...
          </div>
          
          {/* Buttons - NES style */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(180deg, #d0d0d0 0%, #888 100%)',
                border: '4px solid #fff',
                borderStyle: 'outset',
                color: '#000',
                padding: '12px 24px',
                fontSize: '11px',
                fontFamily: '"Press Start 2P", monospace',
                cursor: 'pointer',
                boxShadow: '0 0 0 4px #000, 0 4px 8px rgba(0,0,0,0.5)',
                letterSpacing: '2px',
              }}
              onMouseDown={(e) => e.currentTarget.style.borderStyle = 'inset'}
              onMouseUp={(e) => e.currentTarget.style.borderStyle = 'outset'}
            >
              ◄ CLOSE
            </button>
            <button
              onClick={checkPassword}
              style={{
                background: 'linear-gradient(180deg, #90EE90 0%, #32CD32 100%)',
                border: '4px solid #FF7F50',
                borderStyle: 'outset',
                color: '#000',
                padding: '12px 24px',
                fontSize: '11px',
                fontFamily: '"Press Start 2P", monospace',
                cursor: 'pointer',
                boxShadow: '0 0 0 4px #000, 0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(144, 238, 144, 0.5)',
                letterSpacing: '2px',
                fontWeight: 'bold',
              }}
              onMouseDown={(e) => e.currentTarget.style.borderStyle = 'inset'}
              onMouseUp={(e) => e.currentTarget.style.borderStyle = 'outset'}
            >
              ENTER ►
            </button>
          </div>
        </div>
      </div>
      
      {/* NES Style Animations */}
      <style jsx>{`
        @keyframes doorPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default UndergroundPasswordWindow;
