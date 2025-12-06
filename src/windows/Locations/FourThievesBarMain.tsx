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
  const dayImage = "/images/locations/four-thieves/four-thieves-day.png";
  const nightImage = "/images/locations/four-thieves/four-thieves-night.png";
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
    autoTrigger: true, // Trigger on room entry
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

  useEffect(() => {
    // Initialize bar music
    audioRef.current = new Audio('/music/bar-ambience.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

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
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [isMuted]);

  const handleGumChange = (amount: number) => {
    setGumBalance(prev => Math.max(0, prev + amount));
    // TODO: In production, call API to update GUM balance
  };

  const getCurrentBackground = () => {
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

  // Handle back door click
  const handleBackDoorClick = () => {
    if (!canAccessBackDoor) {
      // Shouldn't happen since button is hidden, but just in case
      return;
    }
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
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR}
          headerTitle="4 Thieves Bar & Grill - Inside"
          onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_INTERIOR)}
          initialWidth="900px"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Interior Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src="/images/locations/four-thieves/four-thieves-interior.png"
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
            
            {/* Interior Buttons */}
            <div className="w-full bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 p-4 border-t-4 border-yellow-600 shadow-2xl flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
                {/* Slot Machine */}
                <button
                  onClick={openSlotMachine}
                  className="bg-gradient-to-br from-purple-600 to-purple-900 hover:from-purple-500 hover:to-purple-800 text-white px-3 py-3 rounded-lg border-3 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap animate-pulse"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🎰 Slots
                </button>

                {/* Video Poker */}
                <button
                  onClick={openVideoPoker}
                  className="bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white px-3 py-3 rounded-lg border-3 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🃏 Poker
                </button>

                {/* Scratch Cards */}
                <button
                  onClick={openScratchCards}
                  className="bg-gradient-to-br from-pink-600 to-pink-900 hover:from-pink-500 hover:to-pink-800 text-white px-3 py-3 rounded-lg border-3 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🎟️ Scratchers
                </button>

                {/* Bar Counter */}
                <button
                  onClick={() => openRoom(
                    WINDOW_IDS.FOUR_THIEVES_BAR_MAIN_BAR,
                    "The Bar",
                    "Sticky mahogany stretches the length of the room. The bartender, a grizzled old-timer with a missing pinky, polishes glasses that are already spotless. Four mismatched bar stools are permanently claimed by regulars who speak only in whispers when outsiders enter. The tap selection includes some drinks you've never heard of."
                  )}
                  className="bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white px-3 py-3 rounded-lg border-3 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🥃 The Bar
                </button>

                {/* Pool Room */}
                <button
                  onClick={() => openRoom(
                    WINDOW_IDS.FOUR_THIEVES_BAR_POOL_ROOM,
                    "Pool Room",
                    "The green felt is scarred with cigarette burns, and the cue rack is missing two sticks. Someone carved a warning into the table: 'Don't break unless you're ready to lose.' A group of bikers in the corner eye you suspiciously."
                  )}
                  className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-3 py-3 rounded-lg border-3 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🎱 Pool Room
                </button>
              </div>

              {/* GUM Balance Display */}
              <div className="mt-3 text-center">
                <span 
                  className="px-4 py-2 rounded-lg inline-block"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#ffd700',
                    fontFamily: 'monospace',
                    border: '2px solid #ffd700',
                  }}
                >
                  💰 Your GUM: {gumBalance}
                </span>
              </div>
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
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-0">
        <img
          src={getCurrentBackground()}
          alt={`4 Thieves Bar & Grill - ${isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-cover"
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
      <div className="w-full bg-gradient-to-r from-amber-800 via-red-900 to-amber-800 p-4 border-t-4 border-yellow-600 shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Front Door */}
          <button
            onClick={openInterior}
            className="bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-6 py-3 rounded-xl border-4 border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🚪 Front Door
          </button>

          {/* Back Door */}
          {canAccessBackDoor ? (
            <button
              onClick={handleBackDoorClick}
              className="bg-gradient-to-br from-purple-900 to-black hover:from-purple-800 hover:to-gray-900 text-white px-6 py-3 rounded-xl border-4 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg hover:shadow-xl whitespace-nowrap animate-pulse"
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
              className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 px-6 py-3 rounded-xl border-4 border-gray-700 text-center text-base font-black shadow-lg whitespace-nowrap cursor-not-allowed opacity-50"
              style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
              title="..."
            >
              🔒 Back Door
            </button>
          )}
        </div>
        
        {/* Location Title */}
        <div className="text-center mt-3">
          <span 
            className="text-yellow-300 text-lg font-black"
            style={{ 
              fontFamily: 'Cooper Black, Georgia, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255, 200, 50, 0.3)',
            }}
          >
            🍺 4 THIEVES BAR & GRILL 🍺
          </span>
        </div>
      </div>

      {/* Music Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
        style={{ zIndex: 20 }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

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
