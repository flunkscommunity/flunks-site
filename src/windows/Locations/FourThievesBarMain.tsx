import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import RetroTextBox from "components/RetroTextBox";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import { useState, useEffect, useRef } from "react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import SlotMachine from "components/games/SlotMachine";
import VideoPoker from "components/games/VideoPoker";
import VideoPokerBattleTested from "components/games/VideoPokerBattleTested";
import ScratchCard from "components/games/ScratchCard";
import { useNpcEvents } from "hooks/useNpcEvents";
import { NpcEventModal } from "components/NpcEventModal";

const FourThievesBarMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const effectiveWallet = primaryWallet;
  const walletAddress = unifiedAddress || primaryWallet?.address;

  // Day/night images
  const dayImage = "/images/locations/snow locations/4-thieves-snow-day.png";
  const nightImage = "/images/locations/snow locations/4-thieves-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);
  const isDay = timeBasedInfo.isDay;

  // GUM balance state (would be fetched from API in production)
  const [gumBalance, setGumBalance] = useState(500); // Starting balance for demo

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Secret word system for Underground access
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [hasUndergroundAccess, setHasUndergroundAccess] = useState(false);
  const [showingBackView, setShowingBackView] = useState(false);
  
  // The secret word - 90s gambling/nostalgia themed
  const SECRET_WORDS = [
    'rainman',      // Dustin Hoffman counting cards
    'vegas',        // Classic destination
    'highroller',   // 90s casino term
    'blackjack',    // The game
    'royale',       // Casino Royale vibes
    'maverick',     // 1994 Mel Gibson poker movie
    'rounders',     // 1998 poker classic
    'aces',         // Cards
    'snake eyes',   // Craps reference / 1998 movie
    'dealer',       // Classic
  ];
  const CURRENT_SECRET = 'snake eyes'; // Craps reference / 1998 Nicolas Cage movie

  // Night time check (6 PM to 6 AM)
  const hour = new Date().getHours();
  const isNightTime = hour >= 18 || hour < 6;
  // For localhost testing, allow access anytime
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const canAccessBackDoor = isNightTime || isLocalhost;

  // NPC Events System - The Underground!
  const [npcState, npcActions] = useNpcEvents({
    room: "underground",
    walletAddress: walletAddress || "anonymous",
    gumBalance: gumBalance,
    autoTrigger: false, // DON'T trigger on main page - only in Underground
    onGumChange: (delta, newBalance) => {
      // Update GUM balance from NPC events
      setGumBalance(newBalance);
      console.log(`[NPC] GUM changed by ${delta}, new balance: ${newBalance}`);
    },
    onEffectApplied: (effect) => {
      console.log(`[NPC] Effect applied:`, effect);
      // TODO: Handle other effects (items, flags, reputation)
    },
    debug: true, // Enable for development
  });

  // Track if user is inside the bar
  const [isInsideBar, setIsInsideBar] = useState(false);

  useEffect(() => {
    // Initialize 4 Thieves music
    audioRef.current = new Audio('/music/4thieves.mp3');
    audioRef.current.loop = false; // We'll manually loop at 1 minute
    audioRef.current.volume = 0.25; // 25% on landing page

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

    const playMusic = async () => {
      try {
        if (audioRef.current && !isMuted) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('Music autoplay blocked');
      }
    };

    playMusic();

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
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [isMuted]);

  // Adjust volume based on whether user is inside the bar
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      // Smooth volume transition
      const targetVolume = isInsideBar ? 0.75 : 0.25;
      audioRef.current.volume = targetVolume;
      console.log(`🎵 4 Thieves volume: ${targetVolume * 100}%`);
    }
  }, [isInsideBar, isMuted]);

  const handleGumChange = (amount: number) => {
    setGumBalance(prev => Math.max(0, prev + amount));
    // TODO: In production, call API to update GUM balance
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
  const checkPassword = () => {
    const input = passwordInput.toLowerCase().trim();
    if (SECRET_WORDS.includes(input)) {
      setHasUndergroundAccess(true);
      setShowPasswordPrompt(false);
      setPasswordError('');
      setPasswordInput('');
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

  // Open Slot Machine
  const openSlotMachine = () => {
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE}
          headerTitle="🎰 Lucky Slots - 4 Thieves"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE)}
          initialWidth="450px"
          initialHeight="650px"
          resizable={false}
        >
          <SlotMachine 
            walletAddress={walletAddress}
            gumBalance={gumBalance}
            onGumChange={handleGumChange}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SLOT_MACHINE)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open Video Poker (Battle-Tested version)
  const openVideoPoker = () => {
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER}
          headerTitle="🃏 Jacks or Better - 4 Thieves"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER)}
          initialWidth="480px"
          initialHeight="700px"
          resizable={true}
        >
          <VideoPokerBattleTested 
            walletAddress={walletAddress}
            gumBalance={gumBalance}
            onGumChange={handleGumChange}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER)}
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
            walletAddress={walletAddress}
            gumBalance={gumBalance}
            onGumChange={handleGumChange}
            onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_SCRATCH_CARDS)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Open the main interior with slot machine and video poker
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
              {/* Hidden NPC trigger - subtle corner shadow that's clickable */}
              <button
                onClick={() => npcActions.triggerEventCheck()}
                className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-500 cursor-pointer"
                style={{ 
                  boxShadow: '0 0 20px rgba(128, 0, 128, 0.3)',
                }}
                title="Something catches your eye in the shadows..."
              >
                <span className="opacity-30 hover:opacity-70 transition-opacity text-lg">👁️</span>
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
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
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

  // Open the Underground - Secret speakeasy with shady characters
  const openUnderground = () => {
    // Trigger NPC event when entering Underground
    npcActions.triggerEventCheck();
    
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
            </div>
            
            {/* Underground Buttons */}
            <div className="w-full bg-gradient-to-r from-purple-950 via-black to-purple-950 p-4 border-t-4 border-purple-500 shadow-2xl flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                {/* Talk to Someone - Main NPC Event Trigger */}
                <button
                  onClick={() => npcActions.triggerEventCheck()}
                  className="bg-gradient-to-br from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-3 rounded-lg border-3 border-purple-400 hover:border-purple-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg animate-pulse col-span-2"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                  title="Approach a shady character..."
                >
                  🎭 Talk to Someone
                </button>

                {/* High Stakes Poker */}
                <button
                  onClick={openVideoPoker}
                  className="bg-gradient-to-br from-green-800 to-green-950 hover:from-green-700 hover:to-green-900 text-white px-4 py-3 rounded-lg border-3 border-green-500 hover:border-green-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🃏 High Stakes
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

            {/* NPC Event Modal - Shared with main component */}
            <NpcEventModal
              event={npcState.activeEvent}
              outcome={npcState.currentOutcome}
              awaitingChoice={npcState.awaitingChoice}
              isLoading={npcState.isLoading}
              gumBalance={gumBalance}
              onChoice={npcActions.makeChoice}
              onDismiss={npcActions.dismissEvent}
              canAfford={npcActions.canAfford}
              getChoiceCost={npcActions.getChoiceCost}
              error={npcState.error}
            />
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Main component render - Exterior view
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 p-1">
        <img
          src={getCurrentBackground()}
          alt={`4 Thieves Bar & Grill - ${isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-contain"
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
                🌙 Back Door
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

      {/* NPC Event Modal */}
      <NpcEventModal
        event={npcState.activeEvent}
        outcome={npcState.currentOutcome}
        awaitingChoice={npcState.awaitingChoice}
        isLoading={npcState.isLoading}
        gumBalance={gumBalance}
        onChoice={npcActions.makeChoice}
        onDismiss={npcActions.dismissEvent}
        canAfford={npcActions.canAfford}
        getChoiceCost={npcActions.getChoiceCost}
        error={npcState.error}
      />

      {/* Secret Word Password Prompt Modal */}
      {showPasswordPrompt && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPasswordPrompt(false)}
        >
          <div 
            className="bg-gradient-to-br from-purple-950 via-black to-purple-950 p-6 rounded-xl border-4 border-purple-500 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 40px rgba(128, 0, 128, 0.5)',
            }}
          >
            {/* Bouncer Icon */}
            <div className="text-center mb-4">
              <span className="text-6xl">🚪</span>
            </div>
            
            {/* Title */}
            <h2 
              className="text-purple-300 text-xl font-black text-center mb-2"
              style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
            >
              The Back Door
            </h2>
            
            {/* Description */}
            <p className="text-gray-400 text-sm text-center mb-4">
              A large figure blocks your path. He leans in close and whispers...
            </p>
            <p className="text-purple-400 text-center mb-4 italic">
              "What's the word?"
            </p>
            
            {/* Password Input */}
            <div className="space-y-3">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
                placeholder="Enter the secret word..."
                className="w-full px-4 py-3 bg-black bg-opacity-50 border-2 border-purple-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-center"
                autoFocus
              />
              
              {/* Error Message */}
              {passwordError && (
                <p className="text-red-400 text-sm text-center animate-pulse">
                  {passwordError}
                </p>
              )}
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-all"
                >
                  Leave
                </button>
                <button
                  onClick={checkPassword}
                  className="flex-1 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all font-bold"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FourThievesBarMain;
