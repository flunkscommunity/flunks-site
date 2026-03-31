import React, { useEffect, useRef, useState } from 'react';
import { useRadio } from '../../../contexts/RadioContext';

// Declare global PoolGameLoader type
declare global {
  interface Window {
    PoolGameLoader: any;
    Game: any;
    GAME_STOPPED: boolean;
    Canvas2D: {
      resize: () => void;
      _canvas: HTMLCanvasElement;
      _div: HTMLElement;
    };
    PoolStick: {
      lockAim: () => void;
      unlockAim: () => void;
      increasePower: () => void;
      decreasePower: () => void;
      getPower: () => number;
      getMaxPower: () => number;
      isAimLocked: () => boolean;
      canShoot: () => boolean;
      executeShot: () => void;
      aimLocked: boolean;
      power: number;
    };
  }
}

interface PoolGameProps {
  walletAddress?: string;
  gumBalance: number;
  onGumChange: (amount: number) => void;
  onStopBarMusic?: () => void;
  onClose?: () => void;
}

// Opponent data
interface OpponentStat {
  label: string;
  value: number;
}

interface Opponent {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  title: string;
  avatar: string;
  stats: [OpponentStat, OpponentStat, OpponentStat];
  bio: string;
  unlocked: boolean;
}

const OPPONENTS: Opponent[] = [
  {
    id: 'easy',
    name: 'GLASS JOE',
    title: 'The Bar Fly',
    avatar: '/Games/pool-game/sprites/opponent-easy.png',
    stats: [
      { label: 'Balance', value: 10 },
      { label: 'Back Pain', value: 95 },
      { label: 'Stank', value: 95 },
    ],
    bio: "They call me Glass Joe 'cuz I'm fixin' to break my hip if I ain't careful.",
    unlocked: true,
  },
  {
    id: 'medium',
    name: 'THE WIZARD',
    title: 'The Enchanter',
    avatar: '/Games/pool-game/sprites/opponent-medium.png',
    stats: [
      { label: 'Magic', value: 5 },
      { label: 'Virginity', value: 100 },
      { label: 'Friends', value: 5 },
    ],
    bio: "Careful or I'll make your balls disappear.",
    unlocked: false,
  },
  {
    id: 'hard',
    name: 'RUG DR',
    title: 'The Hustler',
    avatar: '/Games/pool-game/sprites/opponent-hard.png',
    stats: [
      { label: 'Kindness', value: 100 },
      { label: 'Skill', value: 100 },
      { label: 'Vibes', value: 100 },
    ],
    bio: "I'll sweep you right under the rug.",
    unlocked: false,
  },
];

