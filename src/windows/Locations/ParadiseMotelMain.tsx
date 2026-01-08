import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import MaidDialogue from "components/MaidDialogue";
import StoryManual from "components/StoryManual";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import RetroTextBox from "components/RetroTextBox";
import { useState, useEffect, useRef } from "react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import * as fcl from '@onflow/fcl';
import SetupCollectionButton from "components/SetupCollectionButton";
// Ensure FCL is properly configured for mainnet
import '../../config/fcl';

// Room 1 Bell Component
interface Room1BellComponentProps {
  onClose: () => void;
  wallet?: string;
}

const Room1BellComponent: React.FC<Room1BellComponentProps> = ({ onClose, wallet }) => {
  const [ringCount, setRingCount] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize bell sound
    bellAudioRef.current = new Audio('/sounds/ding.mp3');
    return () => {
      if (bellAudioRef.current) {
        bellAudioRef.current.pause();
        bellAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleBellRing = () => {
    // Play bell sound
    if (bellAudioRef.current) {
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(console.log);
    }
    setRingCount(prev => prev + 1);
  };

  const handleClaimGum = async () => {
    if (!wallet || claiming || claimed) return;

    setClaiming(true);
    try {
      const response = await fetch('/api/claim-room-1-bell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet })
      });

      const data = await response.json();
      
      if (data.success) {
        setClaimed(true);
        setClaimMessage(`🎉 ${data.message || 'You claimed 100 GUM!'}`);
      } else {
        setClaimMessage(`⚠️ ${data.message || 'Already claimed or cooldown active'}`);
      }
    } catch (error) {
      console.error('Error claiming GUM:', error);
      setClaimMessage('❌ Error claiming GUM. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const getMessage = () => {
    if (ringCount === 0) return "There's a bell on the desk. Maybe you should ring it?";
    if (ringCount >= 1 && ringCount <= 3) return "Please ring only once, thanks management";
    if (ringCount >= 4 && ringCount <= 9) return "Seriously, stop";
    if (ringCount >= 10) return "Fine! Here's your reward. Happy now?";
    return "";
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_1}
      headerTitle="Paradise Motel - Lobby"
      onClose={onClose}
      initialWidth="450px"
      initialHeight="600px"
      resizable={false}
    >
      <div className="w-full h-full bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-3 flex flex-col items-center justify-between overflow-hidden">
        {/* Room Description */}
        <div className="bg-black bg-opacity-50 p-3 rounded-lg max-w-full flex-shrink-0">
          <p className="text-amber-100 text-center text-sm font-serif leading-snug">
            {getMessage()}
          </p>
        </div>

        {/* Bell Display */}
        <div className="text-7xl my-2 animate-bounce flex-shrink-0">
          🔔
        </div>

        {/* Ring Bell Button */}
        {!claimed && (
          <button
            onClick={handleBellRing}
            className="bg-gradient-to-br from-amber-500 to-orange-700 hover:from-amber-400 hover:to-orange-600 text-white px-6 py-3 rounded-lg border-3 border-amber-300 hover:border-amber-200 transition-all duration-300 hover:scale-110 text-lg font-black shadow-2xl flex-shrink-0"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🔔 Ring Bell
          </button>
        )}

        {/* Claim GUM Button - Shows at 10 rings */}
        {ringCount >= 10 && !claimed && (
          <button
            onClick={handleClaimGum}
            disabled={claiming || !wallet}
            className={`bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-400 hover:to-emerald-600 text-white px-6 py-3 rounded-lg border-3 border-green-300 hover:border-green-200 transition-all duration-300 hover:scale-110 text-lg font-black shadow-2xl flex-shrink-0 ${
              claiming || !wallet ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            {claiming ? '⏳ Claiming...' : '💰 Claim 100 GUM'}
          </button>
        )}

        {/* Claim Message */}
        {claimMessage && (
          <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg flex-shrink-0">i'm
            <p className="text-yellow-300 text-sm font-bold text-center">
              {claimMessage}
            </p>
          </div>
        )}

        {/* Wallet Warning */}
        {ringCount >= 10 && !wallet && !claimed && (
          <div className="bg-red-900 bg-opacity-70 px-4 py-2 rounded-lg border-2 border-red-500 flex-shrink-0">
            <p className="text-red-200 text-xs font-bold text-center">
              ⚠️ Please connect your wallet to claim GUM
            </p>
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

const ParadiseMotelMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  
  // 🚀 LOCALHOST DEVELOPMENT BYPASS
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Create mock wallet for localhost development
  const mockWallet = isDevelopment ? { address: 'dev-wallet-bypass' } : null;
  // Use unified address (works for both Dapper and FCL wallets)
  const effectiveWallet = isDevelopment ? mockWallet : (unifiedAddress ? { address: unifiedAddress } : primaryWallet);
  
  // Use day/night images for Paradise Motel
  const dayImage = "/images/locations/snow locations/paradise-motel-day-snow.png";
  const nightImage = "/images/locations/snow locations/paradise-motel-night-snow.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);
  const isDay = timeBasedInfo.isDay;

  // Background music state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [room7SlackerCompleted, setRoom7SlackerCompleted] = useState(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<string>('');

  // Determine day/night for music selection
  const isCurrentlyDay = () => {
    if (typeof window === 'undefined') return true;
    const isFlunksBuild = window.location.hostname === 'flunks-build.vercel.app';
    if (isFlunksBuild) return true;
    
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18; // 6 AM - 6 PM is daytime
  };

  // Initialize background music when component mounts
  useEffect(() => {
    const musicTrack = isCurrentlyDay() ? '/music/paradisemotel.mp3' : '/music/night.mp3';
    
    if (!audioRef.current) {
      audioRef.current = new Audio(musicTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set to 30% volume
      setCurrentMusicTrack(musicTrack);
    }

    const playMusic = async () => {
      try {
        if (audioRef.current && !isMuted) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('Music autoplay blocked by browser');
      }
    };

    playMusic();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Switch music when day/night changes
  useEffect(() => {
    const musicTrack = isCurrentlyDay() ? '/music/paradisemotel.mp3' : '/music/night.mp3';
    
    if (audioRef.current && musicTrack !== currentMusicTrack) {
      const wasPlaying = !audioRef.current.paused;
      const currentVolume = audioRef.current.volume;
      
      audioRef.current.pause();
      audioRef.current.src = musicTrack;
      audioRef.current.volume = currentVolume;
      setCurrentMusicTrack(musicTrack);
      
      if (wasPlaying && !isMuted) {
        audioRef.current.play().catch(console.log);
      }
    }
    
    // Check every minute for day/night changes
    const interval = setInterval(() => {
      const newTrack = isCurrentlyDay() ? '/music/paradisemotel.mp3' : '/music/night.mp3';
      if (newTrack !== currentMusicTrack && audioRef.current) {
        const wasPlaying = !audioRef.current.paused;
        const currentVolume = audioRef.current.volume;
        
        audioRef.current.pause();
        audioRef.current.src = newTrack;
        audioRef.current.volume = currentVolume;
        setCurrentMusicTrack(newTrack);
        
        if (wasPlaying && !isMuted) {
          audioRef.current.play().catch(console.log);
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentMusicTrack, isMuted]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="400px"
          initialHeight="300px"
          resizable={false}
        >
          <div className="p-4 w-full h-full">
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

  const getCurrentBackground = () => {
    return isDay ? dayImage : nightImage;
  };

  // Function to open Room 1 - locked, needs key
  const openRoom1 = () => {
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour < 18;
    const roomImage = "/images/locations/paradise motel/room-1.png";

    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_1,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_1}
          headerTitle="Paradise Motel - Lobby"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_1)}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col bg-black">
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src={roomImage}
                alt={`Paradise Motel Room 1 - ${isDay ? 'Day' : 'Night'}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Lost Key Button */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-800 p-4 border-t-4 border-purple-400 flex-shrink-0">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => {
                    // TODO: Wire this to key check logic
                    alert('🔑 Maybe you should go look around a bit. Maybe. Maybe not though.');
                  }}
                  className="w-full bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-6 py-4 rounded-lg border-3 border-amber-400 hover:border-amber-300 transition-all duration-300 hover:scale-105 text-center text-lg font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🔑 Do you have the lost key?
                </button>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open Room 6 - locked, needs key
  const openRoom6 = () => {
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour < 18;
    const roomImage = "/images/locations/paradise motel/room-6.png";

    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_6,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_6}
          headerTitle="Paradise Motel - Room 6"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_6)}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col bg-black">
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src={roomImage}
                alt={`Paradise Motel Room 6 - ${isDay ? 'Day' : 'Night'}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Lost Key Button */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-800 p-4 border-t-4 border-purple-400 flex-shrink-0">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => {
                    // TODO: Wire this to key check logic
                    alert('🔑 This feature is coming soon! You\'ll need to find the lost key...');
                  }}
                  className="w-full bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-6 py-4 rounded-lg border-3 border-amber-400 hover:border-amber-300 transition-all duration-300 hover:scale-105 text-center text-lg font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🔑 Do you have the lost key?
                </button>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open Room 7 based on time of day
  const openRoom7 = async () => {
    // Use user's LOCAL timezone for day/night detection
    const now = new Date();
    const hour = now.getHours(); // Gets hour in user's local timezone (0-23)
    
    // Day time is 6 AM (06:00) to 6 PM (18:00) in user's LOCAL timezone
    const isDayTime = hour >= 6 && hour < 18;
    const isNightTime = !isDayTime;
    
    if (isDayTime) {
      // During day: show room-7-day.png with peephole button
      openWindow({
        key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
        window: (
          <DraggableResizeableWindow
            windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
            headerTitle="Paradise Motel - Room 7"
            onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
            initialWidth="80vw"
            initialHeight="80vh"
            resizable={true}
          >
            <div className="relative w-full h-full flex flex-col bg-black">
              {/* Room 7 Day Image */}
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                <img
                  src="/images/locations/paradise motel/room-7-day.png"
                  alt="Paradise Motel Room 7 (Day)"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/backdrops/BLANK.png";
                  }}
                />
              </div>
              
              {/* Peephole Button at Bottom */}
              <div className="bg-gradient-to-r from-purple-900 to-pink-800 p-4 border-t-4 border-purple-400 flex-shrink-0">
                <div className="max-w-md mx-auto">
                  <button
                    onClick={() => {
                      // Close Room 7 Day and open Peephole view
                      closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7);
                      openWindow({
                        key: "paradise-motel-room-7-peephole",
                        window: (
                          <DraggableResizeableWindow
                            windowsId="paradise-motel-room-7-peephole"
                            headerTitle="Paradise Motel - Room 7 (Peephole)"
                            onClose={() => closeWindow("paradise-motel-room-7-peephole")}
                            initialWidth="80vw"
                            initialHeight="80vh"
                            resizable={true}
                          >
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                              <img
                                src="/images/locations/paradise motel/room-7-peep.png"
                                alt="Paradise Motel Room 7 Peephole View"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                                }}
                              />
                            </div>
                          </DraggableResizeableWindow>
                        ),
                      });
                    }}
                    className="w-full bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-6 py-4 rounded-lg border-3 border-amber-400 hover:border-amber-300 transition-all duration-300 hover:scale-105 text-center text-lg font-black shadow-lg"
                    style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                  >
                    �️ Peephole
                  </button>
                </div>
              </div>
            </div>
          </DraggableResizeableWindow>
        ),
      });
    } else {
      // NIGHT TIME: Check if user has the key from the maid first
      if (!effectiveWallet?.address) {
        // No wallet - show day image with police tape (locked)
        openWindow({
          key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
          window: (
            <DraggableResizeableWindow
              windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
              headerTitle="Paradise Motel - Room 7"
              onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
              initialWidth="80vw"
              initialHeight="80vh"
              resizable={true}
            >
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src="/images/locations/paradise motel/room-7-day.png"
                  alt="Paradise Motel Room 7 (Locked)"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/backdrops/BLANK.png";
                  }}
                />
              </div>
            </DraggableResizeableWindow>
          ),
        });
        return;
      }

      // Check if user has obtained the Room 7 key
      let hasKey = false;
      
      try {
        const response = await fetch(`/api/check-room7-key?walletAddress=${effectiveWallet.address}`);
        const data = await response.json();
        hasKey = data.success && data.hasKey;
      } catch (error) {
        console.error('Failed to check Room 7 key:', error);
      }
        
      if (!hasKey) {
          // User doesn't have the key - show day image with police tape (locked)
          openWindow({
            key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
                headerTitle="Paradise Motel - Room 7"
                onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
                initialWidth="80vw"
                initialHeight="80vh"
                resizable={true}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img
                    src="/images/locations/paradise motel/room-7-day.png"
                    alt="Paradise Motel Room 7 (Locked)"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/backdrops/BLANK.png";
                    }}
                  />
                </div>
              </DraggableResizeableWindow>
            ),
          });
          return;
        }

        console.log('✅ User has Room 7 key, granting access');
        // User has the key! Open the cutscene
        openWindow({
          key: WINDOW_IDS.STORY_MANUAL,
          window: (
            <StoryManual 
              autoPlayChapterId="paradise-motel" 
              onClose={() => closeWindow(WINDOW_IDS.STORY_MANUAL)}
            />
          ),
        });
    }
  };

  // Function to ring the bell - Opens interactive bell component
  const ringBell = () => {
    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_1,
      window: (
        <Room1BellComponent 
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_1)}
          wallet={effectiveWallet?.address}
        />
      ),
    });
  };

  // Function to open Lobby with 4 new buttons
  const openLobby = () => {
    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_LOBBY,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_LOBBY}
          headerTitle="Paradise Motel - Lobby"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_LOBBY)}
          initialWidth="900px"
          initialHeight="75vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Fullscreen Lobby Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src="/images/locations/paradise motel/lobby.png"
                alt="Paradise Motel Lobby"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Buttons Below Image - 4 in grid, 1 full width below */}
            <div className="w-full bg-gradient-to-r from-purple-900 to-pink-800 p-4 border-t-4 border-purple-400 shadow-2xl flex-shrink-0">
              {/* Top row: 4 buttons in grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-3">
                {/* Room 1 */}
                <button
                  onClick={openRoom1}
                  className="bg-gradient-to-br from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700 text-white px-3 py-3 rounded-lg border-3 border-amber-400 hover:border-amber-300 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🚪 Room 1
                </button>

                {/* Room 6 */}
                <button
                  onClick={openRoom6}
                  className="bg-gradient-to-br from-blue-700 to-indigo-900 hover:from-blue-600 hover:to-indigo-800 text-white px-3 py-3 rounded-lg border-3 border-blue-500 hover:border-blue-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  � Room 6
                </button>

                {/* Room 7 - Day/Night Behavior */}
                <button
                  onClick={openRoom7}
                  className="bg-gradient-to-br from-purple-800 to-pink-900 hover:from-purple-700 hover:to-pink-800 text-white px-3 py-3 rounded-lg border-3 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  {isDay ? '🌞' : '🌙'} Room 7
                </button>

                {/* Ring Bell */}
                <button
                  onClick={ringBell}
                  className="bg-gradient-to-br from-amber-700 to-red-900 hover:from-amber-600 hover:to-red-800 text-white px-3 py-3 rounded-lg border-3 border-amber-500 hover:border-amber-400 transition-all duration-300 hover:scale-105 text-center text-sm font-black shadow-lg whitespace-nowrap"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🔔 Ring Bell
                </button>
              </div>

              {/* Bottom row: Full width Semester Zero Collection Setup */}
              <div className="max-w-4xl mx-auto">
                <SetupCollectionButton 
                  wallet={effectiveWallet?.address}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open 'Round Back with PNG display
  const openRoundBack = () => {
    // Check time of day - 6 AM to 6 PM is day
    const now = new Date();
    const hour = now.getHours();
    
    // LOCALHOST BYPASS: Force daytime mode for testing
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const isDay = isLocalhost ? true : (hour >= 6 && hour < 18);
    
    if (!isDay) {
      // NIGHT: Show empty round back with trash and cigarettes (no maid)
      openWindow({
        key: "paradise-motel-round-back",
        window: (
          <DraggableResizeableWindow
            windowsId="paradise-motel-round-back"
            headerTitle="Paradise Motel - 'Round Back 🌙"
            onClose={() => closeWindow("paradise-motel-round-back")}
            initialWidth="auto"
            initialHeight="90vh"
            resizable={true}
          >
            <div className="relative h-full overflow-hidden flex flex-col md:flex-row justify-center items-center bg-black">
              <img
                src="/images/locations/paradise motel/night-round-back.png"
                alt="Paradise Motel 'Round Back at Night"
                className="w-full md:h-full md:w-auto object-contain"
                onError={(e) => {
                  // Fallback to day image if night image doesn't exist yet
                  e.currentTarget.src="/images/locations/paradise motel/daytime-round-back.png";
                }}
              />
              <div className="relative md:absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-gray-600 rounded p-6 max-w-md text-center">
                  <p className="text-white text-lg font-semibold">Nobody's here...</p>
                </div>
              </div>
            </div>
          </DraggableResizeableWindow>
        ),
      });
    } else {
      // DAY: Show maid dialogue
      openWindow({
        key: "paradise-motel-round-back",
        window: (
          <DraggableResizeableWindow
            windowsId="paradise-motel-round-back"
            headerTitle="Paradise Motel - 'Round Back"
            onClose={() => closeWindow("paradise-motel-round-back")}
            initialWidth="auto"
            initialHeight="90vh"
            resizable={true}
          >
            <div className="relative h-full overflow-hidden flex flex-col md:flex-row justify-center items-center bg-black">
              <img
                src="/images/locations/paradise motel/daytime-round-back.png"
                alt="Paradise Motel 'Round Back"
                className="w-full md:h-full md:w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
              {/* Desktop: Position right side, Mobile: Position below image */}
              <div className="relative md:absolute inset-0 flex items-end md:items-center justify-center md:justify-end md:pr-32 md:pb-8 p-4 md:p-0">
                <div className="md:mr-32 md:mt-16">
                  <MaidDialogue onClose={() => closeWindow("paradise-motel-round-back")} />
                </div>
              </div>
            </div>
          </DraggableResizeableWindow>
        ),
      });
    }
  };

  // Main component render
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Image Container - Expanded to fill more width */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-0">
        <img
          src={getCurrentBackground()}
          alt={`Paradise Motel Background - ${isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />
      </div>

      {/* Bottom Buttons - Compact with blue/orange gradient */}
      <div className="w-full bg-gradient-to-r from-cyan-600 via-blue-700 to-orange-600 p-4 border-t-4 border-orange-400 shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Lobby */}
          <button
            onClick={openLobby}
            className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-white px-6 py-3 rounded-xl border-4 border-orange-300 hover:border-orange-200 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🏨 Lobby
          </button>

          {/* 'Round Back */}
          <button
            onClick={openRoundBack}
            className="bg-gradient-to-br from-cyan-600 to-blue-800 hover:from-cyan-500 hover:to-blue-700 text-white px-6 py-3 rounded-xl border-4 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🌙 'Round Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParadiseMotelMain;
