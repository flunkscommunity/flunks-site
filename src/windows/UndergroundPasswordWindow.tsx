import { useState, useEffect } from 'react';
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import UndergroundCasino from "components/UndergroundCasino";
import { getApiUrl } from '../utils/apiBaseUrl';
import { supabase, hasValidSupabaseConfig } from '../lib/supabase';

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
  
  // The secret word
  const SECRET_WORDS = ['snicklefritz'];

  // Check if user already has Underground access
  useEffect(() => {
    const checkExistingAccess = async () => {
      if (!walletAddress) return;
      
      // Try Supabase view first (bypasses RLS)
      if (hasValidSupabaseConfig && supabase) {
        try {
          const { data, error } = await supabase
            .from('wallet_underground_access')
            .select('wallet_address')
            .eq('wallet_address', walletAddress)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            setHasAccess(true);
            openTheUnderground();
            return;
          }
        } catch (err) {
          console.log('⚠️ Underground access Supabase check failed, trying API');
        }
      }
      
      // Fallback to API
      try {
        const response = await fetch(getApiUrl(`/api/check-four-thieves-underground?walletAddress=${walletAddress}`));
        const data = await response.json();
        
        if (data.success && data.hasAccess) {
          setHasAccess(true);
          // If they already have access, open the Underground directly
          openTheUnderground();
        }
      } catch (error) {
        console.error('Error checking Underground access:', error);
      }
    };

    checkExistingAccess();
  }, [walletAddress]);

  // Open The Underground casino window
  const openTheUnderground = () => {
    // Open The Underground (same window as in Semester Zero) FIRST
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND}
          headerTitle="🌙 The Underground"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND)}
          initialWidth="900px"
          initialHeight="80vh"
          resizable={true}
        >
          <UndergroundCasino onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND)} />
        </DraggableResizeableWindow>
      ),
    });
    
    // Then close this password window after a small delay
    setTimeout(() => {
      handleClose();
    }, 100);
  };

  // Check password
  const checkPassword = async () => {
    // Blur the input to dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    const input = passwordInput.toLowerCase().trim();
    if (SECRET_WORDS.includes(input)) {
      setHasAccess(true);
      setPasswordError('');
      setPasswordInput('');
      
      // Record Chapter 6 Slacker completion
      if (walletAddress) {
        try {
          const response = await fetch(getApiUrl('/api/four-thieves-underground-access'), {
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
      
      // Open The Underground
      openTheUnderground();
    } else {
      setPasswordError('...the door remains closed');
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

  // PASSWORD PROMPT VIEW
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
        fontFamily: '"Press Start 2P", monospace',
        imageRendering: 'pixelated',
      }}
    >
      <div style={{ maxWidth: '600px', width: '90%' }}>
        {/* NES-style Box */}
        <div 
          style={{
            background: '#000',
            border: '6px solid #90EE90',
            boxShadow: '0 0 0 6px #000, 0 0 0 12px #FF7F50, 0 0 30px rgba(255, 127, 80, 0.5)',
            padding: '32px',
          }}
        >
          {/* Door icon */}
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
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div style="font-size: 64px; animation: doorPulse 2s ease-in-out infinite; filter: drop-shadow(0 0 10px rgba(255, 127, 80, 0.8));">🚪</div>';
              }}
            />
          </div>
          
          {/* Title */}
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
          
          {/* Description */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #FF7F50 0%, #FF6347 100%)',
              border: '4px solid #90EE90',
              padding: '24px',
              marginBottom: '24px',
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
          
          {/* Password Input */}
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
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
            />
          </div>
          
          {/* Error Message */}
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
            HINT: codes in the chat 👀
          </div>
          
          {/* Buttons */}
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
