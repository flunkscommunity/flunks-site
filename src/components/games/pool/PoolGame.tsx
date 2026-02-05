import React, { useEffect, useRef, useState } from 'react';

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
}

// Opponent data
interface Opponent {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  title: string;
  avatar: string;
  stats: { accuracy: number; power: number; strategy: number };
  bio: string;
  unlocked: boolean;
}

const OPPONENTS: Opponent[] = [
  {
    id: 'easy',
    name: 'SLICK RICK',
    title: 'The Rookie',
    avatar: '/Games/pool-game/sprites/opponent-easy.png',
    stats: { accuracy: 25, power: 30, strategy: 20 },
    bio: 'New to the game. Makes mistakes but learning fast.',
    unlocked: true,
  },
  {
    id: 'medium',
    name: 'CHALK CHARLIE',
    title: 'The Hustler',
    avatar: '/Games/pool-game/sprites/opponent-medium.png',
    stats: { accuracy: 55, power: 50, strategy: 60 },
    bio: 'Knows every angle. Been running tables since \'89.',
    unlocked: false,
  },
  {
    id: 'hard',
    name: 'EIGHT-BALL EDDIE',
    title: 'The Legend',
    avatar: '/Games/pool-game/sprites/opponent-hard.png',
    stats: { accuracy: 85, power: 75, strategy: 90 },
    bio: 'Undefeated champion. They say he never misses.',
    unlocked: false,
  },
];

