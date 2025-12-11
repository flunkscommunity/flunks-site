import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import { useState, useEffect, useRef } from "react";
import FlappyFlunkWindow from "windows/Games/FlappyFlunkWindow";
import FlunkJumpWindow from "windows/Games/FlunkJumpWindow";
import FlunkyUppyArcadeWindow from "windows/Games/FlunkyUppyArcadeWindow";
import MultiColorText from "components/MultiColorText";
import { isFeatureEnabled } from "utils/buildMode";
import ZoltarFortuneWindow from "windows/ZoltarFortuneWindow";

const ArcadeMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Background music for arcade entrance
  const entranceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isEntranceMuted, setIsEntranceMuted] = useState(false);

  // Use the "Flunko missing" themed day/night images for Arcade
  const dayImage = "/images/locations/snow locations/arcade-day-snow.png";
  const nightImage = "/images/locations/snow locations/arcade-night-snow.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  // Initialize background music for arcade entrance
  useEffect(() => {
    if (!entranceAudioRef.current) {
      entranceAudioRef.current = new Audio('/music/arcade.mp3');
      entranceAudioRef.current.loop = true;
      entranceAudioRef.current.volume = 0.5; // 50% volume
      
      // Add error handling and preload
      entranceAudioRef.current.preload = 'auto';
      entranceAudioRef.current.addEventListener('error', (e) => {
        console.error('🎵 Arcade music failed to load:', e);
      });
      entranceAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('🎵 Arcade music loaded successfully');
      });
    }

    const playEntranceMusic = async () => {
      try {
        if (entranceAudioRef.current && !isEntranceMuted) {
          console.log('🎵 Attempting to play arcade entrance music...');
          await entranceAudioRef.current.play();
          console.log('🎵 Arcade entrance music playing');
        }
      } catch (error) {
        console.log('🎵 Entrance music autoplay blocked by browser:', error);
      }
    };

    playEntranceMusic();

    return () => {
      if (entranceAudioRef.current) {
        entranceAudioRef.current.pause();
        entranceAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (entranceAudioRef.current) {
      if (isEntranceMuted) {
        entranceAudioRef.current.pause();
      } else {
        entranceAudioRef.current.play().catch(console.log);
      }
    }
  }, [isEntranceMuted]);

  const openRoom = (roomKey: string, title: string, content: string) => {
    // Memphis-style colors for the text
    const memphisColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8E8', '#F7DC6F'];
    
    openWindow({
      key: roomKey,
      window: (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(500px, 95vw)',
            maxWidth: '500px',
            maxHeight: 'min(70vh, 600px)',
            minHeight: '300px',
            backgroundColor: '#1a1a1a',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #FF6B6B 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #4ECDC4 1px, transparent 1px),
              linear-gradient(45deg, transparent 40%, rgba(69, 183, 209, 0.1) 50%, transparent 60%),
              linear-gradient(-45deg, transparent 40%, rgba(150, 206, 180, 0.1) 50%, transparent 60%),
              radial-gradient(circle at 50% 50%, #FFEAA7 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 60px 60px, 80px 80px, 80px 80px, 30px 30px',
            backgroundPosition: '0 0, 20px 20px, 0 0, 40px 0, 10px 10px',
            border: '4px solid #FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Title */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 'clamp(8px, 4vw, 16px) clamp(12px, 5vw, 20px)',
            borderBottom: '3px solid #FFFFFF',
            textAlign: 'center',
            backgroundImage: 'linear-gradient(90deg, rgba(255,107,107,0.2) 0%, rgba(78,205,196,0.2) 50%, rgba(69,183,209,0.2) 100%)',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MultiColorText 
              text={`🎮 ${title}`}
              colors={memphisColors}
              fontSize="20px"
              fontFamily="'Press Start 2P', monospace"
            />
          </div>
          
          {/* Content */}
          <div style={{
            padding: 'clamp(12px, 6vw, 24px)',
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '0'
          }}>
            <div style={{ 
              maxWidth: '100%', 
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <MultiColorText 
                text={content}
                colors={memphisColors}
                fontSize="16px"
                fontFamily="'Press Start 2P', monospace"
              />
            </div>
          </div>
          
          {/* Close Button */}
          <div style={{
            padding: 'clamp(12px, 4vw, 16px) clamp(16px, 6vw, 24px)',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderTop: '2px solid rgba(255,255,255,0.3)'
          }}>
            <button
              onClick={() => closeWindow(roomKey)}
              style={{
                backgroundColor: '#FF6B6B',
                backgroundImage: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
                border: '3px solid #FFFFFF',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: 'clamp(8px, 3vw, 12px) clamp(16px, 6vw, 24px)',
                fontSize: 'clamp(10px, 3.5vw, 14px)',
                fontWeight: 'bold',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
                textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                minWidth: '80px',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(-2deg)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,107,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      ),
    });
  };

  const openSnackCorner = () => {
    const memphisColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8E8', '#F7DC6F'];
    
    openWindow({
      key: WINDOW_IDS.ARCADE_BOTTOM_LEFT,
      window: (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(600px, 95vw)',
            maxWidth: '600px',
            maxHeight: 'min(80vh, 700px)',
            minHeight: '400px',
            backgroundColor: '#1a1a1a',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #FF6B6B 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #4ECDC4 1px, transparent 1px),
              linear-gradient(45deg, transparent 40%, rgba(69, 183, 209, 0.1) 50%, transparent 60%),
              linear-gradient(-45deg, transparent 40%, rgba(150, 206, 180, 0.1) 50%, transparent 60%),
              radial-gradient(circle at 50% 50%, #FFEAA7 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 60px 60px, 80px 80px, 80px 80px, 30px 30px',
            backgroundPosition: '0 0, 20px 20px, 0 0, 40px 0, 10px 10px',
            border: '4px solid #FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Title */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 'clamp(8px, 4vw, 16px) clamp(12px, 5vw, 20px)',
            borderBottom: '3px solid #FFFFFF',
            textAlign: 'center',
            backgroundImage: 'linear-gradient(90deg, rgba(255,107,107,0.2) 0%, rgba(78,205,196,0.2) 50%, rgba(69,183,209,0.2) 100%)',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MultiColorText 
              text="🍿 Snack Corner"
              colors={memphisColors}
              fontSize="20px"
              fontFamily="'Press Start 2P', monospace"
            />
          </div>
          
          {/* Content */}
          <div style={{
            padding: 'clamp(12px, 6vw, 24px)',
            flex: 1,
            overflow: 'auto',
            textAlign: 'center',
            minHeight: '0'
          }}>
            <div style={{ 
              marginBottom: 'clamp(12px, 5vw, 20px)',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              <MultiColorText 
                text="SUGAR RUSH PARADISE! Cotton candy machines spin pink and blue clouds!"
                colors={memphisColors}
                fontSize="14px"
                fontFamily="'Press Start 2P', monospace"
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <MultiColorText 
                text="Popcorn kernels POP POP POP in symphony! Soda fountains bubble with rainbow fizz! Giant pretzels twist like golden sculptures!"
                colors={memphisColors}
                fontSize="12px"
                fontFamily="'Press Start 2P', monospace"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <MultiColorText 
                text="The sweet aroma of victory and nachos fills the air! Candy machines glow like neon beacons calling to hungry gamers!"
                colors={['#DDA0DD', '#98D8E8', '#F7DC6F', '#FF6B6B']}
                fontSize="11px"
                fontFamily="'Press Start 2P', monospace"
              />
            </div>
          </div>
          
          {/* Close Button */}
          <div style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderTop: '2px solid rgba(255,255,255,0.3)'
          }}>
            <button
              onClick={() => closeWindow(WINDOW_IDS.ARCADE_BOTTOM_LEFT)}
              style={{
                backgroundColor: '#FF6B6B',
                backgroundImage: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
                border: '3px solid #FFFFFF',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
                textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(-2deg)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,107,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      ),
    });
  };

  // Arcade Lobby Component with background music and all activities
  const ArcadeLobby = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Initialize background music when lobby opens
    useEffect(() => {
      if (!audioRef.current) {
        audioRef.current = new Audio('/music/arcade.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3; // 30% volume
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

    const toggleMute = () => {
      setIsMuted(!isMuted);
    };

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/images/arcade/arcade-lobby.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Music Control */}
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            zIndex: 100,
            fontSize: '18px'
          }}
        >
          {isMuted ? "🔇" : "🎵"}
        </button>

        {/* Wizard's Arcade Title - Positioned at top */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(10px, 3vw, 20px)',
          fontFamily: "'Press Start 2P', monospace",
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '900px'
        }}>
          <div style={{
            color: '#E0E0E0',
            fontSize: 'clamp(6px, 2vw, 16px)',
            fontWeight: 'normal',
            marginBottom: 'clamp(4px, 1.5vw, 12px)',
            letterSpacing: 'clamp(0.5px, 0.3vw, 4px)',
            textTransform: 'uppercase',
            opacity: 0.9,
            fontFamily: "'Courier New', monospace"
          }}>
            WELCOME TO THE
          </div>
          <div style={{
            background: 'linear-gradient(45deg, #FFD700, #FF1493, #00CED1, #FFD700)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(14px, 4vw, 48px)',
            fontWeight: 'bold',
            textShadow: '3px 3px 0px #000, -2px -2px 0px rgba(255,215,0,0.3)',
            letterSpacing: 'clamp(0.5px, 0.2vw, 3px)',
            animation: 'shimmer 3s linear infinite',
            filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
            wordBreak: 'break-word',
            hyphens: 'auto',
            lineHeight: '1.2'
          }}>
            WIZARD'S ARCADE
          </div>
        </div>

        {/* All Buttons - Two rows: locations on top, games on bottom */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#000000',
          padding: 'clamp(10px, 3vw, 20px)',
          paddingTop: 'clamp(120px, 25vw, 150px)',
          borderTop: '3px solid #FFD700',
          boxShadow: '0 -5px 20px rgba(0,0,0,0.8)'
        }}>
          {/* Top Row - Location Buttons (4 buttons) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))',
            gap: 'clamp(8px, 2vw, 12px)',
            maxWidth: '1000px',
            margin: '0 auto 12px auto'
          }}>
          {/* Front Area */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.ARCADE_TOP_LEFT,
                "Front Area",
                "By Saturday morning, the gym was ready for a night to remember. Streamers hung from the rafters, disco balls cast dancing lights across the polished floor, and everything was perfect for homecoming.\n\nBut by midday, the announcement came: the dance was off. No one gave a reason, just murmurs about a situation still unfolding. Nobody knew for sure what was happening — only that it wasn\'t good.\n\nThe lights stayed on, the decorations hung in silence, and the dance floor never saw a single step. The mystery of what happened that day still echoes through these empty halls."
              )
            }
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            Front Area
          </button>

          {/* Prize Booth */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.ARCADE_TOP_RIGHT,
                "Prize Booth",
                "STUFFED ANIMALS EVERYWHERE! Giant teddy bears and rainbow unicorns hang from every hook! Claw machines filled with mysterious treasures! Spinning wheels of fortune! Tickets cascade like confetti from redemption games! The prize master watches with knowing eyes!"
              )
            }
            style={{
              background: 'linear-gradient(45deg, #FFD700, #FF69B4)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            Prize Booth
          </button>

          {/* Snack Corner */}
          <button
            onClick={openSnackCorner}
            style={{
              background: 'linear-gradient(45deg, #96CEB4, #FFEAA7)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            Snack Corner
          </button>

          {/* Back Room */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.ARCADE_BOTTOM_RIGHT,
                "Back Room",
                "FORBIDDEN ZONE! A mysterious door marked EMPLOYEES ONLY! What secrets lie beyond? Rumors speak of prototype games never released! The door handle is warm to the touch! Strange electronic sounds echo from within! Do you dare to discover what\'s hidden?"
              )
            }
            style={{
              background: 'linear-gradient(45deg, #8B008B, #4B0082)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            Back Room
          </button>
          </div>

          {/* Bottom Row - Game Buttons (3 buttons) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))',
            gap: 'clamp(8px, 2vw, 12px)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
          {/* Flappy Flunk Game */}
          <button
            onClick={() => {
              // Stop lobby music when opening game
              if (audioRef.current) {
                audioRef.current.pause();
              }
              openWindow({
                key: WINDOW_IDS.FLAPPY_FLUNK,
                window: (
                  <DraggableResizeableWindow
                    windowsId={WINDOW_IDS.FLAPPY_FLUNK}
                    onClose={() => closeWindow(WINDOW_IDS.FLAPPY_FLUNK)}
                    headerTitle="Flappy Flunk"
                    initialWidth="480px"
                    initialHeight="640px"
                    headerIcon="/images/icons/flappyflunk.png"
                  >
                    <FlappyFlunkWindow />
                  </DraggableResizeableWindow>
                ),
              });
            }}
            style={{
              background: 'linear-gradient(45deg, #9370DB, #8A2BE2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            FLAPPY FLUNK
          </button>
          
          {/* Flunky Uppy Game */}
          <button
            onClick={() => {
              // Stop lobby music when opening game
              if (audioRef.current) {
                audioRef.current.pause();
              }
              openWindow({
                key: WINDOW_IDS.FLUNKY_UPPY,
                window: (
                  <DraggableResizeableWindow
                    windowsId={WINDOW_IDS.FLUNKY_UPPY}
                    onClose={() => closeWindow(WINDOW_IDS.FLUNKY_UPPY)}
                    headerTitle="Flunky Uppy"
                    initialWidth="420px"
                    initialHeight="720px"
                    headerIcon="/images/icons/flunky-uppy-icon.png?v=2"
                  >
                    <FlunkJumpWindow />
                  </DraggableResizeableWindow>
                ),
              });
            }}
            style={{
              background: 'linear-gradient(45deg, #FF4500, #FF6347)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: 'clamp(10px, 2.5vw, 15px)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Press Start 2P', monospace",
              width: '100%',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            FLUNKY UPPY
          </button>

          {/* Mystical Zoltar Fortune Machine */}
          <button
              onClick={() => {
                // Stop lobby music when opening game
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                openWindow({
                  key: WINDOW_IDS.ZOLTAR_FORTUNE_APP,
                  window: (
                    <ZoltarFortuneWindow />
                  ),
                });
              }}
              style={{
                background: 'linear-gradient(45deg, #8B4513, #CD853F)',
                color: '#FFD700',
                border: '2px solid #FFD700',
                borderRadius: '8px',
                padding: 'clamp(10px, 2.5vw, 15px)',
                fontSize: 'clamp(10px, 2.5vw, 14px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'Press Start 2P', monospace",
                boxShadow: '0 0 15px rgba(255,215,0,0.5)',
                width: '100%',
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              ZOLTAR
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create lobby function 
  const openLobby = () => {
    openWindow({
      key: WINDOW_IDS.ARCADE_LOBBY,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.ARCADE_LOBBY}
          onClose={() => closeWindow(WINDOW_IDS.ARCADE_LOBBY)}
          headerTitle="🧙‍♂️ Wizard's Arcade Lobby"
          headerIcon="/images/icons/arcade-day-snow.png"
          initialWidth="1050px"
          initialHeight="800px"
          resizable={true}
        >
          <ArcadeLobby />
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="flex flex-col items-center w-full px-4 md:px-0" style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Image Section */}
      <div className="relative w-full flex-shrink-0">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Arcade Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="block object-contain w-full h-auto z-0 transition-opacity duration-500"
          style={{ maxHeight: '750px' }}
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 z-1 transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-purple-900 bg-opacity-20' 
              : 'bg-yellow-100 bg-opacity-5'
          }`}
        />

        {/* Time Info Display */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
          {timeBasedInfo.currentTime}
        </div>
      </div>

      {/* Single Enter Button - Positioned below image */}
      <div className="bg-gray-800 p-3 w-full flex-shrink-0" style={{ maxWidth: '1050px' }}>
        <div className="flex justify-center">
          <button
            onClick={async () => {
              // Pause entrance music specifically
              if (entranceAudioRef.current) {
                entranceAudioRef.current.pause();
              }
              
              // Pause any other currently playing music for better audio experience
              const allAudioElements = document.querySelectorAll('audio');
              const pausedAudios: HTMLAudioElement[] = [];
              
              // Store currently playing audio and pause them
              allAudioElements.forEach(audio => {
                if (!audio.paused) {
                  pausedAudios.push(audio);
                  audio.pause();
                }
              });
              
              // Wait a brief moment for silence
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Play entrance sound effect
              const audio = new Audio('/music/enter.mp3');
              audio.volume = 0.7;
              
              try {
                await audio.play();
                
                // Wait for sound to finish, then resume music
                audio.addEventListener('ended', () => {
                  setTimeout(() => {
                    pausedAudios.forEach(pausedAudio => {
                      pausedAudio.play().catch(console.log);
                    });
                  }, 200);
                });
                
              } catch (error) {
                console.log('Audio play failed:', error);
                // Resume music immediately if sound fails
                setTimeout(() => {
                  pausedAudios.forEach(pausedAudio => {
                    pausedAudio.play().catch(console.log);
                  });
                }, 200);
              }
              
              // Open the lobby
              openLobby();
            }}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 text-white px-6 md:px-8 py-4 rounded-lg hover:from-purple-500 hover:via-blue-500 hover:to-purple-700 transition-all duration-300 hover:scale-105 text-center font-bold border-4 border-yellow-300 shadow-2xl relative overflow-hidden w-full max-w-[600px]"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              boxShadow: '0 12px 35px rgba(138,43,226,0.8), inset 0 0 25px rgba(255,255,255,0.3)',
              fontSize: '18px',
              fontFamily: "'Press Start 2P', monospace",
              padding: '16px 24px'
            }}
          >
            🧙‍♂️ ENTER WIZARD'S ARCADE 🧙‍♂️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArcadeMain;
