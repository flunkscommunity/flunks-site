import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button, Panel, Separator } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import UnifiedConnectButton from "../components/UnifiedConnectButton";
import WalletConnectionModal from "../components/WalletConnectionModal";
import { useAuth } from "contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import ItemsGrid from "components/YourItems/ItemsGrid";
import { useDemoModeOptional, isDemoPlatform } from "contexts/DemoModeContext";
import { isMobileApp } from "utils/buildMode";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const auth = useAuth();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Demo mode support for iOS App Store review (iOS only)
  const demoMode = useDemoModeOptional();
  const isDemoMode = isDemoPlatform() && (demoMode?.isDemoMode || false);
  
  // Destructure auth context for easier use
  const {
    isAuthenticated,
    isWalletConnected,
    walletAddress,
    flunksCount,
    hasFlunks,
    isLoading,
    user,
    primaryWallet,
    getAuthStatus
  } = auth;

  // Check if Dynamic Context is still initializing - use auth context loading state
  const showLoadingState = isLoading && !isDemoMode;
  
  // In demo mode, treat as authenticated
  const effectivelyAuthenticated = isDemoMode || isAuthenticated;

  // Intro effect - play sound and show black screen
  // Optimized for Capacitor native iOS/Android apps
  useEffect(() => {
    if (showIntro && effectivelyAuthenticated && !isLoading) {
      const isNative = isMobileApp();
      
      // Create audio element with Capacitor/native-optimized settings
      const audio = new Audio();
      // In Capacitor apps, audio files are served from the app bundle
      // The path works the same as web since Capacitor serves from webDir
      audio.src = '/audio/onlyflunks-noise.mp3';
      audio.volume = 0.5;
      
      // iOS WebView / Capacitor specific settings
      audio.playsInline = true;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      
      // For Capacitor iOS, we need to load the audio first
      audio.load();
      audioRef.current = audio;
      
      // Play audio function with native app handling
      const playAudio = async () => {
        if (audioRef.current) {
          try {
            // On native apps, audio usually plays without restriction after load
            await audioRef.current.play();
          } catch (e) {
            // Silent fail - audio is optional for the intro effect
            if (!isNative) {
              console.log('Audio autoplay blocked:', e);
            }
          }
        }
      };
      
      // For native apps, wait for audio to be ready then play
      if (isNative) {
        audio.addEventListener('canplaythrough', () => playAudio(), { once: true });
      } else {
        // Web fallback - attempt autoplay
        playAudio();
      }
      
      // Fallback: try playing on any touch/click event (for web browsers)
      const handleUserInteraction = () => {
        playAudio();
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
      
      if (!isNative) {
        document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
        document.addEventListener('click', handleUserInteraction, { once: true });
      }
      
      // Start fade out after 1.5 seconds
      const fadeTimer = setTimeout(() => {
        setIntroFading(true);
      }, 1500);
      
      // Hide intro after fade completes (2 seconds total)
      const hideTimer = setTimeout(() => {
        setShowIntro(false);
        // Stop and cleanup audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      }, 2000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
        if (!isNative) {
          document.removeEventListener('touchstart', handleUserInteraction);
          document.removeEventListener('click', handleUserInteraction);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      };
    }
  }, [showIntro, effectivelyAuthenticated, isLoading]);

  // Show wallet modal when not authenticated and not loading (but not in demo mode)
  useEffect(() => {
    if (!isLoading && !effectivelyAuthenticated) {
      setShowWalletModal(true);
    } else {
      setShowWalletModal(false);
    }
  }, [isLoading, effectivelyAuthenticated]);

  // If not authenticated and not loading (and not demo mode), only show the modal (no window)
  if (!isLoading && !effectivelyAuthenticated) {
    return (
      <>
        <AndroidOptimizations />
        {showWalletModal && (
          <WalletConnectionModal 
            onClose={() => {
              setShowWalletModal(false);
              closeWindow(WINDOW_IDS.FLUNKS_HUB);
            }} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <AndroidOptimizations />
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks"
        windowsId={WINDOW_IDS.FLUNKS_HUB}
        onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
        initialWidth="900px"
        initialHeight="700px"
        headerIcon="/images/icons/onlyflunks.png"
      >
        {/* Intro screen - black with noise effect, mobile-optimized */}
        {showIntro && effectivelyAuthenticated && !isLoading && (
          <div 
            className={`absolute inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${introFading ? 'opacity-0' : 'opacity-100'}`}
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
              // Mobile-safe properties
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
            // Allow tap to skip on mobile
            onClick={() => {
              setIntroFading(true);
              setTimeout(() => setShowIntro(false), 500);
            }}
          >
            <div className="text-center animate-pulse select-none">
              <div className="text-4xl mb-4" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>📺</div>
              <div 
                className="text-white tracking-widest" 
                style={{ 
                  fontFamily: "'Press Start 2P', monospace", 
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                  fontSize: 'clamp(0.6rem, 3vw, 0.875rem)',
                }}
              >
                ONLYFLUNKS
              </div>
              {/* Tap to skip hint for mobile */}
              <div 
                className="text-white/50 mt-6 animate-bounce"
                style={{ 
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 'clamp(0.4rem, 2vw, 0.5rem)',
                }}
              >
                TAP TO SKIP
              </div>
            </div>
          </div>
        )}

        <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-4">
          {showLoadingState ? (
            // Windows 95 style loading screen
            <div className="w-full h-full flex flex-col items-center justify-center gap-6" 
                 style={{ 
                   background: 'linear-gradient(135deg, #008080 0%, #20b2aa 50%, #008080 100%)',
                   color: 'white'
                 }}>
              <Panel variant="outside" className="p-6 bg-gray-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-4xl animate-pulse">💾</div>
                  <div className="text-lg font-bold">OnlyFlunks™ System</div>
                  <div className="text-sm">Initializing wallet interface...</div>
                  <div className="w-48 h-4 bg-gray-300 border-2 border-gray-600" style={{ borderStyle: 'inset' }}>
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs opacity-70">Please wait...</div>
                </div>
              </Panel>
            </div>
          ) : (
            // Show OnlyFlunks content when authenticated - Use the retro ItemsGrid component
            <ItemsGrid />
          )}
        </Frame>
      </DraggableResizeableWindow>
    </>
  );
};

export default Onlyflunks;