const PoolGame: React.FC<PoolGameProps> = ({ walletAddress, gumBalance, onGumChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderScriptRef = useRef<HTMLScriptElement | null>(null);
  
  // Control UI state
  const [aimLocked, setAimLocked] = useState(false);
  const [currentPower, setCurrentPower] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'select' | 'character' | 'tutorial' | 'playing' | 'gameover'>('start');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  const handleGameOver = (result: 'player' | 'ai') => {
    setWinner(result);
    setGameState('gameover');
    // Unlock next level on win
    if (result === 'player') {
      if (aiDifficulty === 'easy') unlockLevel('medium');
      if (aiDifficulty === 'medium') unlockLevel('hard');
    }
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
          onClick={() => setGameState('select')} 
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
          {/* Left side - Small opponent list */}
          <div className="w-52 flex flex-col bg-black/70 border-r border-yellow-600/50 p-3 pt-4">
            <div className="text-xs text-yellow-400 mb-3 text-center">SELECT</div>
            <div className="flex flex-col gap-1">
              {OPPONENTS.map((opp) => {
                const unlocked = isUnlocked(opp.id);
                const isSelected = selectedOpponent?.id === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => unlocked && setSelectedOpponent(opp)}
                    disabled={!unlocked}
                    className={`relative flex items-center gap-2 p-2 text-left transition-all ${
                      isSelected
                        ? 'bg-yellow-600/50 text-yellow-400 border-l-4 border-yellow-400'
                        : unlocked
                        ? 'hover:bg-yellow-900/30 text-gray-300'
                        : 'opacity-30 cursor-not-allowed text-gray-600'
                    }`}
                  >
                    {isSelected && <span className="text-yellow-400">▶</span>}
                    <div className={`${isSelected ? '' : 'ml-4'}`}>
                      <div className="text-[10px]">{unlocked ? opp.name : '???'}</div>
                      <div className="text-[8px] text-gray-400">{unlocked ? opp.title : ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto pt-4 text-center text-gray-500 text-[8px] leading-relaxed">
              BEAT EACH TO<br/>UNLOCK NEXT
            </div>
          </div>
          
          {/* Right side - Character display with background */}
          <div className="flex-1 flex flex-col p-6">
            {selectedOpponent ? (
              <>
                {/* Character name at top */}
                <div className="text-center mb-2">
                  <div className="text-2xl text-yellow-400 tracking-wider drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {selectedOpponent.name}
                  </div>
                  <div className="text-sm text-gray-300 mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {selectedOpponent.title}
                  </div>
                </div>
                
                {/* Main area - character GIF display CENTERED */}
                <div className="flex-1 flex items-center justify-center">
                  <img 
                    src={characterImages[selectedOpponent.id]} 
                    alt={selectedOpponent.name}
                    className="object-contain drop-shadow-2xl"
                    style={{ 
                      imageRendering: 'pixelated',
                      height: '380px',
                      filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.8))'
                    }}
                  />
                </div>
                
                {/* Stats and Quote at bottom */}
                <div className="mt-2 flex flex-col items-center">
                  {/* Stats - retro diagonal stripe bars */}
                  <div className="bg-[#0a1628]/95 p-4 border-2 border-[#1a3a5c] mb-3">
                    <div className="space-y-2">
                      {(['accuracy', 'power', 'strategy'] as const).map((stat) => {
                        const value = selectedOpponent.stats[stat];
                        const statConfig = {
                          accuracy: { label: 'Accuracy', color: '#4a9ead' },
                          power: { label: 'Power', color: '#4a9ead' },
                          strategy: { label: 'Strategy', color: '#4a9ead' }
                        };
                        const config = statConfig[stat];
                        return (
                          <div key={stat} className="flex items-center gap-3">
                            <span className="text-[11px] text-[#8ab4c4] w-20 text-right">{config.label}</span>
                            {/* Bar container */}
                            <div className="relative w-32 h-3 bg-[#0a1628] border border-[#1a3a5c] overflow-hidden">
                              {/* Filled portion with diagonal stripes */}
                              <div 
                                className="absolute inset-y-0 left-0 h-full"
                                style={{ 
                                  width: `${value}%`,
                                  background: `repeating-linear-gradient(
                                    -45deg,
                                    ${config.color},
                                    ${config.color} 2px,
                                    #3a7a8a 2px,
                                    #3a7a8a 4px
                                  )`
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Quote */}
                  <div className="text-[10px] text-gray-300 italic mb-3 bg-black/50 inline-block px-4 py-2 rounded" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    "{selectedOpponent.bio}"
                  </div>
                  
                  {/* Challenge button */}
                  <button
                    onClick={() => startGame(selectedOpponent.id)}
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
          {/* Opponent selector - horizontal scroll */}
          <div className="flex-shrink-0 bg-black/80 p-3 border-b border-yellow-600/50">
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
            <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
              {/* Character name */}
              <div className="text-center mb-4">
                <div className="text-xl text-yellow-400 tracking-wider drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  {selectedOpponent.name}
                </div>
                <div className="text-xs text-gray-300 mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {selectedOpponent.title}
                </div>
              </div>

              {/* Character GIF - centered */}
              <div className="flex-shrink-0 flex items-center justify-center my-4">
                <img 
                  src={characterImages[selectedOpponent.id]} 
                  alt={selectedOpponent.name}
                  className="object-contain drop-shadow-2xl"
                  style={{ 
                    imageRendering: 'pixelated',
                    height: '280px',
                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.8))'
                  }}
                />
              </div>

              {/* Stats - retro diagonal stripe bars for mobile */}
              <div className="bg-[#0a1628]/95 p-4 border-2 border-[#1a3a5c] mb-4 w-full max-w-xs">
                <div className="space-y-3">
                  {(['accuracy', 'power', 'strategy'] as const).map((stat) => {
                    const value = selectedOpponent.stats[stat];
                    const statConfig = {
                      accuracy: { label: 'Accuracy', color: '#4a9ead' },
                      power: { label: 'Power', color: '#4a9ead' },
                      strategy: { label: 'Strategy', color: '#4a9ead' }
                    };
                    const config = statConfig[stat];
                    return (
                      <div key={stat} className="flex items-center gap-3">
                        <span className="text-[11px] text-[#8ab4c4] w-20">{config.label}</span>
                        {/* Bar container */}
                        <div className="relative flex-1 h-3 bg-[#0a1628] border border-[#1a3a5c] overflow-hidden">
                          {/* Filled portion with diagonal stripes */}
                          <div 
                            className="absolute inset-y-0 left-0 h-full"
                            style={{ 
                              width: `${value}%`,
                              background: `repeating-linear-gradient(
                                -45deg,
                                ${config.color},
                                ${config.color} 2px,
                                #3a7a8a 2px,
                                #3a7a8a 4px
                              )`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
              <div className="text-[10px] text-gray-300 italic mb-4 bg-black/50 px-4 py-2 rounded text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                "{selectedOpponent.bio}"
              </div>

              {/* Challenge button */}
              <button
                onClick={() => startGame(selectedOpponent.id)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all hover:scale-105 text-sm shadow-lg mb-4"
              >
                CHALLENGE →
              </button>
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

  // Tutorial/Loading screen
  if (gameState === 'tutorial') {
    return (
      <div className="pool-tutorial-screen">
        <div className="pool-tutorial-content">
          <h2 className="pool-tutorial-title">HOW TO PLAY</h2>
          
          <div className="pool-tutorial-sections">
            {/* Universal Controls */}
            <div className="pool-tutorial-section">
              <div className="section-title pixel-title">🎱 CONTROLS</div>
              <div className="pool-tutorial-steps">
                <div className="pool-tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-icon">🎯</div>
                  <div className="step-text">
                    <span className="step-action">AIM</span>
                    <span className="step-desc">Move/touch to aim the cue</span>
                  </div>
                </div>
                
                <div className="pool-tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-icon">🔒</div>
                  <div className="step-text">
                    <span className="step-action">LOCK AIM</span>
                    <span className="step-desc">Tap "Lock Aim" when ready</span>
                  </div>
                </div>
                
                <div className="pool-tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-icon">⬆️</div>
                  <div className="step-text">
                    <span className="step-action">SET POWER</span>
                    <span className="step-desc">Use +/- buttons to adjust</span>
                  </div>
                </div>

                <div className="pool-tutorial-step">
                  <div className="step-number">4</div>
                  <div className="step-icon">💥</div>
                  <div className="step-text">
                    <span className="step-action">SHOOT</span>
                    <span className="step-desc">Tap "Shoot" to strike!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={startPlaying} className="pool-tutorial-start">
            START MATCH
          </button>
        </div>
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
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Game Canvas - Full height, no header */}
      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center relative">
        {isLoading ? (
          <div className="text-white text-xl">Loading pool game engine...</div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', background: '#000' }}
          />
        )}

        {/* Control Buttons Overlay */}
        {!isLoading && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-2 pointer-events-none" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            {/* Left side - Lock/Unlock Aim button */}
            <div className="pointer-events-auto">
              {!aimLocked ? (
                <button
                  onClick={handleLockAim}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-lg text-[10px] font-bold shadow-lg border-2 border-yellow-600 active:scale-95 transition-transform"
                >
                  🎯 LOCK AIM
                </button>
              ) : (
                <button
                  onClick={handleUnlockAim}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg text-[10px] font-bold shadow-lg border-2 border-gray-500 active:scale-95 transition-transform"
                >
                  ↩️ RE-AIM
                </button>
              )}
            </div>

            {/* Center - GUM display */}
            <div className="text-yellow-400 text-xs bg-black/80 px-3 py-2 rounded border border-yellow-600">
              💰 {gumBalance} GUM
            </div>

            {/* Right side - Power controls and Shoot */}
            <div className="pointer-events-auto flex items-center gap-2">
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
