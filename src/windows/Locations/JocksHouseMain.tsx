import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import JocksCloset from "components/JocksCloset";
import TimeBasedAccessWindow from "windows/TimeBasedAccessWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import { getCliqueColors, getCliqueIcon } from "utils/cliqueColors";
import { getFontStyle } from "utils/fontConfig";
import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { awardGum } from "utils/gumAPI";
import { trackDigitalLockAttempt } from "utils/digitalLockTracking";
import { useBackpackAccess } from "hooks/useBackpackAccess";

// Separate DigitalLock component to avoid state closure issues
const DigitalLockWindow = ({ onClose, primaryWallet }: { 
  onClose: () => void;
  primaryWallet: any;
}) => {
  const [localLockCode, setLocalLockCode] = useState('');
  const [localIsUnlocked, setLocalIsUnlocked] = useState(false);
  const [hasAlreadyClaimed, setHasAlreadyClaimed] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(true);
  const [claimError, setClaimError] = useState<string | null>(null);
  const correctCode = '0730';
  
  console.log('🔄 DigitalLockWindow render - localLockCode:', `"${localLockCode}"`, 'length:', localLockCode.length);

  // Check if user has already claimed this digital lock
  useEffect(() => {
    const checkDigitalLockClaim = async () => {
      if (!primaryWallet?.address) {
        setCheckingClaim(false);
        return;
      }

      try {
        const response = await fetch('/api/check-digital-lock-claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: primaryWallet.address
          })
        });

        const data = await response.json();

        if (data.success) {
          setHasAlreadyClaimed(data.hasAlreadyClaimed);
          if (data.hasAlreadyClaimed) {
            setLocalIsUnlocked(true); // Show the unlocked state immediately
          }
        } else {
          console.error('Error checking digital lock claim:', data.error);
          setClaimError('Failed to check lock status');
        }
      } catch (error) {
        console.error('Network error checking digital lock claim:', error);
        setClaimError('Network error checking lock status');
      } finally {
        setCheckingClaim(false);
      }
    };

    checkDigitalLockClaim();
  }, [primaryWallet?.address]);

  const playBeep = (frequency = 800, duration = 100) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const handleLocalKeypadPress = (digit: string) => {
    console.log('🎯 Local Keypad pressed:', digit);
    if (digit >= '0' && digit <= '9') {
      playBeep(600, 150);
      setLocalLockCode(currentCode => {
        console.log('📊 Local Current code before update:', `"${currentCode}"`, 'Length:', currentCode.length);
        if (currentCode.length < 4) {
          const newCode = currentCode + digit;
          console.log('✅ Local New code will be:', `"${newCode}"`, 'Length:', newCode.length);
          return newCode;
        }
        console.log('❌ Local Code already 4 digits, ignoring');
        return currentCode;
      });
    }
  };

  const handleLocalCodeSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔐 Local Submit attempt - lockCode:', `"${localLockCode}"`, 'correctCode:', `"${correctCode}"`);
    
    const success = localLockCode === correctCode;
    
    // Track the attempt in Supabase
    try {
      if (primaryWallet?.address) {
        console.log('📊 Tracking digital lock attempt to Supabase...');
        await trackDigitalLockAttempt(
          primaryWallet.address,
          null, // We don't have username context here, but that's okay
          localLockCode,
          success
        );
        console.log('✅ Digital lock attempt tracked successfully!');
      } else {
        console.log('⚠️ No wallet connected, skipping tracking');
      }
    } catch (error) {
      console.error('❌ Error tracking digital lock attempt:', error);
      // Don't let tracking errors stop the game flow
    }
    
    if (success) {
      console.log('✅ Local Correct code entered!');
      playBeep(1000, 500);
      
      // Check if user has already claimed this - prevent double claiming
      if (hasAlreadyClaimed) {
        console.log('⚠️ User has already claimed this digital lock');
        setLocalIsUnlocked(true);
        return;
      }

      // Record the successful unlock claim
      if (primaryWallet?.address) {
        try {
          const response = await fetch('/api/claim-digital-lock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: primaryWallet.address
            })
          });

          const claimData = await response.json();

          if (claimData.success) {
            console.log('✅ Digital lock claim recorded successfully');
            setHasAlreadyClaimed(true);
          } else {
            console.error('❌ Failed to record digital lock claim:', claimData.error);
            setClaimError('Failed to record unlock - but lock is still opened');
          }
        } catch (error) {
          console.error('❌ Network error recording digital lock claim:', error);
          setClaimError('Network error recording unlock - but lock is still opened');
        }
      }

      setLocalIsUnlocked(true);
    } else {
      console.log('❌ Local Incorrect code.');
      playBeep(200, 800);
      setTimeout(() => {
        setLocalLockCode('');
      }, 1000);
    }
  };

  const clearLocalCode = () => {
    console.log('🧹 Local Clearing code');
    playBeep(400, 200);
    setLocalLockCode('');
  };

  return (
    <div className="p-6 w-full h-full bg-gray-900 text-white flex flex-col justify-center items-center overflow-hidden">
      <div className="text-center mb-6 px-4">
        <h2 className="text-xl mb-3">🔒 Locked Trunk</h2>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed max-w-sm mx-auto break-words">
          You found a locked trunk under the bed, figure out the code to see what's inside!
        </p>
      </div>
      
      {/* Loading State */}
      {checkingClaim && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking lock status...</p>
        </div>
      )}

      {/* Error State */}
      {claimError && (
        <div className="text-center mb-4">
          <p className="text-yellow-400 text-sm">⚠️ {claimError}</p>
        </div>
      )}
      
      {!checkingClaim && !localIsUnlocked ? (
        <div className="w-full max-w-sm mx-auto">
          {/* Show already claimed message if applicable */}
          {hasAlreadyClaimed && (
            <div className="bg-yellow-100 text-black p-4 rounded-lg border-2 border-yellow-600 mb-6">
              <div className="text-center">
                <p className="font-bold">🔓 Already Unlocked!</p>
                <p className="text-sm mt-2">You've already unlocked this trunk before. The contents are revealed below.</p>
              </div>
            </div>
          )}

          {/* Digital Display */}
          <div className="bg-black border-2 border-gray-600 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2">
                {hasAlreadyClaimed ? 'ALREADY UNLOCKED' : 'ENTER 4-DIGIT CODE'}
              </div>
              <div className="text-2xl font-mono text-green-400 tracking-widest">
                {hasAlreadyClaimed ? '✓✓✓✓' : localLockCode.padEnd(4, '_').split('').map((char, index) => (
                  <span key={index} className="mx-1">
                    {char === '_' ? '○' : char}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {hasAlreadyClaimed ? 'Lock previously opened' : `Debug: "${localLockCode}" (length: ${localLockCode.length})`}
              </div>
            </div>
          </div>
          
          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-6 max-w-[200px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
              <button
                key={digit}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Local Button clicked:', digit);
                  handleLocalKeypadPress(digit);
                }}
                disabled={digit === '*' || digit === '#' || hasAlreadyClaimed}
                className={`w-12 h-12 rounded font-mono text-lg font-bold transition-all duration-150 border-2 ${
                  digit === '*' || digit === '#' || hasAlreadyClaimed
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600'
                    : 'bg-gray-600 hover:bg-gray-500 text-white hover:scale-105 active:scale-95 border-gray-500 hover:border-gray-400'
                }`}
              >
                {digit}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            {hasAlreadyClaimed ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocalIsUnlocked(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 text-lg"
              >
                🔓 VIEW CONTENTS
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Local UNLOCK button clicked, lockCode:', `"${localLockCode}"`, 'length:', localLockCode.length);
                  handleLocalCodeSubmit(e);
                }}
                disabled={localLockCode.length !== 4}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 text-lg ${
                  localLockCode.length === 4 
                    ? 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white cursor-pointer' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                🔓 UNLOCK ({localLockCode.length}/4)
              </button>
            )}
            
            {!hasAlreadyClaimed && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearLocalCode();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 text-lg"
              >
                🔄 CLEAR
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 text-lg"
            >
              🚪 CANCEL
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl mb-3">📦 Unlocked Trunk</h2>
            <p className="text-base text-gray-300 mb-4 leading-relaxed">
              {hasAlreadyClaimed 
                ? "You've already unlocked this trunk. Here are the contents you discovered..."
                : "The lock clicks open, revealing the contents inside..."
              }
            </p>
            {primaryWallet?.address && (
              <p className="text-xs text-green-400 mb-2">
                🎯 {hasAlreadyClaimed ? 'Previously unlocked by' : 'Success tracked for'} wallet: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
              </p>
            )}
            {hasAlreadyClaimed && (
              <p className="text-xs text-yellow-400 mb-2">
                ⚠️ One-time unlock: This trunk can only be unlocked once per wallet
              </p>
            )}
          </div>
          
          <div className="bg-yellow-100 text-black p-6 rounded-lg border-2 border-yellow-600 shadow-lg transform rotate-1">
            <div className="text-center">
              <div className="text-lg font-bold mb-4 text-gray-800">
                Mysterious Message
              </div>
              <div className="text-base leading-relaxed font-handwriting" style={{ fontFamily: 'cursive' }}>
                "the first to get 5869 wins the flow at the end of the rainbow"
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              What could this cryptic message mean?
            </p>
          </div>
        </>
      )}
      
      <div className="mt-6">
        <button
          onClick={() => onClose()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 text-lg"
        >
          🚪 Close
        </button>
      </div>
    </div>
  );
};

const JocksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const [gumClaimed, setGumClaimed] = useState(false);
  const { hasBackpackBase, backpackAccess } = useBackpackAccess();
  
  // Use your uploaded day/night images for Jocks House
  const dayImage = "/images/locations/snow locations/jocks-house-snow-day.png";
  const nightImage = "/images/locations/snow locations/jocks-house-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const openRoom = (roomKey: string, title: string, content: string) => {
    const cliqueColors = getCliqueColors('JOCK');
    const fontStyle = getFontStyle('JOCK');
    
    openWindow({
      key: roomKey,
      window: (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(450px, 90vw)',
            maxHeight: '70vh',
            backgroundColor: cliqueColors.primary,
            border: '3px solid #FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Title */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '12px 16px',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            ...fontStyle,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            {getCliqueIcon('JOCK')} {title}
          </div>
          
          {/* Content */}
          <div style={{
            padding: '20px',
            flex: 1,
            backgroundColor: cliqueColors.primary,
            ...fontStyle,
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#FFFFFF',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'auto'
          }}>
            {content}
          </div>
          
          {/* Close Button */}
          <div style={{
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button
              onClick={() => closeWindow(roomKey)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '4px',
                color: '#FFFFFF',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                ...fontStyle,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      ),
    });
  };

  const openCloset = () => {
    openWindow({
      key: "jocks-closet",
      window: (
        <DraggableResizeableWindow
          windowsId="jocks-closet"
          headerTitle="Jock's Closet"
          onClose={() => closeWindow("jocks-closet")}
          initialWidth="90vw"
          initialHeight="95vh"
          resizable={true}
        >
          <div className="w-full h-full bg-black text-white overflow-y-auto flex flex-col">
            {/* Closet image section - flexible height */}
            <div className="relative w-full flex-shrink-0" style={{ height: '50vh', maxHeight: '400px' }}>
              <img
                src="/images/locations/jocks-closet.png"
                alt="Jock's Closet Interior"
                className="w-full h-full object-contain"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Interactive Buttons section - fixed at bottom */}
            <div className="bg-black bg-opacity-90 p-3 border-t border-gray-600 flex-shrink-0">
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm min-h-[44px] flex items-center justify-center">
                  📻 Cassette Box
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm min-h-[44px] flex items-center justify-center">
                  🖼️ Picture Frame
                </button>
                <button 
                  onClick={() => openTeddyBackpackAccess()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm min-h-[44px] flex items-center justify-center cursor-pointer"
                  title="Access teddy backpack content"
                >
                  🎒 Teddy Backpack
                </button>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  const openBackpackAccessDemo = () => {
    // Simple fortune cookie message for everyone
    openWindow({
      key: "fortune-cookie",
      window: (
        <DraggableResizeableWindow
          windowsId="fortune-cookie"
          headerTitle="� Fortune Cookie"
          onClose={() => closeWindow("fortune-cookie")}
          initialWidth="400px"
          initialHeight="300px"
          resizable={false}
        >
          <div className="p-6 text-center bg-gradient-to-br from-yellow-100 to-orange-100 h-full flex flex-col justify-center">
            <div className="text-6xl mb-4">�</div>
            <h2 className="text-xl font-bold mb-4 text-orange-800">Fortune Cookie</h2>
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-orange-200">
              <p className="text-lg font-medium text-gray-800 italic">
                "Good things come to those who wait"
              </p>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };


  const openTeddyBackpackAccess = () => {
    // Check if user has teddy backpack
    const hasTeddyBackpack = hasBackpackBase('Teddy');
    
    // Debug logging
    console.log('Teddy Backpack Access Check:', {
      hasTeddyBackpack,
      totalBackpackTraits: backpackAccess.traits.length,
      teddyTraits: backpackAccess.traits.filter(trait => trait.base === 'Teddy').length,
      allBases: backpackAccess.traits.map(trait => trait.base)
    });
    
    if (hasTeddyBackpack) {
      // Show the fortune message for users with teddy backpack
      openWindow({
        key: "teddy-backpack-access",
        window: (
          <DraggableResizeableWindow
            windowsId="teddy-backpack-access"
            headerTitle="🎒 Teddy Backpack"
            onClose={() => closeWindow("teddy-backpack-access")}
            initialWidth="400px"
            initialHeight="300px"
            resizable={false}
          >
            <div className="p-6 text-center bg-gradient-to-br from-orange-100 to-red-100 h-full flex flex-col justify-center">
              <div className="text-6xl mb-4">🎒</div>
              <h2 className="text-xl font-bold mb-4 text-orange-800">Teddy Backpack</h2>
              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-orange-200">
                <p className="text-lg font-medium text-gray-800 italic">
                  "Good things come to those who wait"
                </p>
              </div>
            </div>
          </DraggableResizeableWindow>
        ),
      });
    } else {
      // Show access denied message
      openWindow({
        key: "teddy-backpack-denied",
        window: (
          <DraggableResizeableWindow
            windowsId="teddy-backpack-denied"
            headerTitle="🚫 Access Denied"
            onClose={() => closeWindow("teddy-backpack-denied")}
            initialWidth="400px"
            initialHeight="250px"
            resizable={false}
          >
            <div className="p-6 text-center bg-gradient-to-br from-red-100 to-gray-100 h-full flex flex-col justify-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-bold mb-4 text-red-800">Access Denied</h2>
              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-red-200">
                <p className="text-lg font-medium text-gray-800">
                  Users must have a teddy backpack to access this area.
                </p>
              </div>
            </div>
          </DraggableResizeableWindow>
        ),
      });
    }
  };

  const openTimeBasedAccessDemo = () => {
    openWindow({
      key: "time-based-access-demo",
      window: (
        <DraggableResizeableWindow
          windowsId="time-based-access-demo"
          headerTitle="🕐 Time-Based Access Control"
          onClose={() => closeWindow("time-based-access-demo")}
          initialWidth="750px"
          initialHeight="90vh"
          resizable={true}
        >
          <TimeBasedAccessWindow onClose={() => closeWindow("time-based-access-demo")} />
        </DraggableResizeableWindow>
      ),
    });
  };

  const openBedroom = () => {
    openWindow({
      key: WINDOW_IDS.JOCKS_HOUSE_BEDROOM,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.JOCKS_HOUSE_BEDROOM}
          headerTitle="Jock's Bedroom"
          onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_BEDROOM)}
          initialWidth="90vw"
          initialHeight="90vh"
          resizable={true}
        >
          <div className="w-full h-full bg-[#1a1a1a] text-white overflow-auto flex flex-col">
            {/* Image Section - Takes up most of the space */}
            <div className="relative flex-1 min-h-[400px] bg-black">
              <img
                src="/images/locations/jocks-bedroom.png"
                alt="Jock's Bedroom Interior"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Description and Buttons Section - Below the image */}
            <div className="bg-black bg-opacity-90 p-4 sm:p-6 border-t border-gray-600">
              <h1 className="text-xl sm:text-2xl mb-2 sm:mb-3 font-bold text-center">🛏️ Jock's Bedroom</h1>
              <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 text-center">
                The personal sanctuary of a champion athlete. Every corner speaks to dedication, 
                discipline, and the relentless pursuit of excellence.
              </p>
              <p className="text-xs text-gray-300 mb-4 text-center">
                Explore different areas of the bedroom to uncover the secrets of athletic success.
              </p>
              
              {/* Interactive Buttons */}
              <div className="max-w-lg mx-auto">
                {/* First row - 4 buttons with responsive grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <button
                    onClick={() => openCloset()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                  >
                    👕 Closet
                  </button>
                  
                  <button
                    onClick={() => 
                      openUnderBed()
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                  >
                    🛏️ Under the Bed
                  </button>
                </div>
                
                {/* Second row - Computer button */}
                <div className="flex justify-center">
                  <button
                    disabled
                    className="bg-gray-600 text-gray-400 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold cursor-not-allowed opacity-50 shadow-lg w-full sm:w-64 text-sm sm:text-base min-h-[44px]"
                    title="Coming soon..."
                  >
                    💻 Computer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  const correctCode = '0730';

  // Add audio feedback
  const playBeep = (frequency = 800, duration = 100) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const openUnderBed = () => {
    console.log('🚪 Opening Under the Bed - Digital Lock window');
    
    openWindow({
      key: WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_under_bed_lock',
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_under_bed_lock'}
          headerTitle="Under the Bed - Digital Lock"
          onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_under_bed_lock')}
          initialWidth="500px"
          initialHeight="600px"
          resizable={false}
        >
          <DigitalLockWindow 
            onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_under_bed_lock')} 
            primaryWallet={primaryWallet}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  const openStudyDesk = () => {
    openWindow({
      key: WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_study_desk',
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_study_desk'}
          headerTitle="Jock's Study Desk"
          onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_BEDROOM + '_study_desk')}
          initialWidth="70vw"
          initialHeight="70vh"
          resizable={true}
        >
          <div className="relative w-full h-full bg-[#1a1a1a] text-white overflow-hidden">
            {/* Study Desk Background Image */}
            <img
              src="/images/locations/jocks-study-desk.png"
              alt="Jock's Study Desk"
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => {
                e.currentTarget.src = "/images/backdrops/BLANK.png";
              }}
            />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 bg-black bg-opacity-40 p-6 flex flex-col justify-between">
              {/* Top Section - Interactive Elements */}
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-black bg-opacity-80 p-6 rounded-lg max-w-2xl">
                  <h1 className="text-2xl mb-4 font-bold text-center">📚 Championship Study Desk</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-blue-300 mb-2">📋 Playbooks & Strategy</h3>
                      <p className="text-sm text-gray-300">
                        Multiple playbooks are spread across the desk surface. Red ink marks key plays, 
                        and sticky notes highlight winning strategies. The pages show wear from constant study.
                      </p>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-green-300 mb-2">💻 Game Analysis</h3>
                      <p className="text-sm text-gray-300">
                        A laptop displays paused game footage. Multiple browser tabs show opponent statistics, 
                        player performance metrics, and upcoming game schedules.
                      </p>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-yellow-300 mb-2">🏆 Scholarship Letter</h3>
                      <p className="text-sm text-gray-300">
                        Pinned prominently to the corkboard above - a full-ride scholarship offer from State University. 
                        The letter is creased from being read multiple times.
                      </p>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-purple-300 mb-2">💊 Training Supplements</h3>
                      <p className="text-sm text-gray-300">
                        Protein powder containers and vitamin bottles line the back edge. A training schedule 
                        shows 5:30 AM workouts and strict meal timing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Motivational Quote */}
              <div className="bg-black bg-opacity-80 p-4 rounded">
                <p className="text-center text-lg font-bold text-yellow-300 mb-2">
                  "Champions are made when nobody's watching"
                </p>
                <p className="text-center text-sm text-gray-300">
                  A handwritten note taped to the desk lamp reminds that success comes from dedication, 
                  preparation, and zero excuses - even in the quiet hours of studying game film and strategy.
                </p>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 bg-black">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Jock's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="max-w-full max-h-full object-contain transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-blue-900 bg-opacity-20' 
              : 'bg-yellow-100 bg-opacity-5'
          }`}
        />
      </div>

      {/* Room Buttons Section */}
      <div className="w-full bg-gradient-to-r from-red-800 via-blue-900 to-red-800 p-2 border-t-2 border-red-500 shadow-xl flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
          {/* Basement */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.JOCKS_HOUSE_GARAGE,
                "Basement",
                "Weight sets and exercise equipment fill the space. Motivational posters cover the walls with bold messages: 'ZERO EXCUSES', 'WINNERS NEVER QUIT', and 'THERE ARE NO SHORTCUTS TO ANY PLACE WORTH GOING'. The constant reminder that there are zero excuses for failure drives every workout."
              )
            }
            className="bg-gradient-to-br from-red-600 to-blue-800 hover:from-red-500 hover:to-blue-700 text-white px-4 py-2 rounded-lg border-2 border-red-400 hover:border-red-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            🏠 Basement
          </button>

          {/* Kitchen */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.JOCKS_HOUSE_KITCHEN,
                "Kitchen",
                "Protein shakes and energy bars stack the counter. A meal prep schedule is taped to the fridge."
              )
            }
            className="bg-gradient-to-br from-red-600 to-blue-800 hover:from-red-500 hover:to-blue-700 text-white px-4 py-2 rounded-lg border-2 border-red-400 hover:border-red-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            🥤 Kitchen
          </button>

          {/* Living Room */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.JOCKS_HOUSE_LIVING_ROOM,
                "Living Room",
                "Sports trophies line the shelves. A worn football sits on the coffee table."
              )
            }
            className="bg-gradient-to-br from-red-600 to-blue-800 hover:from-red-500 hover:to-blue-700 text-white px-4 py-2 rounded-lg border-2 border-red-400 hover:border-red-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            🏆 Living
          </button>

          {/* Bedroom */}
          <button
            onClick={openBedroom}
            className="bg-gradient-to-br from-red-600 to-blue-800 hover:from-red-500 hover:to-blue-700 text-white px-4 py-2 rounded-lg border-2 border-red-400 hover:border-red-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            🛏️ Bedroom
          </button>
        </div>
      </div>
    </div>
  );
};

export default JocksHouseMain;