const PoolGame: React.FC<PoolGameProps> = ({ walletAddress, gumBalance, onGumChange, onStopBarMusic, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderScriptRef = useRef<HTMLScriptElement | null>(null);
  
  // Pool music (plays during actual gameplay)
  const poolMusicRef = useRef<HTMLAudioElement | null>(null);
  
  // Bar background music (4thieves.mp3) — managed here for iOS compatibility
  // iOS requires audio.play() to be called from a direct user gesture
  const barMusicRef = useRef<HTMLAudioElement | null>(null);
  
  // Radio/music control
  const { audioRef: radioAudioRef, isPlaying: radioIsPlaying, setIsPlaying: setRadioIsPlaying } = useRadio();
  const wasRadioPlayingRef = useRef(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Control UI state
  const [aimLocked, setAimLocked] = useState(false);
  const [currentPower, setCurrentPower] = useState(0);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [aiColor, setAiColor] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'select' | 'character' | 'tutorial' | 'intro' | 'playing' | 'itemUnlock' | 'gameover'>('start');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [matchbookAwarded, setMatchbookAwarded] = useState(false);
  const matchbookRecordedRef = useRef(false);
  
  // Helper: start bar background music (must be called from a user gesture on iOS)
  const startBarMusic = () => {
    if (!barMusicRef.current) {
      barMusicRef.current = new Audio('/music/4thieves.mp3');
      barMusicRef.current.loop = false;
      barMusicRef.current.volume = 1.0;
      // Loop at 60 seconds like FourThievesBarMain
      barMusicRef.current.addEventListener('timeupdate', () => {
        if (barMusicRef.current && barMusicRef.current.currentTime >= 60) {
          barMusicRef.current.currentTime = 0;
          barMusicRef.current.play().catch(console.log);
        }
      });
    }
    barMusicRef.current.currentTime = 2; // Skip initial silence
    barMusicRef.current.play().catch(err => console.log('Bar music play failed:', err));
    console.log('🎵 Bar music started from PoolGame (iOS-compatible)');
  };

  const stopBarMusic = () => {
    if (barMusicRef.current) {
      barMusicRef.current.pause();
      barMusicRef.current.currentTime = 0;
    }
  };

  // Stop bar music when game starts playing (pool-music takes over) or component unmounts
  useEffect(() => {
    if (gameState === 'intro' || gameState === 'playing') {
      stopBarMusic();
    }
    return () => { stopBarMusic(); };
  }, [gameState]);

  // Stop radio music when entering intro/playing and restore on unmount
  useEffect(() => {
    if (gameState === 'intro' || gameState === 'playing') {
      // Remember if radio was playing so we can restore it later
      if (radioIsPlaying) {
        wasRadioPlayingRef.current = true;
        setRadioIsPlaying(false);
        if (radioAudioRef.current) {
          radioAudioRef.current.pause();
        }
      }
    }
  }, [gameState]);

  // Stop bar music when cutscene (intro) starts, start pool music when game starts
  useEffect(() => {
    if (gameState === 'intro') {
      // Cut off the 4thieves bar music — the cutscene video has its own audio
      onStopBarMusic?.();
      // Make sure pool music isn't playing during cutscene
      if (poolMusicRef.current) {
        poolMusicRef.current.pause();
        poolMusicRef.current.currentTime = 0;
      }
    } else if (gameState === 'playing') {
      // Start pool-music.mp3 on loop at 50% volume
      if (!poolMusicRef.current) {
        poolMusicRef.current = new Audio('/music/pool-music.mp3');
        poolMusicRef.current.loop = true;
        poolMusicRef.current.volume = 0.5;
      }
      poolMusicRef.current.currentTime = 0;
      poolMusicRef.current.play().catch(console.log);
      console.log('🎶 Pool music started (50% volume, looping)');
    } else if (gameState === 'gameover' || gameState === 'itemUnlock' || gameState === 'select' || gameState === 'start') {
      // Stop pool music when game ends or returns to menu
      if (poolMusicRef.current) {
        poolMusicRef.current.pause();
        poolMusicRef.current.currentTime = 0;
      }
    }
  }, [gameState, onStopBarMusic]);

  // Start ambient bar audio during playing state
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'intro') {
      // Try to play ambient bar chatter if available
      if (!ambientAudioRef.current) {
        const audio = new Audio('/Games/pool-game/sounds/bar-ambience.mp3');
        audio.loop = true;
        audio.volume = 0.15;
        ambientAudioRef.current = audio;
      }
      ambientAudioRef.current.play().catch(() => {
        // Audio play failed (no user interaction yet or file missing), ignore
      });
    } else {
      // Stop ambient when not playing
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }
    }
  }, [gameState]);

  // Restore radio music on unmount
  useEffect(() => {
    return () => {
      // Stop ambient audio
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      // Stop pool music
      if (poolMusicRef.current) {
        poolMusicRef.current.pause();
        poolMusicRef.current = null;
      }
      // Restore radio if it was playing before
      if (wasRadioPlayingRef.current && radioAudioRef.current) {
        setRadioIsPlaying(true);
        radioAudioRef.current.play().catch(() => {});
      }
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🎱 [PoolGame] Component mounted');
    return () => console.log('🎱 [PoolGame] Component UNMOUNTING!');
  }, []);

  useEffect(() => {
    console.log('🎱 [PoolGame] gameState changed to:', gameState);
  }, [gameState]);
  
  // Unlock state (persisted in localStorage)
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>(['easy']);
  
  useEffect(() => {
    const saved = localStorage.getItem('pool-unlocked');
    if (saved) {
      setUnlockedLevels(JSON.parse(saved));
    }
  }, []);

  // Detect mobile vs desktop - only Capacitor native apps count as mobile
  useEffect(() => {
    const checkMobile = () => {
      const isCapacitorApp = typeof window !== 'undefined' && 
        (window as any).Capacitor && 
        typeof (window as any).Capacitor.isNativePlatform === 'function' && 
        (window as any).Capacitor.isNativePlatform();
      setIsMobile(isCapacitorApp);
    };
    checkMobile();
  }, []);

  // Detect portrait orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  const unlockLevel = (level: string) => {
    if (!unlockedLevels.includes(level)) {
      const updated = [...unlockedLevels, level];
      setUnlockedLevels(updated);
      localStorage.setItem('pool-unlocked', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    // Load the game loader script
    if (!loaderScriptRef.current) {
      const script = document.createElement('script');
      script.src = '/Games/pool-game/game-loader.js';
      script.async = true;
      script.onload = () => {
        console.log('Pool game loader ready');
        setIsLoading(false);
      };
      document.head.appendChild(script);
      loaderScriptRef.current = script;
    }

    return () => {
      // Cleanup on unmount
      if (window.PoolGameLoader) {
        window.PoolGameLoader.cleanup();
      }
    };
  }, []);

  // Track if game has been initialized
  const gameInitializedRef = useRef(false);

  useEffect(() => {
    if (gameState === 'playing' && !isLoading && window.PoolGameLoader && !isPortrait) {
      // Add a small delay to ensure DOM is ready after orientation change
      const initTimer = setTimeout(() => {
        if (!gameInitializedRef.current) {
          console.log('🎱 Pool: Initializing game...');
          initializePoolGame();
          gameInitializedRef.current = true;
        } else {
          // Game already initialized, just trigger resize
          console.log('🎱 Pool: Game already initialized, triggering resize');
          if (window.Canvas2D && typeof window.Canvas2D.resize === 'function') {
            window.Canvas2D.resize();
          }
          window.dispatchEvent(new Event('resize'));
        }
      }, 150);
      return () => clearTimeout(initTimer);
    }
  }, [gameState, isLoading, isPortrait]);

  // Reset initialization flag when going back to menu
  useEffect(() => {
    if (gameState === 'start' || gameState === 'select') {
      gameInitializedRef.current = false;
    }
  }, [gameState]);

  // Trigger canvas resize when orientation changes to landscape while playing
  useEffect(() => {
    if (gameState === 'playing' && !isPortrait && !isLoading && gameInitializedRef.current) {
      // Give the DOM time to update, then trigger resize
      const resizeTimer = setTimeout(() => {
        if (window.Canvas2D && typeof window.Canvas2D.resize === 'function') {
          console.log('🎱 Pool: Triggering canvas resize after orientation change');
          window.Canvas2D.resize();
        }
        // Also dispatch a resize event for the game engine
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(resizeTimer);
    }
  }, [isPortrait, gameState, isLoading]);

  const initializePoolGame = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const containerId = 'pool-game-container';
    const canvasId = 'pool-game-canvas';
    
    containerRef.current.id = containerId;
    canvasRef.current.id = canvasId;

    // Initialize the game with the loader
    window.PoolGameLoader.init(
      containerId,
      canvasId,
      aiDifficulty,
      (winner: string) => {
        handleGameOver(winner === 'player' ? 'player' : 'ai');
      }
    );
  };

  const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log('🎱 [PoolGame] startGame called with difficulty:', difficulty);
    try {
      setAiDifficulty(difficulty);
      setPlayerScore(0);
      setAiScore(0);
      setWinner(null);
      console.log('🎱 [PoolGame] Setting gameState to tutorial');
      setGameState('tutorial');
      console.log('🎱 [PoolGame] State set to tutorial successfully');
    } catch (err) {
      console.error('🎱 [PoolGame] Error in startGame:', err);
    }
  };

  const startPlaying = () => {
    console.log('🎱 [PoolGame] startPlaying called, setting gameState to playing');
    setGameState('playing');
  };

  const handleGameOver = async (result: 'player' | 'ai') => {
    setWinner(result);
    // Unlock next level on win
    if (result === 'player') {
      if (aiDifficulty === 'easy') unlockLevel('medium');
      if (aiDifficulty === 'medium') unlockLevel('hard');

      // Special item unlock: beating The Wizard awards the matchbook
      if (aiDifficulty === 'medium' && !matchbookRecordedRef.current) {
        matchbookRecordedRef.current = true;
        // Record matchbook in database
        if (walletAddress) {
          try {
            await fetch('/api/record-pool-matchbook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ walletAddress })
            });
          } catch (err) {
            console.error('Failed to record matchbook:', err);
          }
        }
        setMatchbookAwarded(true);
        setGameState('itemUnlock');
        return;
      }
    }
    setGameState('gameover');
  };

  const returnToMenu = () => {
    setGameState('select');
    setSelectedOpponent(null);
    setWinner(null);
  };

  const selectOpponent = (opp: Opponent) => {
    setSelectedOpponent(opp);
    setGameState('character');
  };

  const isUnlocked = (id: string) => unlockedLevels.includes(id);

  // Poll game engine for score/turn/color updates
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      const g = (window as any).Game;
      if (g?.policy?.players) {
        setPlayerScore(g.policy.players[0].matchScore.value);
        setAiScore(g.policy.players[1].matchScore.value);
        setPlayerColor(g.policy.players[0].color || null);
        setAiColor(g.policy.players[1].color || null);
        setCurrentTurn(g.policy.turn);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [gameState]);

  // Pool controls: update power display periodically when aim is locked
  useEffect(() => {
    if (gameState === 'playing' && aimLocked) {
      const interval = setInterval(() => {
        if (window.PoolStick) {
          setCurrentPower(window.PoolStick.getPower());
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, aimLocked]);

  // Pool controls: reset aim lock when turn changes
  useEffect(() => {
    if (gameState === 'playing') {
      const checkTurn = setInterval(() => {
        if (window.PoolStick && !window.PoolStick.aimLocked && aimLocked) {
          setAimLocked(false);
          setCurrentPower(0);
        }
      }, 100);
      return () => clearInterval(checkTurn);
    }
  }, [gameState, aimLocked]);

  const handleLockAim = () => {
    if (window.PoolStick) {
      window.PoolStick.lockAim();
      setAimLocked(true);
    }
  };

  const handleUnlockAim = () => {
    if (window.PoolStick) {
      window.PoolStick.unlockAim();
      setAimLocked(false);
      setCurrentPower(0);
    }
  };

  const handleIncreasePower = () => {
    if (window.PoolStick) {
      window.PoolStick.increasePower();
      setCurrentPower(window.PoolStick.getPower());
    }
  };

  const handleDecreasePower = () => {
    if (window.PoolStick) {
      window.PoolStick.decreasePower();
      setCurrentPower(window.PoolStick.getPower());
    }
  };

  const handleShoot = () => {
    if (window.PoolStick && window.PoolStick.canShoot()) {
      window.PoolStick.executeShot();
      setAimLocked(false);
      setCurrentPower(0);
    }
  };

  // Start screen state for reveal animation
  const [startRevealed, setStartRevealed] = useState(false);
  
  useEffect(() => {
    if (gameState === 'start') {
      setStartRevealed(false);
      const timer = setTimeout(() => setStartRevealed(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  if (gameState === 'start') {
    return (
      <div className="pool-start-screen w-full h-full">
        {/* Background layer - fades in */}
        <div className={`pool-start-bg ${startRevealed ? 'revealed' : ''}`}>
          <picture>
            <source media="(max-aspect-ratio: 3/4)" srcSet="/Games/pool-game/sprites/start-portrait.png" />
            <img src="/Games/pool-game/sprites/start-bg.png" alt="" className="pool-start-bg-img" />
          </picture>
        </div>
        
        {/* Start button - centered, appears after reveal */}
        <button 
          onClick={() => { startBarMusic(); setGameState('select'); }} 
          className={`pool-start-btn ${startRevealed ? 'visible' : ''}`}
        >
          START GAME
        </button>
      </div>
    );
  }

  // Opponent select screen - with bar background
  if (gameState === 'select') {
    // Character image paths - will be GIFs for each difficulty
    const characterImages: Record<string, string> = {
      easy: '/Games/pool-game/sprites/character-easy.gif',
      medium: '/Games/pool-game/sprites/character-medium.gif', 
      hard: '/Games/pool-game/sprites/character-hard.gif',
    };

    return (
      <div 
        className="pool-select-screen w-full h-full flex text-white overflow-hidden relative" 
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {/* Background image - bar scene */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Games/pool-game/sprites/character-select-bg.png')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Desktop Layout */}
        <div className="relative z-10 w-full h-full hidden md:flex">
          {/* Left side - Opponent list */}
          <div className="w-64 flex flex-col bg-black/80 border-r-2 border-yellow-600/60 p-4 pt-5">
            <div 
              className="text-yellow-400 mb-4 text-center tracking-widest"
              style={{ 
                fontSize: '16px',
                textShadow: '0 0 10px rgba(234,179,8,0.6), 0 0 20px rgba(234,179,8,0.3)',
                letterSpacing: '6px',
              }}
            >SELECT</div>
            <div className="flex flex-col gap-1">
              {OPPONENTS.map((opp) => {
                const unlocked = isUnlocked(opp.id);
                const isSelected = selectedOpponent?.id === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => unlocked && setSelectedOpponent(opp)}
                    disabled={!unlocked}
                    className={`relative flex items-center gap-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'bg-yellow-600/40 text-yellow-400 border-l-4 border-yellow-400'
                        : unlocked
                        ? 'hover:bg-yellow-900/30 text-gray-300'
                        : 'opacity-30 cursor-not-allowed text-gray-600'
                    }`}
                  >
                    {isSelected && <span className="text-yellow-400 text-lg">▶</span>}
                    <div className={`${isSelected ? '' : 'ml-6'}`}>
                      <div 
                        className="uppercase tracking-wider"
                        style={{ 
                          fontSize: '14px',
                          textShadow: isSelected 
                            ? '0 0 8px rgba(234,179,8,0.5), 2px 2px 0 rgba(0,0,0,0.8)' 
                            : '2px 2px 0 rgba(0,0,0,0.8)',
                          letterSpacing: '2px',
                        }}
                      >{unlocked ? opp.name : '???'}</div>
                      <div 
                        className="text-gray-400 mt-1 italic"
                        style={{ fontSize: '10px', letterSpacing: '1px' }}
                      >{unlocked ? opp.title : ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div 
              className="mt-auto pt-6 text-center text-gray-500 leading-relaxed"
              style={{ fontSize: '9px', letterSpacing: '2px' }}
            >
              BEAT EACH TO<br/>UNLOCK NEXT
            </div>
          </div>
          
          {/* Right side - Character display with background */}
          <div className="flex-1 flex flex-col p-3">
            {selectedOpponent ? (
              <>
                {/* SNES-style pixel marquee banner */}
                <div className="text-center mb-1 flex justify-center">
                  <div className="relative inline-block">
                    {/* Outer border - dark edge */}
                    <div style={{
                      background: '#1a1a2e',
                      border: '4px solid #0a0a14',
                      padding: '4px',
                      imageRendering: 'pixelated' as any,
                    }}>
                      {/* Inner border - gold trim */}
                      <div style={{
                        border: '3px solid #c8a820',
                        background: 'linear-gradient(180deg, #2a1a3e 0%, #1a0a2e 40%, #0e0618 100%)',
                        padding: '8px 32px 6px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Corner diamonds */}
                        {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
                          <div key={pos} style={{
                            position: 'absolute',
                            width: '8px', height: '8px',
                            background: '#e8d040',
                            transform: 'rotate(45deg)',
                            ...(pos.includes('top') ? { top: '4px' } : { bottom: '4px' }),
                            ...(pos.includes('left') ? { left: '8px' } : { right: '8px' }),
                          }} />
                        ))}
                        {/* Top decorative pixel line */}
                        <div style={{
                          position: 'absolute', top: 0, left: '20px', right: '20px', height: '2px',
                          background: 'repeating-linear-gradient(90deg, #c8a820 0px, #c8a820 4px, transparent 4px, transparent 8px)',
                        }} />
                        {/* Bottom decorative pixel line */}
                        <div style={{
                          position: 'absolute', bottom: 0, left: '20px', right: '20px', height: '2px',
                          background: 'repeating-linear-gradient(90deg, #c8a820 0px, #c8a820 4px, transparent 4px, transparent 8px)',
                        }} />
                        {/* Glow effect behind text */}
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '80%', height: '80%',
                          background: 'radial-gradient(ellipse, rgba(232,208,64,0.15) 0%, transparent 70%)',
                        }} />
                        {/* Name */}
                        <div style={{
                          fontSize: '22px',
                          color: '#f0d848',
                          letterSpacing: '6px',
                          textShadow: '2px 2px 0 #805800, -1px -1px 0 #a07010, 0 0 12px rgba(240,216,72,0.4)',
                          position: 'relative',
                          lineHeight: '1.2',
                        }}>
                          {selectedOpponent.name}
                        </div>
                        {/* Separator dots */}
                        <div style={{
                          display: 'flex', justifyContent: 'center', gap: '6px',
                          margin: '6px 0 4px',
                        }}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} style={{
                              width: '3px', height: '3px',
                              background: i === 2 ? '#e8d040' : '#806020',
                            }} />
                          ))}
                        </div>
                        {/* Title */}
                        <div style={{
                          fontSize: '11px',
                          color: '#a8b8d0',
                          letterSpacing: '3px',
                          textShadow: '1px 1px 0 #000, 0 0 8px rgba(168,184,208,0.3)',
                          position: 'relative',
                        }}>
                          {selectedOpponent.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main area - character GIF display CENTERED */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <img 
                    src={characterImages[selectedOpponent.id]} 
                    alt={selectedOpponent.name}
                    className="object-contain drop-shadow-2xl"
                    style={{ 
                      imageRendering: 'pixelated',
                      maxHeight: '280px',
                      height: '100%',
                      filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.8))'
                    }}
                  />
                </div>
                
                {/* Stats and Quote at bottom */}
                <div className="mt-1 flex flex-col items-center">
                  {/* Stats - retro diagonal stripe bars */}
                  <div className="bg-[#0a1628]/95 p-3 border-2 border-[#1a3a5c] mb-2">
                    <div className="space-y-2">
                      {selectedOpponent.stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8ab4c4] w-24 text-right">{stat.label}</span>
                          {/* Bar container */}
                          <div className="relative w-32 h-3 bg-[#0a1628] border border-[#1a3a5c] overflow-hidden">
                            {/* Filled portion with diagonal stripes */}
                            <div 
                              className="absolute inset-y-0 left-0 h-full"
                              style={{ 
                                width: `${stat.value}%`,
                                background: `repeating-linear-gradient(
                                  -45deg,
                                  #4a9ead,
                                  #4a9ead 2px,
                                  #3a7a8a 2px,
                                  #3a7a8a 4px
                                )`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quote */}
                  <div className="text-[10px] text-gray-300 italic mb-2 bg-black/50 inline-block px-4 py-2 rounded" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    "{selectedOpponent.bio}"
                  </div>
                  
                  {/* Challenge button */}
                  <button
                    onClick={() => { stopBarMusic(); startGame(selectedOpponent.id); }}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all hover:scale-105 text-sm shadow-lg"
                  >
                    CHALLENGE →
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                ← SELECT OPPONENT
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout - Vertical Scroll */}
        <div className="relative z-10 w-full h-full flex flex-col md:hidden overflow-y-auto">
          {/* Opponent selector - horizontal scroll (extra top padding for iPhone safe area) */}
          <div className="flex-shrink-0 bg-black/80 p-3 pt-10 border-b border-yellow-600/50" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top, 0px))' }}>
            <div className="text-xs text-yellow-400 mb-2 text-center">SELECT OPPONENT</div>
            <div className="flex gap-2 justify-center">
              {OPPONENTS.map((opp) => {
                const unlocked = isUnlocked(opp.id);
                const isSelected = selectedOpponent?.id === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => unlocked && setSelectedOpponent(opp)}
                    disabled={!unlocked}
                    className={`px-3 py-2 rounded transition-all ${
                      isSelected
                        ? 'bg-yellow-600 text-black'
                        : unlocked
                        ? 'bg-black/50 text-gray-300 border border-yellow-600/30'
                        : 'opacity-30 cursor-not-allowed bg-black/30 text-gray-600'
                    }`}
                  >
                    <div className="text-[10px]">{unlocked ? opp.name : '???'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedOpponent ? (
            <div className="flex-1 flex flex-col items-center px-3 py-2 overflow-y-auto">
              {/* SNES-style pixel marquee banner - mobile */}
              <div className="text-center mb-2 flex justify-center w-full">
                <div className="relative inline-block">
                  <div style={{
                    background: '#1a1a2e',
                    border: '3px solid #0a0a14',
                    padding: '3px',
                    imageRendering: 'pixelated' as any,
                  }}>
                    <div style={{
                      border: '2px solid #c8a820',
                      background: 'linear-gradient(180deg, #2a1a3e 0%, #1a0a2e 40%, #0e0618 100%)',
                      padding: '10px 28px 8px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
                        <div key={pos} style={{
                          position: 'absolute',
                          width: '6px', height: '6px',
                          background: '#e8d040',
                          transform: 'rotate(45deg)',
                          ...(pos.includes('top') ? { top: '3px' } : { bottom: '3px' }),
                          ...(pos.includes('left') ? { left: '6px' } : { right: '6px' }),
                        }} />
                      ))}
                      <div style={{
                        position: 'absolute', top: 0, left: '16px', right: '16px', height: '2px',
                        background: 'repeating-linear-gradient(90deg, #c8a820 0px, #c8a820 4px, transparent 4px, transparent 8px)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: 0, left: '16px', right: '16px', height: '2px',
                        background: 'repeating-linear-gradient(90deg, #c8a820 0px, #c8a820 4px, transparent 4px, transparent 8px)',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%', height: '80%',
                        background: 'radial-gradient(ellipse, rgba(232,208,64,0.15) 0%, transparent 70%)',
                      }} />
                      <div style={{
                        fontSize: '16px',
                        color: '#f0d848',
                        letterSpacing: '4px',
                        textShadow: '2px 2px 0 #805800, -1px -1px 0 #a07010, 0 0 12px rgba(240,216,72,0.4)',
                        position: 'relative',
                        lineHeight: '1.2',
                      }}>
                        {selectedOpponent.name}
                      </div>
                      <div style={{
                        display: 'flex', justifyContent: 'center', gap: '4px',
                        margin: '4px 0 3px',
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} style={{
                            width: '2px', height: '2px',
                            background: i === 2 ? '#e8d040' : '#806020',
                          }} />
                        ))}
                      </div>
                      <div style={{
                        fontSize: '9px',
                        color: '#a8b8d0',
                        letterSpacing: '2px',
                        textShadow: '1px 1px 0 #000, 0 0 8px rgba(168,184,208,0.3)',
                        position: 'relative',
                      }}>
                        {selectedOpponent.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character GIF - centered, smaller on mobile to fit everything */}
              <div className="flex-shrink-0 flex items-center justify-center my-2">
                <img 
                  src={characterImages[selectedOpponent.id]} 
                  alt={selectedOpponent.name}
                  className="object-contain drop-shadow-2xl"
                  style={{ 
                    imageRendering: 'pixelated',
                    height: 'min(180px, 30vh)',
                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.8))'
                  }}
                />
              </div>

              {/* Stats - retro diagonal stripe bars for mobile */}
              <div className="bg-[#0a1628]/95 p-3 border-2 border-[#1a3a5c] mb-2 w-full max-w-xs">
                <div className="space-y-3">
                  {selectedOpponent.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#8ab4c4] w-24">{stat.label}</span>
                      {/* Bar container */}
                      <div className="relative flex-1 h-3 bg-[#0a1628] border border-[#1a3a5c] overflow-hidden">
                        {/* Filled portion with diagonal stripes */}
                        <div 
                          className="absolute inset-y-0 left-0 h-full"
                          style={{ 
                            width: `${stat.value}%`,
                            background: `repeating-linear-gradient(
                              -45deg,
                              #4a9ead,
                              #4a9ead 2px,
                              #3a7a8a 2px,
                              #3a7a8a 4px
                            )`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-[#1a3a5c] text-center">
                  <span className="text-[9px] text-[#5a8a9a]">DIFFICULTY: </span>
                  <span className={`text-[9px] font-bold ${
                    selectedOpponent.id === 'easy' ? 'text-green-400' : 
                    selectedOpponent.id === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{selectedOpponent.id.toUpperCase()}</span>
                </div>
              </div>

              {/* Quote */}
              <div className="text-[10px] text-gray-300 italic mb-2 bg-black/50 px-4 py-2 rounded text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                "{selectedOpponent.bio}"
              </div>

              {/* Challenge button - sticky bottom so it's always reachable */}
              <div className="flex-shrink-0 w-full flex justify-center pb-2">
                <button
                  onClick={() => { stopBarMusic(); startGame(selectedOpponent.id); }}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all hover:scale-105 text-sm shadow-lg"
                >
                  CHALLENGE →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              SELECT AN OPPONENT ABOVE
            </div>
          )}
        </div>
      </div>
    );
  }
  // Character detail screen - now redirects to select
  if (gameState === 'character' && selectedOpponent) {
    // Redirect to select screen since we combined them
    setGameState('select');
    return null;
  }

  // Item Unlock screen — special animation when player earns the matchbook
  if (gameState === 'itemUnlock') {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
        style={{ 
          fontFamily: "'Press Start 2P', monospace",
          background: '#000'
        }}
      >
        {/* Animated fire/glow background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,102,0,0.25) 0%, rgba(139,69,19,0.1) 40%, transparent 70%)',
          animation: 'itemPulse 3s ease-in-out infinite',
        }} />
        
        {/* Particle sparks */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: i % 3 === 0 ? '#ff6600' : i % 3 === 1 ? '#ffcc00' : '#ff3300',
              borderRadius: '50%',
              left: `${20 + Math.random() * 60}%`,
              top: `${30 + Math.random() * 40}%`,
              animation: `spark${i % 4} ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: `0 0 6px ${i % 2 === 0 ? '#ff6600' : '#ffcc00'}`,
            }} />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center flex flex-col items-center" style={{ animation: 'itemFadeIn 1s ease-out' }}>
          {/* "SPECIAL ITEM" header */}
          <div style={{
            fontSize: '11px',
            color: '#ff6600',
            letterSpacing: '6px',
            textShadow: '0 0 10px rgba(255,102,0,0.8)',
            marginBottom: '8px',
            animation: 'itemFlicker 2s ease-in-out infinite',
          }}>
            ★ SPECIAL ITEM ★
          </div>
          
          {/* Separator */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px',
          }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                width: '4px', height: '4px',
                background: i === 3 ? '#ff6600' : '#663300',
                boxShadow: i === 3 ? '0 0 8px #ff6600' : 'none',
              }} />
            ))}
          </div>
          
          {/* Matchbook image placeholder - large, centered, with fire glow */}
          <div style={{
            width: '160px',
            height: '160px',
            background: 'linear-gradient(180deg, #ff8833 0%, #cc4400 100%)',
            border: '4px solid #ffcc00',
            boxShadow: `
              0 0 30px rgba(255, 102, 0, 0.8),
              0 0 60px rgba(255, 102, 0, 0.4),
              0 8px 0 #993300,
              inset 0 0 20px rgba(255, 204, 0, 0.3)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'itemReveal 1.5s ease-out, itemFloat 3s ease-in-out 1.5s infinite',
            marginBottom: '24px',
            imageRendering: 'pixelated',
          }}>
            <img
              src="/images/items/matchbook.png"
              alt="Four Thieves Matchbook"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 20px rgba(255, 204, 0, 1))',
              }}
              onError={(e) => {
                // Fallback if image doesn't exist yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span style="font-size:80px">🔥</span>';
              }}
            />
          </div>
          
          {/* Item name */}
          <div style={{
            fontSize: '18px',
            color: '#ffcc00',
            textShadow: '3px 3px 0 #000, 0 0 20px rgba(255, 204, 0, 0.8)',
            marginBottom: '8px',
            lineHeight: '1.5',
          }}>
            MATCHBOOK
          </div>
          
          <div style={{
            fontSize: '9px',
            color: '#ff9933',
            letterSpacing: '3px',
            marginBottom: '16px',
          }}>
            FOUR THIEVES BAR
          </div>
          
          {/* Description */}
          <div style={{
            background: 'rgba(0, 0, 51, 0.9)',
            border: '2px solid #334',
            padding: '12px 20px',
            maxWidth: '350px',
            marginBottom: '24px',
          }}>
            <p style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '12px',
              color: '#ccc',
              lineHeight: '1.8',
              textAlign: 'center',
            }}>
              A worn matchbook from Four Thieves Bar. The inside cover has something scrawled on it...
            </p>
          </div>
          
          {/* Added to locker notification */}
          <div style={{
            fontSize: '9px',
            color: '#00ff88',
            textShadow: '0 0 8px rgba(0, 255, 136, 0.5)',
            marginBottom: '24px',
            animation: 'itemFlicker 3s ease-in-out infinite',
          }}>
            📦 ADDED TO YOUR LOCKER
          </div>
          
          {/* Continue button */}
          <button
            onClick={() => setGameState('gameover')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
              padding: '14px 40px',
              background: 'linear-gradient(180deg, #ff8833 0%, #cc4400 100%)',
              border: '3px solid #ffcc00',
              color: '#fff',
              cursor: 'pointer',
              textShadow: '1px 1px 0 #000',
              boxShadow: '0 4px 0 #993300, 0 0 20px rgba(255, 102, 0, 0.5)',
              transition: 'all 0.2s',
              letterSpacing: '2px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 0 #993300, 0 0 30px rgba(255, 102, 0, 0.8)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #993300, 0 0 20px rgba(255, 102, 0, 0.5)';
            }}
          >
            CONTINUE →
          </button>
        </div>
        
        {/* Animations */}
        <style>{`
          @keyframes itemPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes itemFadeIn {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes itemReveal {
            0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
            60% { transform: scale(1.1) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes itemFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes itemFlicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes spark0 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-30px) scale(1.5); opacity: 0; }
          }
          @keyframes spark1 {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-20px) translateX(10px) scale(0.5); opacity: 0; }
          }
          @keyframes spark2 {
            0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.7; }
            50% { transform: translateY(-40px) scale(1.2); opacity: 0; }
          }
          @keyframes spark3 {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
            50% { transform: translateY(-25px) translateX(-15px) scale(0.3); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (gameState === 'gameover' && winner) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
        style={{ 
          fontFamily: "'Press Start 2P', monospace",
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)'
        }}
      >
        {/* Animated background glow */}
        <div 
          className={`absolute inset-0 opacity-30 ${winner === 'player' ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{
            animation: 'pulse 2s ease-in-out infinite',
            filter: 'blur(100px)'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Trophy/Skull icon */}
          <div className="text-8xl mb-6" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
            {winner === 'player' ? '🏆' : '💀'}
          </div>
          
          {/* Win/Lose text */}
          <h1 
            className={`text-4xl md:text-5xl font-bold mb-4 tracking-wider ${
              winner === 'player' ? 'text-yellow-400' : 'text-red-500'
            }`}
            style={{ 
              textShadow: winner === 'player' 
                ? '0 0 20px rgba(234, 179, 8, 0.8), 2px 2px 0 #000' 
                : '0 0 20px rgba(239, 68, 68, 0.8), 2px 2px 0 #000'
            }}
          >
            {winner === 'player' ? 'YOU WIN!' : 'YOU LOSE'}
          </h1>
          
          {/* Opponent name */}
          <p className="text-gray-400 text-sm mb-8">
            {winner === 'player' 
              ? `You defeated ${selectedOpponent?.name || 'your opponent'}!` 
              : `${selectedOpponent?.name || 'Your opponent'} wins this round.`}
          </p>
          
          {/* GUM reward for winning */}
          {winner === 'player' && (
            <div className="mb-8 bg-green-900/50 border-2 border-green-500 px-6 py-3 inline-block">
              <span className="text-green-400 text-lg">+50 GUM</span>
            </div>
          )}

          {/* Matchbook badge for returning winners */}
          {winner === 'player' && matchbookAwarded && aiDifficulty !== 'medium' && (
            <div className="mb-4 text-gray-500 text-xs">
              🔥 Matchbook already in your locker
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => {
                // Reset game state and play again
                if (window.PoolGameLoader) {
                  window.GAME_STOPPED = false;
                  if (typeof GAME_STOPPED !== 'undefined') {
                    GAME_STOPPED = false;
                  }
                }
                startGame(aiDifficulty);
              }}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm tracking-wide transition-all hover:scale-105 border-4 border-yellow-600 shadow-lg"
              style={{ minWidth: '250px' }}
            >
              PLAY AGAIN
            </button>
            
            <button
              onClick={returnToMenu}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs tracking-wide transition-all hover:scale-105 border-2 border-gray-500"
              style={{ minWidth: '250px' }}
            >
              RETURN TO MENU
            </button>
          </div>
        </div>
        
        {/* CSS for pulse animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  // Tutorial/Loading screen — Mega Man SNES style "HOW TO PLAY"
  if (gameState === 'tutorial') {
    const mobileSteps = [
      { key: 'TOUCH', action: 'AIM', desc: 'DRAG TO AIM THE CUE' },
      { key: 'TAP', action: 'LOCK', desc: 'LOCK YOUR AIM IN PLACE' },
      { key: '+  −', action: 'POWER', desc: 'ADJUST SHOT STRENGTH' },
      { key: 'FIRE', action: 'SHOOT', desc: 'STRIKE THE CUE BALL!' },
    ];
    const desktopSteps = [
      { key: 'MOUSE', action: 'AIM', desc: 'MOVE TO AIM THE CUE' },
      { key: 'W', action: 'POWER ▲', desc: 'HOLD TO CHARGE UP' },
      { key: 'S', action: 'POWER ▼', desc: 'HOLD TO DECREASE' },
      { key: 'SPACE', action: 'SHOOT', desc: 'CLICK OR PRESS TO FIRE' },
    ];
    const steps = isMobile ? mobileSteps : desktopSteps;

    return (
      <div className="mm-tutorial-screen">
        {/* Scanline overlay */}
        <div className="mm-scanlines" />

        {/* Animated grid background */}
        <div className="mm-grid-bg" />

        {/* Top bar — Mega Man weapon get style */}
        <div className="mm-top-bar">
          <div className="mm-top-bar-left">
            <span className="mm-top-label">FOUR THIEVES</span>
            <span className="mm-top-sub">POOL HALL</span>
          </div>
          <div className="mm-top-bar-center">
            <span className="mm-ready-text">▸ READY? ◂</span>
          </div>
          <div className="mm-top-bar-right">
            <span className="mm-top-label">VS</span>
            <span className="mm-top-sub">{selectedOpponent?.name || 'CPU'}</span>
          </div>
        </div>

        {/* Title */}
        <div className="mm-title-block">
          <div className="mm-title-deco mm-title-deco-l">◆ ◆ ◆</div>
          <h2 className="mm-title">HOW TO PLAY</h2>
          <div className="mm-title-deco mm-title-deco-r">◆ ◆ ◆</div>
        </div>

        {/* Steps grid — weapon select style */}
        <div className="mm-steps-grid">
          {steps.map((step, i) => (
            <div
              key={step.action}
              className="mm-step-card"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="mm-step-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="mm-step-key-box">
                <span className="mm-step-key">{step.key}</span>
              </div>
              <div className="mm-step-info">
                <span className="mm-step-action">{step.action}</span>
                <span className="mm-step-desc">{step.desc}</span>
              </div>
              <div className="mm-step-arrow">▸</div>
            </div>
          ))}
        </div>

        {/* Bottom bar with hints */}
        <div className="mm-bottom-bar">
          <div className="mm-hint">
            <span className="mm-hint-icon">ℹ</span>
            <span className="mm-hint-text">SINK ALL YOUR BALLS + THE 8-BALL TO WIN</span>
          </div>
        </div>

        {/* Start button */}
        <button onClick={() => setGameState('intro')} className="mm-start-btn">
          <span className="mm-btn-icon">▶</span>
          <span className="mm-btn-text">START MATCH</span>
        </button>

        {/* Inline scoped styles for the Mega Man tutorial */}
        <style>{`
          .mm-tutorial-screen {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            font-family: 'Press Start 2P', monospace;
            color: #e0f0ff;
            overflow: hidden;
            background: #060818;
            padding: 16px;
            box-sizing: border-box;
          }

          /* Animated neon grid */
          .mm-grid-bg {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(0, 255, 170, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 170, 0.04) 1px, transparent 1px);
            background-size: 32px 32px;
            animation: mmGridScroll 8s linear infinite;
            pointer-events: none;
          }
          @keyframes mmGridScroll {
            to { background-position: 32px 32px; }
          }

          /* CRT scanlines */
          .mm-scanlines {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.15) 0px,
              rgba(0,0,0,0.15) 1px,
              transparent 1px,
              transparent 3px
            );
            pointer-events: none;
            z-index: 10;
          }

          /* Top bar */
          .mm-top-bar {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 560px;
            padding: 8px 12px;
            background: linear-gradient(180deg, rgba(0,200,255,0.12) 0%, rgba(0,200,255,0.03) 100%);
            border: 2px solid #00c8ff;
            border-radius: 2px;
            box-shadow: 0 0 12px rgba(0,200,255,0.25), inset 0 0 20px rgba(0,200,255,0.05);
          }
          .mm-top-bar-left,
          .mm-top-bar-right {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .mm-top-bar-right { text-align: right; }
          .mm-top-bar-center { text-align: center; }
          .mm-top-label {
            font-size: 8px;
            color: #00c8ff;
            letter-spacing: 2px;
          }
          .mm-top-sub {
            font-size: 6px;
            color: #5aeaff;
            letter-spacing: 1px;
            opacity: 0.7;
          }
          .mm-ready-text {
            font-size: 10px;
            color: #fbbf24;
            text-shadow: 0 0 8px #fbbf24;
            animation: mmBlink 1s step-end infinite;
          }
          @keyframes mmBlink {
            50% { opacity: 0; }
          }

          /* Title */
          .mm-title-block {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .mm-title {
            font-size: 22px;
            color: #fbbf24;
            margin: 0;
            text-shadow:
              0 0 6px #fbbf24,
              0 0 18px rgba(251,191,36,0.5),
              2px 2px 0 #b45309;
            letter-spacing: 6px;
            animation: mmTitleGlow 2s ease-in-out infinite alternate;
          }
          @keyframes mmTitleGlow {
            from { text-shadow: 0 0 6px #fbbf24, 0 0 18px rgba(251,191,36,0.5), 2px 2px 0 #b45309; }
            to   { text-shadow: 0 0 10px #fbbf24, 0 0 30px rgba(251,191,36,0.7), 2px 2px 0 #b45309; }
          }
          .mm-title-deco {
            font-size: 8px;
            color: #00c8ff;
            letter-spacing: 4px;
            opacity: 0.6;
          }

          /* Steps grid — weapon select cards */
          .mm-steps-grid {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            width: 100%;
            max-width: 560px;
          }
          @media (max-width: 480px) {
            .mm-steps-grid { grid-template-columns: 1fr; }
            .mm-title { font-size: 16px; letter-spacing: 3px; }
          }

          .mm-step-card {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: linear-gradient(135deg, rgba(0,40,80,0.7) 0%, rgba(0,20,50,0.9) 100%);
            border: 2px solid #0e7490;
            border-radius: 2px;
            position: relative;
            overflow: hidden;
            animation: mmCardSlide 0.4s ease-out backwards;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .mm-step-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, #00c8ff, transparent);
            animation: mmShine 3s linear infinite;
          }
          @keyframes mmShine {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .mm-step-card:hover {
            border-color: #fbbf24;
            box-shadow: 0 0 16px rgba(251,191,36,0.3), inset 0 0 12px rgba(251,191,36,0.05);
          }
          @keyframes mmCardSlide {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }

          .mm-step-num {
            font-size: 7px;
            color: #0e7490;
            position: absolute;
            top: 4px;
            right: 6px;
            letter-spacing: 1px;
          }

          .mm-step-key-box {
            flex-shrink: 0;
            width: 52px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #1a1a3a 0%, #0c0c20 100%);
            border: 2px solid #00c8ff;
            border-bottom: 3px solid #005f7f;
            border-radius: 3px;
            box-shadow: 0 0 8px rgba(0,200,255,0.2);
          }
          .mm-step-key {
            font-size: 8px;
            color: #fff;
            text-shadow: 0 0 4px #00c8ff;
            letter-spacing: 1px;
          }

          .mm-step-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
            flex: 1;
            min-width: 0;
          }
          .mm-step-action {
            font-size: 10px;
            color: #fbbf24;
            text-shadow: 0 0 6px rgba(251,191,36,0.4);
            letter-spacing: 2px;
          }
          .mm-step-desc {
            font-size: 6px;
            color: #7dd3fc;
            letter-spacing: 1px;
            line-height: 1.5;
            opacity: 0.8;
          }

          .mm-step-arrow {
            font-size: 14px;
            color: #0e7490;
            animation: mmArrowPulse 1.5s ease-in-out infinite;
          }
          @keyframes mmArrowPulse {
            0%, 100% { opacity: 0.3; transform: translateX(0); }
            50% { opacity: 1; transform: translateX(3px); }
          }

          /* Bottom hint bar */
          .mm-bottom-bar {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 560px;
            padding: 6px 12px;
            background: rgba(0,200,255,0.06);
            border: 1px solid rgba(0,200,255,0.2);
            border-radius: 2px;
          }
          .mm-hint {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .mm-hint-icon {
            font-size: 10px;
            color: #00c8ff;
            flex-shrink: 0;
          }
          .mm-hint-text {
            font-size: 6px;
            color: #7dd3fc;
            letter-spacing: 1px;
            animation: mmTypewriter 4s steps(40) 0.8s backwards;
            overflow: hidden;
            white-space: nowrap;
          }
          @keyframes mmTypewriter {
            from { width: 0; }
            to   { width: 100%; }
          }

          /* Start button — Mega Man style */
          .mm-start-btn {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Press Start 2P', monospace;
            font-size: 14px;
            padding: 14px 32px;
            background: linear-gradient(180deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
            color: #000;
            border: 3px solid #fef3c7;
            border-bottom: 4px solid #92400e;
            border-radius: 2px;
            cursor: pointer;
            letter-spacing: 3px;
            text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
            box-shadow:
              0 0 16px rgba(251,191,36,0.4),
              inset 0 1px 0 rgba(255,255,255,0.3);
            transition: all 0.15s;
            animation: mmBtnPulse 2s ease-in-out infinite;
            margin-top: 4px;
          }
          @keyframes mmBtnPulse {
            0%, 100% { box-shadow: 0 0 16px rgba(251,191,36,0.4); }
            50% { box-shadow: 0 0 28px rgba(251,191,36,0.7), 0 0 60px rgba(251,191,36,0.2); }
          }
          .mm-start-btn:hover {
            transform: scale(1.04);
            background: linear-gradient(180deg, #fcd34d 0%, #fbbf24 50%, #d97706 100%);
            box-shadow: 0 0 30px rgba(251,191,36,0.8);
          }
          .mm-start-btn:active {
            transform: scale(0.97);
            border-bottom-width: 2px;
            margin-top: 6px;
          }
          .mm-btn-icon {
            font-size: 12px;
          }
          .mm-btn-text {}
        `}</style>
      </div>
    );
  }

  // Intro video phase - plays opponent intro then starts the game
  if (gameState === 'intro') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <video
          autoPlay
          playsInline
          onEnded={startPlaying}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          src={`/Games/pool-game/${selectedOpponent?.id === 'easy' ? 'glass-joe' : selectedOpponent?.id === 'medium' ? 'the-wizard-cutscene' : 'rug-dr'}.mp4`}
          onError={() => startPlaying()}
        />
        <button
          onClick={startPlaying}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          SKIP ▸
        </button>
      </div>
    );
  }

  // Portrait mode overlay
  if (isPortrait) {
    return (
      <div className="pool-rotate-screen">
        <div className="rotate-phone">
          <svg viewBox="0 0 64 64" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="18" y="8" width="28" height="48" rx="4" className="phone-body" />
            <circle cx="32" cy="50" r="2" />
            <path d="M10 32 L6 28 M10 32 L6 36" className="arrow" />
            <path d="M54 32 L58 28 M54 32 L58 36" className="arrow" />
            <path d="M10 32 C10 20 20 10 32 10" className="rotate-arc" strokeDasharray="4 2" />
            <path d="M54 32 C54 44 44 54 32 54" className="rotate-arc" strokeDasharray="4 2" />
          </svg>
        </div>
        <div className="rotate-text">ROTATE YOUR DEVICE</div>
        <div className="rotate-subtext">Landscape mode required</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden" style={{ position: 'relative', ...(isMobile ? { width: '100vw', height: '100vh', minHeight: '100vh' } : {}) }}>
      {/* Game Canvas - Full height, no header */}
      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center relative"
        style={isMobile ? { width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 } : {}}
      >
        {isLoading ? (
          <div className="text-white text-xl">Loading pool game engine...</div>
        ) : (
          <canvas
            ref={canvasRef}
            style={isMobile
              ? { display: 'block', background: '#000' }
              : { width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', background: '#000' }
            }
          />
        )}

        {/* Retro Scoreboard Overlay - split left/right, inset to clear corner + center pockets */}
        {!isLoading && gameState === 'playing' && (
          <>
            {/* Player score - top left quarter */}
            <div className="absolute top-1 z-10 pointer-events-none" style={{ left: '12.5%', transform: 'translateX(-50%)', fontFamily: "'Press Start 2P', monospace" }}>
              <div className="flex items-center gap-1 bg-black/80 border border-gray-600 rounded px-2 py-1 backdrop-blur-sm">
                <span className={`text-[7px] ${currentTurn === 0 ? 'text-white' : 'text-gray-500'}`}>YOU</span>
                <div className="flex gap-[2px]">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`p${i}`}
                      className={`w-[6px] h-[6px] rounded-full border ${
                        i < playerScore
                          ? playerColor === 'red' ? 'bg-red-500 border-red-400' : playerColor === 'yellow' ? 'bg-yellow-400 border-yellow-300' : 'bg-gray-400 border-gray-300'
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold ${currentTurn === 0 ? 'text-green-400' : 'text-gray-600'}`}>{playerScore}</span>
              </div>
            </div>
            {/* AI score - top right quarter */}
            <div className="absolute top-1 z-10 pointer-events-none" style={{ right: '12.5%', transform: 'translateX(50%)', fontFamily: "'Press Start 2P', monospace" }}>
              <div className="flex items-center gap-1 bg-black/80 border border-gray-600 rounded px-2 py-1 backdrop-blur-sm">
                <span className={`text-[10px] font-bold ${currentTurn === 1 ? 'text-green-400' : 'text-gray-600'}`}>{aiScore}</span>
                <div className="flex gap-[2px]">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`a${i}`}
                      className={`w-[6px] h-[6px] rounded-full border ${
                        i < aiScore
                          ? aiColor === 'red' ? 'bg-red-500 border-red-400' : aiColor === 'yellow' ? 'bg-yellow-400 border-yellow-300' : 'bg-gray-400 border-gray-300'
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[7px] ${currentTurn === 1 ? 'text-white' : 'text-gray-500'}`}>{selectedOpponent?.name?.split(' ')[0]?.toUpperCase() || 'CPU'}</span>
              </div>
            </div>
          </>
        )}

        {/* Floating close button for native apps (no title bar) */}
        {!isLoading && isMobile && onClose && (
          <div className="absolute top-1 right-1 z-20 pointer-events-auto">
            <button
              onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
              onClick={onClose}
              className="bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center border border-gray-600 active:scale-90 transition-transform backdrop-blur-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Desktop Controls Guide - left side overlay */}
        {!isLoading && !isMobile && (
          <div
            className="absolute top-2 left-2 z-10 pointer-events-none"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            <div className="bg-black/70 border border-cyan-800/60 rounded px-3 py-2 backdrop-blur-sm" style={{ maxWidth: '150px' }}>
              <div className="text-[7px] text-cyan-400 mb-2 tracking-widest text-center border-b border-cyan-800/40 pb-1">CONTROLS</div>
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-2">
                  <span className="text-[7px] bg-cyan-900/50 border border-cyan-700/60 text-white px-[5px] py-[2px] rounded-sm text-center" style={{ minWidth: '28px' }}>🖱️</span>
                  <span className="text-[6px] text-gray-300">AIM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] bg-cyan-900/50 border border-cyan-700/60 text-white px-[5px] py-[2px] rounded-sm text-center" style={{ minWidth: '28px' }}>W</span>
                  <span className="text-[6px] text-gray-300">POWER ▲</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] bg-cyan-900/50 border border-cyan-700/60 text-white px-[5px] py-[2px] rounded-sm text-center" style={{ minWidth: '28px' }}>S</span>
                  <span className="text-[6px] text-gray-300">POWER ▼</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] bg-yellow-700/50 border border-yellow-500/60 text-yellow-300 px-[5px] py-[2px] rounded-sm text-center" style={{ minWidth: '28px' }}>SPC</span>
                  <span className="text-[6px] text-yellow-300">SHOOT!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lock/Unlock Aim button - middle left of screen (mobile only) */}
        {!isLoading && isMobile && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <div className="pointer-events-auto" onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }} onTouchMove={(e) => e.stopPropagation()}>
              {!aimLocked ? (
                <button
                  onTouchEnd={(e) => { e.preventDefault(); handleLockAim(); }}
                  onClick={handleLockAim}
                  className="bg-yellow-500/60 hover:bg-yellow-400/70 text-black px-4 py-3 rounded-lg text-[10px] font-bold shadow-lg border-2 border-yellow-600/60 active:scale-95 transition-transform backdrop-blur-sm"
                >
                  🎯 LOCK AIM
                </button>
              ) : (
                <button
                  onTouchEnd={(e) => { e.preventDefault(); handleUnlockAim(); }}
                  onClick={handleUnlockAim}
                  className="bg-gray-600/60 hover:bg-gray-500/70 text-white px-4 py-3 rounded-lg text-[10px] font-bold shadow-lg border-2 border-gray-500/60 active:scale-95 transition-transform backdrop-blur-sm"
                >
                  ↩️ RE-AIM
                </button>
              )}
            </div>
          </div>
        )}

        {/* Power controls and Shoot - bottom right (mobile only) */}
        {!isLoading && isMobile && (
          <div className="absolute bottom-0 right-0 p-2 pointer-events-none" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <div className="pointer-events-auto flex items-center gap-2" onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
              {aimLocked && (
                <>
                  {/* Power display */}
                  <div className="bg-black/80 px-2 py-1 rounded border border-gray-600 text-center">
                    <div className="text-[8px] text-gray-400">POWER</div>
                    <div className="text-yellow-400 text-sm font-bold">{Math.round((currentPower / 75) * 100)}%</div>
                  </div>
                  
                  {/* Power buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleIncreasePower}
                      className="bg-green-600 hover:bg-green-500 text-white w-12 h-10 rounded-lg text-xl font-bold shadow-lg border-2 border-green-700 active:scale-95 transition-transform"
                    >
                      +
                    </button>
                    <button
                      onClick={handleDecreasePower}
                      className="bg-red-600 hover:bg-red-500 text-white w-12 h-10 rounded-lg text-xl font-bold shadow-lg border-2 border-red-700 active:scale-95 transition-transform"
                    >
                      −
                    </button>
                  </div>

                  {/* Shoot button */}
                  <button
                    onClick={handleShoot}
                    disabled={currentPower === 0}
                    className={`px-5 py-6 rounded-lg text-[10px] font-bold shadow-lg border-2 active:scale-95 transition-transform ${
                      currentPower > 0
                        ? 'bg-orange-500 hover:bg-orange-400 text-black border-orange-600'
                        : 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                    }`}
                  >
                    🎱<br/>SHOOT
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PoolGame;
