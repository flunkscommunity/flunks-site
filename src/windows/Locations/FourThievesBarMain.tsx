import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import RetroTextBox from "components/RetroTextBox";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import { useState, useEffect, useRef } from "react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import { useDemoModeOptional, isDemoPlatform } from 'contexts/DemoModeContext';
import { useGum } from 'contexts/GumContext';
import VideoPoker from "components/games/VideoPoker";
import VideoPokerBattleTested from "components/games/VideoPokerBattleTested";
import Blackjack from "components/games/Blackjack";
import ScratchCard from "components/games/ScratchCard";
import SlotsGame from "components/games/SlotsGame";
import PoolGame from "components/games/pool/PoolGame";
import { useRouter } from 'next/router';

const FourThievesBarMain = () => {
  const router = useRouter();
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();

  // Demo mode support for App Store / Play Store review
  const demoMode = useDemoModeOptional();
  const isDemoMode = isDemoPlatform() && (demoMode?.isDemoMode || false);

  // Debug: Log demo mode status
  useEffect(() => {
    console.log('🍺 [FourThievesBar] Demo mode check:', {
      isDemoPlatform: isDemoPlatform(),
      contextIsDemoMode: demoMode?.isDemoMode,
      finalIsDemoMode: isDemoMode,
      demoBalance: demoMode?.demoBalance
    });
  }, [isDemoMode, demoMode?.isDemoMode, demoMode?.demoBalance]);

  const walletAddress = isDemoMode ? demoMode?.demoWalletAddress : (unifiedAddress || primaryWallet?.address);

  // GUM integration (real balance from API, or demo balance)
  const { balance: gumBalance, updateBalance } = useGum();
  const effectiveBalance = isDemoMode ? (demoMode?.demoBalance ?? 1000) : gumBalance;

  // Day/night images
  const dayImage = "/images/locations/snow locations/4-thieves-snow-day.png";
  const nightImage = "/images/locations/snow locations/4-thieves-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);
  const isDay = timeBasedInfo.isDay;

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const undergroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isUndergroundMuted, setIsUndergroundMuted] = useState(false);

  // Secret word system for Underground access
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [hasUndergroundAccess, setHasUndergroundAccess] = useState(false);
  const [showingBackView, setShowingBackView] = useState(false);
  
  // The secret word
  const SECRET_WORDS = ['snicklefritz'];

  // Night time check (6 PM to 6 AM)
  const hour = new Date().getHours();
  const isNightTime = hour >= 18 || hour < 6;
  // For localhost testing, allow access anytime
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const canAccessBackDoor = true; // Always allow back door access for all users

  // Track if user is inside the bar
  const [isInsideBar, setIsInsideBar] = useState(false);
  
  // Track if pool game is open (music only plays during pool game)
  const [isPoolGameOpen, setIsPoolGameOpen] = useState(false);

  useEffect(() => {
    // Initialize 4 Thieves music (but don't play yet - wait for pool game)
    audioRef.current = new Audio('/music/4thieves.mp3');
    audioRef.current.loop = false; // We'll manually loop at 1 minute
    audioRef.current.volume = 1.0; // 100% volume for pool game

    // Loop at 1 minute (60 seconds)
    const handleTimeUpdate = () => {
      if (audioRef.current && audioRef.current.currentTime >= 60) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.log);
      }
    };

    // Also handle if the track ends naturally (shouldn't happen with 8 min track, but just in case)
    const handleEnded = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.log);
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);

    // Don't auto-play on load - wait for pool game to open

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current && isPoolGameOpen) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [isMuted, isPoolGameOpen]);

  // Start/stop music when pool game opens/closes
  useEffect(() => {
    if (audioRef.current) {
      if (isPoolGameOpen && !isMuted) {
        audioRef.current.currentTime = 2; // Skip first 2 seconds to avoid lag/silence
        audioRef.current.play().catch(console.log);
        console.log('🎵 4 Thieves music started (pool game opened)');
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('🎵 4 Thieves music stopped');
      }
    }
  }, [isPoolGameOpen, isMuted]);

  // Callback when VideoPoker updates balance (for external sync)
  const handleBalanceUpdate = (newBalance: number) => {
    if (isDemoMode && demoMode) {
      demoMode.updateDemoBalance(newBalance);
    } else {
      updateBalance(newBalance);
    }
    console.log(`🃏 Video Poker balance update: ${newBalance}`);
  };

  const getCurrentBackground = () => {
    if (showingBackView) {
      // Show the back of the building (day/night versions)
      return isDay 
        ? "/images/locations/snow locations/4-thieves-back-day-snow.png"
        : "/images/locations/snow locations/4-thieves-back-night-snow.png";
    }
    return isDay ? dayImage : nightImage;
  };

  // Check password for Underground access
  const checkPassword = async () => {
    const input = passwordInput.toLowerCase().trim();
    if (SECRET_WORDS.includes(input)) {
      setHasUndergroundAccess(true);
      setShowPasswordPrompt(false);
      setPasswordError('');
      setPasswordInput('');
      
      // Record Chapter 6 Slacker completion
      if (walletAddress && !isDemoMode) {
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
          console.error('❌ Failed to award Underground access GUM:', error);
        }
      }
      
      // Open the Underground!
      openUnderground();
    } else {
      setPasswordError('The bouncer shakes his head slowly...');
      setPasswordInput('');
    }
  };

  // Handle back door click - go to back view
  const handleBackDoorClick = () => {
    if (!canAccessBackDoor) {
      // Shouldn't happen since button is hidden, but just in case
      return;
    }
    setShowingBackView(true);
  };

  // Handle underground entrance from back view
  const handleUndergroundEntrance = () => {
    if (hasUndergroundAccess) {
      openUnderground();
    } else {
      setShowPasswordPrompt(true);
      setPasswordError('');
    }
  };

  // Generic room opener for text-based rooms
  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="450px"
          initialHeight="350px"
          resizable={false}
        >
          <div className="p-4 w-full h-full bg-gradient-to-br from-amber-950 via-red-950 to-amber-950">
            <RetroTextBox
              title={title}
              content={content}
              className="w-full h-full"
            />
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Slot Machine - opens in a draggable window
  const openSlotMachine = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE}
          headerTitle="🎰 Lucky Slots - The Underground"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE)}
          initialWidth={isMobile ? "95vw" : "420px"}
          initialHeight={isMobile ? "90vh" : "680px"}
          resizable={true}
        >
          <SlotsGame 
            walletAddress={walletAddress}
            initialBalance={effectiveBalance}
            onBalanceUpdate={handleBalanceUpdate}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Video Poker (Battle-Tested version) - uses real GUM via API
  const openVideoPoker = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER}
          headerTitle="🃏 Jacks or Better - 4 Thieves"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER)}
          initialWidth={isMobile ? "95vw" : "540px"}
          initialHeight={isMobile ? "90vh" : "700px"}
          resizable={true}
        >
          <VideoPokerBattleTested 
            walletAddress={walletAddress}
            initialBalance={effectiveBalance}
            onBalanceUpdate={handleBalanceUpdate}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Blackjack - uses real GUM via API
  const openBlackjack = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_BLACKJACK,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_BLACKJACK}
          headerTitle="🃏 Blackjack - The Underground"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_BLACKJACK)}
          initialWidth={isMobile ? "95vw" : "440px"}
          initialHeight={isMobile ? "90vh" : "660px"}
          resizable={true}
        >
          <Blackjack 
            walletAddress={walletAddress}
            initialBalance={effectiveBalance}
            onBalanceUpdate={handleBalanceUpdate}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_BLACKJACK)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Scratch Cards
  const openScratchCards = () => {
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_SCRATCH_CARDS,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_SCRATCH_CARDS}
          headerTitle="🎟️ Lucky Scratchers - 4 Thieves"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SCRATCH_CARDS)}
          initialWidth="380px"
          initialHeight="620px"
          resizable={false}
        >
          <ScratchCard 
            gumBalance={effectiveBalance}
            onGumChange={(amount) => {
              // Update via context when scratch card gives GUM
              const newBalance = Math.max(0, effectiveBalance + amount);
              if (isDemoMode && demoMode) {
                demoMode.updateDemoBalance(newBalance);
              } else {
                updateBalance(newBalance);
              }
            }}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Pool Game
  const openPoolGame = () => {
    // Start the music when pool game opens
    setIsPoolGameOpen(true);
    
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_POOL_ROOM,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_POOL_ROOM}
          headerTitle="🎱 8-Ball Pool - Four Thieves"
          onClose={() => {
            setIsPoolGameOpen(false); // Stop music when pool game closes + unhides MAIN window
            closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_POOL_ROOM);
          }}
          initialWidth={typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.() ? '100vw' : 'calc(100vw - 12px)'}
          initialHeight={typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.() ? '100vh' : 'calc(100vh - 56px)'}
          resizable={false}
          windowClassName="pool-game-window"
        >
          <PoolGame 
            walletAddress={walletAddress}
            gumBalance={effectiveBalance}
            onStopBarMusic={() => {
              // Stop 4thieves bar music — cutscene/pool music takes over
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              setIsPoolGameOpen(false);
            }}
            onGumChange={(amount) => {
              const newBalance = Math.max(0, effectiveBalance + amount);
              if (isDemoMode && demoMode) {
                demoMode.updateDemoBalance(newBalance);
              } else {
                updateBalance(newBalance);
              }
            }}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open the main interior view
  const openInterior = () => {
    // Turn up the music when entering the bar
    setIsInsideBar(true);
    
    // Day/night interior images
    const interiorImage = isDay 
      ? "/images/locations/4-thieves-inside-day.png"
      : "/images/locations/4-thieves-inside-night.png";
    
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR}
          headerTitle="4 Thieves Bar & Grill - Inside"
          onClose={() => {
            setIsInsideBar(false); // Turn volume back down when leaving
            closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR);
          }}
          initialWidth="900px"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Interior Image - Day/Night Cycle */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src={interiorImage}
                alt="4 Thieves Bar & Grill Interior"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>

            {/* Pool Game Button - Always visible */}
            <div className="w-full bg-gradient-to-r from-amber-800 via-red-900 to-amber-800 p-3 border-t-2 border-yellow-600 shadow-xl">
              <button
                onClick={openPoolGame}
                className="w-full bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-6 py-4 rounded-lg border-2 border-emerald-400 hover:border-emerald-300 transition-all duration-300 hover:scale-105 text-center text-lg font-bold shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
              >
                🎱 Pool Table
              </button>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open the back room (kitchen/storage area)
  const openBackRoom = () => {
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_BACK_ROOM,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_BACK_ROOM}
          headerTitle="4 Thieves - Back Room"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_BACK_ROOM)}
          initialWidth="800px"
          initialHeight="70vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Back Room Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src="/images/locations/four-thieves/four-thieves-back-room.png"
                alt="4 Thieves Back Room"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Back Room Buttons */}
            <div className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-4 border-t-4 border-gray-600 shadow-2xl flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {/* Pool Room - NEW! */}
                <button
                  onClick={openPoolGame}
                  className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-4 py-3 rounded-lg border-3 border-emerald-400 hover:border-emerald-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🎱 Pool Room
                </button>

                {/* Private Booths */}
                <button
                  onClick={() => openRoom(
                    WINDOW_IDS.FOUR_THIEVES_BAR_PRIVATE_BOOTH,
                    "Private Booths",
                    "Curved leather booths offer just enough privacy for bad deals. The flickering neon sign above them is wired to short out whenever the wrong name is spoken. You notice scratch marks on the table... and is that a hidden compartment?"
                  )}
                  className="bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white px-4 py-3 rounded-lg border-3 border-indigo-400 hover:border-indigo-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🕵️ Private Booths
                </button>

                {/* Back Alley */}
                <button
                  onClick={() => openRoom(
                    WINDOW_IDS.FOUR_THIEVES_BAR_BACK_ALLEY,
                    "Back Alley",
                    "A single buzzing light illuminates crates of contraband soda and a door marked KEEP OUT. The alley camera is always pointed just slightly the wrong way. You hear whispered conversations that stop the moment you appear."
                  )}
                  className="bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white px-4 py-3 rounded-lg border-3 border-gray-400 hover:border-gray-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🚪 Back Alley
                </button>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open the Underground - Secret speakeasy casino
  const openUnderground = () => {
    // Pause main bar music
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Start Underground music
    if (!undergroundAudioRef.current) {
      undergroundAudioRef.current = new Audio('/music/underground.mp3');
      undergroundAudioRef.current.loop = true;
      undergroundAudioRef.current.volume = 0.3;
    }
    
    if (!isUndergroundMuted) {
      undergroundAudioRef.current.play().catch(console.log);
    }
    
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND}
          headerTitle="🌙 The Underground"
          onClose={() => {
            // Stop Underground music when closing
            if (undergroundAudioRef.current) {
              undergroundAudioRef.current.pause();
              undergroundAudioRef.current.currentTime = 0;
            }
            // Resume main bar music
            if (audioRef.current && !isMuted) {
              audioRef.current.play().catch(console.log);
            }
            closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND);
          }}
          initialWidth="900px"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Underground Ambiance Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0 bg-black">
              <img
                src="/images/locations/four-thieves/underground.png"
                alt="The Underground"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
              {/* Smoky overlay effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 100%, rgba(128, 0, 128, 0.2) 0%, transparent 70%)',
                }}
              />
              
              {/* Mute Button - Bottom Right */}
              <button
                onClick={() => {
                  setIsUndergroundMuted(!isUndergroundMuted);
                  if (undergroundAudioRef.current) {
                    if (!isUndergroundMuted) {
                      undergroundAudioRef.current.pause();
                    } else {
                      undergroundAudioRef.current.play().catch(console.log);
                    }
                  }
                }}
                className="absolute bottom-4 right-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 sm:p-3 rounded-full border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:scale-110 shadow-lg z-10"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
                title={isUndergroundMuted ? "Unmute Music" : "Mute Music"}
              >
                {isUndergroundMuted ? '🔇' : '🔊'}
              </button>
            </div>
            
            {/* Underground Buttons */}
            <div className="w-full bg-gradient-to-r from-purple-950 via-black to-purple-950 p-4 border-t-4 border-purple-500 shadow-2xl flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                {/* Slot Machine */}
                <button
                  onClick={openSlotMachine}
                  className="bg-gradient-to-br from-amber-700 to-orange-900 hover:from-amber-600 hover:to-orange-800 text-white px-4 py-3 rounded-lg border-3 border-yellow-500 hover:border-yellow-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🎰 Lucky Slots
                </button>

                {/* High Stakes Poker */}
                <button
                  onClick={openVideoPoker}
                  className="bg-gradient-to-br from-green-800 to-green-950 hover:from-green-700 hover:to-green-900 text-white px-4 py-3 rounded-lg border-3 border-green-500 hover:border-green-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🃏 Video Poker
                </button>

                {/* Blackjack */}
                <button
                  onClick={openBlackjack}
                  className="bg-gradient-to-br from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white px-4 py-3 rounded-lg border-3 border-red-500 hover:border-red-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🂡 Blackjack
                </button>

                {/* Back to Bar */}
                <button
                  onClick={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_UNDERGROUND)}
                  className="bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white px-4 py-3 rounded-lg border-3 border-gray-500 hover:border-gray-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🚪 Leave
                </button>
              </div>

              {/* GUM Balance Display */}
              <div className="mt-3 text-center">
                <span 
                  className="px-4 py-2 rounded-lg inline-block"
                  style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#c084fc',
                    fontFamily: 'monospace',
                    border: '2px solid #9333ea',
                  }}
                >
                  💰 GUM: {gumBalance}
                </span>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Main component render - Exterior view
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Background Image - Full width */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 bg-black">
        <img
          src={getCurrentBackground()}
          alt={`4 Thieves Bar & Grill - ${isDay ? 'Day' : 'Night'}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />
        
        {/* Neon Sign Glow Effect at Night */}
        {!isDay && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 100, 50, 0.15) 0%, transparent 50%)',
            }}
          />
        )}
      </div>

      {/* Bottom Buttons - Bar style with warm colors */}
      <div className="w-full bg-gradient-to-r from-amber-800 via-red-900 to-amber-800 p-2 border-t-2 border-yellow-600 shadow-xl flex-shrink-0">
        {showingBackView ? (
          <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
            {/* Back to Front */}
            <button
              onClick={() => setShowingBackView(false)}
              className="bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-400 hover:border-gray-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
              style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
            >
              ← Back to Front
            </button>

            {/* Back Door */}
            <button
              onClick={handleUndergroundEntrance}
              className="bg-gradient-to-br from-purple-900 to-black hover:from-purple-800 hover:to-gray-900 text-white px-4 py-2 rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap animate-pulse"
              style={{ 
                fontFamily: 'Cooper Black, Georgia, serif',
                boxShadow: '0 0 20px rgba(128, 0, 128, 0.5)',
              }}
            >
              🚪 Back Door
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
            {/* Front Door */}
            <button
              onClick={openInterior}
              className="bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-4 py-2 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
              style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
            >
              🚪 Front Door
            </button>

            {/* Back Door */}
            {canAccessBackDoor ? (
              <button
                onClick={handleBackDoorClick}
                className="bg-gradient-to-br from-purple-900 to-black hover:from-purple-800 hover:to-gray-900 text-white px-4 py-2 rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap animate-pulse"
                style={{ 
                  fontFamily: 'Cooper Black, Georgia, serif',
                  boxShadow: '0 0 20px rgba(128, 0, 128, 0.5)',
                }}
              >
                🚪 Back Door
              </button>
            ) : (
              <button
                disabled
                className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 px-4 py-2 rounded-lg border-2 border-gray-700 text-center text-sm font-bold shadow-lg whitespace-nowrap cursor-not-allowed opacity-50"
                style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                title="..."
              >
                🔒 Back Door
              </button>
            )}
          </div>
        )}
      </div>

      {/* Secret Word Password Prompt Modal - NES Style */}
      {showPasswordPrompt && (
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          onClick={() => setShowPasswordPrompt(false)}
          style={{
            background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '90%',
              fontFamily: '"Press Start 2P", monospace',
              imageRendering: 'pixelated',
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
              {/* Door crack visual */}
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
                ≋ THE BACK DOOR ≋
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
                  ◆ THE DOOR SLIGHTLY CRACKS OPEN ◆<br/>
                  <br/>
                  A MYSTERIOUS VOICE ECHOES<br/>
                  FROM THE DARKNESS...<br/>
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
              
              {/* Buttons - NES style */}
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => setShowPasswordPrompt(false)}
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
                  ◄ LEAVE
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
        </div>
      )}
      
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
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
};

export default FourThievesBarMain;
