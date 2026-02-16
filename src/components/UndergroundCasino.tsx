import { useState, useEffect, useRef } from 'react';
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import { useGum } from 'contexts/GumContext';
import VideoPokerBattleTested from "components/games/VideoPokerBattleTested";
import Blackjack from "components/games/Blackjack";
import ScratchCard from "components/games/ScratchCard";
import SlotsGame from "components/games/SlotsGame";
import { useDemoModeOptional, isDemoPlatform } from 'contexts/DemoModeContext';

interface UndergroundCasinoProps {
  onClose?: () => void;
}

/**
 * Standalone Underground Casino component
 * Used by both the desktop Underground app and the 4 Thieves Bar in Semester Zero
 */
const UndergroundCasino: React.FC<UndergroundCasinoProps> = ({ onClose }) => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const { balance: gumBalance, updateBalance } = useGum();
  
  // Demo mode support for App Store / Play Store review
  const demoMode = useDemoModeOptional();
  const isDemoMode = isDemoPlatform() && (demoMode?.isDemoMode || false);
  
  // Use demo values in demo mode
  const walletAddress = isDemoMode ? demoMode?.demoWalletAddress : (unifiedAddress || primaryWallet?.address);
  const effectiveBalance = isDemoMode ? (demoMode?.demoBalance || 1000) : gumBalance;

  const [isUndergroundMuted, setIsUndergroundMuted] = useState(false);
  const undergroundAudioRef = useRef<HTMLAudioElement | null>(null);

  // Start Underground music on mount
  useEffect(() => {
    if (!undergroundAudioRef.current) {
      undergroundAudioRef.current = new Audio('/music/underground.mp3');
      undergroundAudioRef.current.loop = true;
      undergroundAudioRef.current.volume = 0.3;
    }
    
    undergroundAudioRef.current.play().catch(console.log);
    
    // Cleanup on unmount
    return () => {
      if (undergroundAudioRef.current) {
        undergroundAudioRef.current.pause();
        undergroundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle mute toggle
  useEffect(() => {
    if (undergroundAudioRef.current) {
      if (isUndergroundMuted) {
        undergroundAudioRef.current.pause();
      } else {
        undergroundAudioRef.current.play().catch(console.log);
      }
    }
  }, [isUndergroundMuted]);

  // Callback when games update balance
  const handleBalanceUpdate = (newBalance: number) => {
    if (isDemoMode && demoMode) {
      // In demo mode, update demo balance
      demoMode.updateDemoBalance(newBalance);
      console.log(`🎮 Demo Underground game balance update: ${newBalance}`);
    } else {
      updateBalance(newBalance);
      console.log(`🎰 Underground game balance update: ${newBalance}`);
    }
  };

  // Open Slot Machine
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

  // Open Video Poker
  const openVideoPoker = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    openWindow({
      key: WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_VIDEO_POKER}
          headerTitle="🃏 Jacks or Better - The Underground"
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

  // Open Blackjack
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

  const handleClose = () => {
    // Stop music
    if (undergroundAudioRef.current) {
      undergroundAudioRef.current.pause();
      undergroundAudioRef.current.currentTime = 0;
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
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
          onClick={() => setIsUndergroundMuted(!isUndergroundMuted)}
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

          {/* Video Poker */}
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

          {/* Leave */}
          <button
            onClick={handleClose}
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
            💰 GUM: {effectiveBalance}{isDemoMode && ' (Demo)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UndergroundCasino;
