import React, { useEffect, useRef, useState } from 'react';

// Declare global PoolGameLoader type
declare global {
  interface Window {
    PoolGameLoader: any;
    Game: any;
    GAME_STOPPED: boolean;
  }
}

interface PoolGameProps {
  walletAddress?: string;
  gumBalance: number;
  onGumChange: (amount: number) => void;
}

const PoolGame: React.FC<PoolGameProps> = ({ walletAddress, gumBalance, onGumChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderScriptRef = useRef<HTMLScriptElement | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

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

  useEffect(() => {
    if (gameState === 'playing' && !isLoading && window.PoolGameLoader) {
      initializePoolGame();
    }
  }, [gameState, isLoading]);

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
    setAiDifficulty(difficulty);
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
    setWinner(null);
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Cooper Black, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            🎱 8-BALL POOL
          </h1>
          <p className="text-gray-300 text-sm">Choose your opponent difficulty</p>
        </div>

        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={() => startGame('easy')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 px-6 rounded-lg border-4 border-green-400 transition-all duration-200 hover:scale-105 font-bold text-lg shadow-lg"
          >
            🟢 EASY - Practice Mode
          </button>
          
          <button
            onClick={() => startGame('medium')}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white py-4 px-6 rounded-lg border-4 border-yellow-400 transition-all duration-200 hover:scale-105 font-bold text-lg shadow-lg"
          >
            🟡 MEDIUM - Casual Hustler
          </button>
          
          <button
            onClick={() => startGame('hard')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 px-6 rounded-lg border-4 border-red-400 transition-all duration-200 hover:scale-105 font-bold text-lg shadow-lg"
          >
            🔴 HARD - Pool Shark
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs mb-2">💰 GUM Balance: {gumBalance}</p>
          <p className="text-gray-500 text-xs">Win to earn GUM rewards!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover' && winner) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold mb-4 ${winner === 'player' ? 'text-yellow-400' : 'text-red-400'}`} 
              style={{ fontFamily: 'Cooper Black, serif', textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>
            {winner === 'player' ? '🏆 YOU WIN!' : '😢 YOU LOSE'}
          </h1>
          <p className="text-gray-300 text-xl mb-4">
            Final Score: {playerScore} - {aiScore}
          </p>
          {winner === 'player' && (
            <p className="text-green-400 text-lg mb-2">+50 GUM earned!</p>
          )}
        </div>

        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={() => startGame(aiDifficulty)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 px-6 rounded-lg border-4 border-blue-400 transition-all duration-200 hover:scale-105 font-bold text-lg shadow-lg"
          >
            🔄 PLAY AGAIN
          </button>
          
          <button
            onClick={returnToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-lg border-3 border-gray-400 transition-all duration-200 hover:scale-105 font-bold shadow-lg"
          >
            🚪 BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Score Header */}
      <div className="bg-black/50 p-3 flex justify-between items-center border-b-2 border-yellow-600">
        <div className="text-white">
          <span className="font-bold">YOU</span>
          <span className="text-2xl ml-3 text-yellow-400">{playerScore}</span>
        </div>
        <div className="text-gray-400 text-sm">
          vs {aiDifficulty.toUpperCase()} AI
        </div>
        <div className="text-white">
          <span className="text-2xl mr-3 text-red-400">{aiScore}</span>
          <span className="font-bold">AI</span>
        </div>
      </div>

      {/* Game Canvas - The real game will render here */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 relative">
        {isLoading ? (
          <div className="text-white text-xl">Loading pool game engine...</div>
        ) : (
          <canvas
            ref={canvasRef}
            className="border-4 border-yellow-600 rounded-lg shadow-2xl"
            style={{ maxWidth: '100%', maxHeight: '100%', background: '#000' }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-3 border-t-2 border-yellow-600">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={returnToMenu}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border-2 border-gray-500 transition-all"
          >
            🚪 Quit
          </button>
          <div className="text-gray-400 text-sm">
            Drag cue stick to aim • Release to shoot
          </div>
          <div className="text-yellow-400">
            💰 {gumBalance} GUM
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolGame;
