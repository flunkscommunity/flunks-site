/**
 * VideoPoker - Battle-tested Jacks or Better video poker game
 * Based on: https://github.com/keyeh/videopoker (MIT License)
 * 
 * This component separates game logic from UI for easy aesthetic customization.
 * The core poker logic is in /lib/pokersolver.ts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  CARD_LIST, 
  PAY_TABLE_DATA, 
  evaluateVideoPokerHand, 
  shuffleDeck, 
  getCardDisplay 
} from '../../lib/pokersolver';

// ============================================================================
// TYPES
// ============================================================================

interface CardState {
  code: string;      // e.g., "Ah" for Ace of Hearts
  held: boolean;
  revealed: boolean;
}

type GamePhase = 'betting' | 'holding' | 'result';

interface VideoPokerProps {
  onClose?: () => void;
  walletAddress?: string;
  gumBalance?: number;
  onGumChange?: (amount: number) => void;
}

// ============================================================================
// CONSTANTS - Easy to customize!
// ============================================================================

const BET_LEVELS = [1, 2, 3, 4, 5]; // Bet multiplier (coins)
const GUM_PER_COIN = 10;            // GUM cost per coin

// ============================================================================
// COMPONENT
// ============================================================================

const VideoPokerBattleTested: React.FC<VideoPokerProps> = ({ 
  onClose, 
  walletAddress,
  gumBalance = 0,
  onGumChange 
}) => {
  // Game state
  const [deck, setDeck] = useState<string[]>([]);
  const [hand, setHand] = useState<CardState[]>([]);
  const [holdState, setHoldState] = useState<boolean[]>([false, false, false, false, false]);
  const [betLevel, setBetLevel] = useState(4); // 0-4, default to max bet
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting');
  const [roundEnded, setRoundEnded] = useState(true);
  const [lastWin, setLastWin] = useState(0);
  const [winningHand, setWinningHand] = useState('');
  const [message, setMessage] = useState('Place your bet and DEAL!');
  const [isAnimating, setIsAnimating] = useState(false);

  const bet = BET_LEVELS[betLevel] * GUM_PER_COIN;

  // Audio refs
  const dealSoundRef = useRef<HTMLAudioElement | null>(null);
  const holdSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload sounds
    dealSoundRef.current = new Audio('/sounds/card-deal.mp3');
    holdSoundRef.current = new Audio('/sounds/card-flip.mp3');
    winSoundRef.current = new Audio('/sounds/poker-win.mp3');
    loseSoundRef.current = new Audio('/sounds/poker-lose.mp3');

    return () => {
      [dealSoundRef, holdSoundRef, winSoundRef, loseSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);

  // ============================================================================
  // GAME LOGIC (from keyeh/videopoker)
  // ============================================================================

  const newHand = useCallback(async () => {
    if (gumBalance < bet) {
      setMessage('❌ Not enough GUM!');
      return;
    }

    if (!roundEnded) return;

    setIsAnimating(true);
    onGumChange?.(-bet);
    
    // Shuffle and deal
    const shuffledDeck = shuffleDeck([...CARD_LIST]);
    const newHandCards = shuffledDeck.slice(0, 5);
    const remainingDeck = shuffledDeck.slice(5);

    setDeck(remainingDeck);
    setHoldState([false, false, false, false, false]);
    setLastWin(0);
    setWinningHand('');

    // Animate dealing cards one by one
    dealSoundRef.current?.play().catch(() => {});
    
    const dealtHand: CardState[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      dealtHand.push({
        code: newHandCards[i],
        held: false,
        revealed: true,
      });
      setHand([...dealtHand]);
    }

    // Check initial hand value (for display purposes)
    const result = evaluateVideoPokerHand(newHandCards);
    if (result.name) {
      setMessage(`${result.name} - Select cards to HOLD`);
    } else {
      setMessage('Select cards to HOLD, then DRAW');
    }

    setRoundEnded(false);
    setGamePhase('holding');
    setIsAnimating(false);
  }, [gumBalance, bet, roundEnded, onGumChange]);

  const holdCard = useCallback((index: number) => {
    if (gamePhase !== 'holding' || isAnimating) return;
    
    holdSoundRef.current?.play().catch(() => {});
    
    setHoldState(prev => {
      const newHold = [...prev];
      newHold[index] = !newHold[index];
      return newHold;
    });

    setHand(prev => prev.map((card, i) => 
      i === index ? { ...card, held: !card.held } : card
    ));
  }, [gamePhase, isAnimating]);

  const dealNextCards = useCallback(async () => {
    if (gamePhase !== 'holding' || isAnimating) return;

    setIsAnimating(true);
    dealSoundRef.current?.play().catch(() => {});

    // Replace non-held cards
    const currentDeck = [...deck];
    const newHand = hand.map((card, i) => {
      if (holdState[i]) {
        return card;
      }
      return {
        code: currentDeck.shift()!,
        held: false,
        revealed: true,
      };
    });

    // Animate card replacement
    for (let i = 0; i < 5; i++) {
      if (!holdState[i]) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setHand(prev => prev.map((c, idx) => idx === i ? newHand[i] : c));
      }
    }

    setDeck(currentDeck);

    // Evaluate final hand
    const handCodes = newHand.map(c => c.code);
    const result = evaluateVideoPokerHand(handCodes);
    
    // Calculate winnings based on bet level
    const winAmount = result.betMultiplier * BET_LEVELS[betLevel] * GUM_PER_COIN;
    
    setWinningHand(result.name);
    setLastWin(winAmount);
    setRoundEnded(true);
    setGamePhase('result');

    if (winAmount > 0) {
      onGumChange?.(winAmount);
      winSoundRef.current?.play().catch(() => {});
      setMessage(`🎉 ${result.name}! Won ${winAmount} GUM!`);
    } else {
      loseSoundRef.current?.play().catch(() => {});
      setMessage('No win. Try again!');
    }

    setIsAnimating(false);
  }, [gamePhase, isAnimating, deck, hand, holdState, betLevel, onGumChange]);

  const startNewGame = useCallback(() => {
    setHand([]);
    setHoldState([false, false, false, false, false]);
    setLastWin(0);
    setWinningHand('');
    setMessage('Place your bet and DEAL!');
    setRoundEnded(true);
    setGamePhase('betting');
  }, []);

  // ============================================================================
  // RENDER CARD - Customize this for different aesthetics!
  // ============================================================================

  const renderCard = (card: CardState | undefined, index: number) => {
    const isEmpty = !card;
    const isHeld = holdState[index];
    const display = card ? getCardDisplay(card.code) : null;

    return (
      <div 
        key={index}
        onClick={() => card && holdCard(index)}
        className="relative cursor-pointer transition-all duration-200"
        style={{
          width: '70px',
          height: '100px',
          transform: isHeld ? 'translateY(-12px)' : 'none',
        }}
      >
        {/* HOLD indicator */}
        {isHeld && (
          <div 
            className="absolute -top-6 left-0 right-0 text-center text-xs font-bold animate-pulse"
            style={{ color: '#00ff00', textShadow: '0 0 8px #00ff00' }}
          >
            HELD
          </div>
        )}
        
        {/* Card face */}
        <div
          className="w-full h-full rounded-lg flex flex-col items-center justify-center select-none"
          style={{
            background: isEmpty 
              ? 'linear-gradient(135deg, #2a1a3a 0%, #1a0a2a 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            border: isHeld 
              ? '3px solid #00ff00' 
              : isEmpty 
                ? '2px solid #444'
                : '2px solid #333',
            boxShadow: isHeld 
              ? '0 0 20px rgba(0, 255, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4)' 
              : '0 4px 12px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          {display && (
            <>
              {/* Top left corner */}
              <div 
                className="absolute top-1 left-2 text-sm font-bold"
                style={{ color: display.color }}
              >
                {display.value}
              </div>
              
              {/* Center suit */}
              <div 
                className="text-4xl"
                style={{ color: display.color }}
              >
                {display.suit}
              </div>
              
              {/* Bottom right corner (inverted) */}
              <div 
                className="absolute bottom-1 right-2 text-sm font-bold rotate-180"
                style={{ color: display.color }}
              >
                {display.value}
              </div>
            </>
          )}
          {isEmpty && (
            <div className="text-3xl opacity-20">🃏</div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div 
      className="w-full h-full flex flex-col p-4 overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0a2a0a 100%)',
        minHeight: '100%',
      }}
    >
      {/* Pay Table */}
      <div 
        className="mb-4 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          border: '3px solid #ffd700',
        }}
      >
        {/* Header */}
        <div 
          className="grid text-center font-bold text-xs"
          style={{ 
            gridTemplateColumns: '1fr repeat(5, 45px)',
            background: '#1a1a2a',
            borderBottom: '2px solid #ffd700',
          }}
        >
          <div style={{ padding: '6px', color: '#ffd700' }}>HAND</div>
          {BET_LEVELS.map((level, idx) => (
            <div 
              key={idx}
              style={{ 
                padding: '6px',
                color: betLevel === idx ? '#000' : '#ffd700',
                background: betLevel === idx ? '#ffd700' : 'transparent',
                fontWeight: 'bold',
              }}
            >
              {level}
            </div>
          ))}
        </div>
        
        {/* Payout rows */}
        {PAY_TABLE_DATA.map((row, rowIdx) => (
          <div 
            key={rowIdx}
            className="grid text-center text-xs"
            style={{ 
              gridTemplateColumns: '1fr repeat(5, 45px)',
              borderBottom: '1px solid #333',
              background: winningHand === row.pokersolver 
                ? 'rgba(0, 255, 0, 0.4)' 
                : 'transparent',
              animation: winningHand === row.pokersolver ? 'pulse 0.5s ease-in-out infinite' : 'none',
            }}
          >
            <div 
              style={{ 
                padding: '4px 8px', 
                color: winningHand === row.pokersolver ? '#00ff00' : '#ffd700',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '10px',
              }}
            >
              {row.display}
            </div>
            {row.payouts.map((payout, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '4px',
                  color: idx === 4 ? '#ff4444' : '#ffd700',
                  background: betLevel === idx ? (idx === 4 ? '#ff4444' : '#ffd700') : 'transparent',
                }}
              >
                <span style={{ color: betLevel === idx ? '#000' : undefined }}>
                  {payout}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Area */}
      <div 
        className="flex-1 rounded-2xl p-4 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #1a4a2a 0%, #0d3320 100%)',
          border: '6px solid #8B4513',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)',
          minHeight: '320px',
        }}
      >
        {/* Cards */}
        <div 
          className="flex justify-center gap-2 mb-4 p-4 rounded-lg flex-shrink-0"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            minHeight: '130px',
          }}
        >
          {[0, 1, 2, 3, 4].map(i => renderCard(hand[i], i))}
        </div>

        {/* Message */}
        <div 
          className="text-center p-3 rounded-lg mb-4 flex-shrink-0"
          style={{
            background: '#000',
            border: '2px solid #ffd700',
            color: lastWin > 0 ? '#00ff00' : '#ffd700',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: lastWin > 0 ? '0 0 15px #00ff00' : 'none',
          }}
        >
          {message}
        </div>

        {/* Bet Selector (only in betting phase) */}
        {gamePhase === 'betting' && (
          <div className="mb-4 flex-shrink-0">
            <div className="text-center text-sm mb-2" style={{ color: '#ffd700' }}>
              SELECT BET
            </div>
            <div className="flex justify-center gap-2">
              {BET_LEVELS.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => setBetLevel(idx)}
                  className="transition-all duration-200"
                  style={{
                    width: '50px',
                    height: '36px',
                    borderRadius: '6px',
                    border: betLevel === idx ? '2px solid #fff' : '2px solid #666',
                    background: betLevel === idx 
                      ? (idx === 4 ? 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)' : 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)')
                      : 'linear-gradient(180deg, #333 0%, #111 100%)',
                    color: betLevel === idx ? '#fff' : '#888',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transform: betLevel === idx ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {level * GUM_PER_COIN}
                </button>
              ))}
            </div>
            {betLevel === 4 && (
              <div className="text-center mt-2 text-sm animate-pulse" style={{ color: '#ff4444' }}>
                ⭐ MAX BET - Royal Flush Bonus! ⭐
              </div>
            )}
          </div>
        )}

        {/* Balance */}
        <div 
          className="text-center mb-4 py-2 rounded flex-shrink-0"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#ffd700',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}
        >
          💰 GUM: {gumBalance} | Bet: {bet}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {gamePhase === 'betting' && (
            <button
              onClick={newHand}
              disabled={isAnimating || gumBalance < bet}
              className="w-full py-4 rounded-xl font-black text-xl transition-all duration-300 hover:scale-105"
              style={{
                background: gumBalance < bet 
                  ? 'linear-gradient(180deg, #444 0%, #222 100%)'
                  : 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.3), 0 6px 0 #1B5E20',
                cursor: gumBalance < bet ? 'not-allowed' : 'pointer',
                opacity: gumBalance < bet ? 0.6 : 1,
              }}
            >
              🃏 DEAL 🃏
            </button>
          )}
          
          {gamePhase === 'holding' && (
            <button
              onClick={dealNextCards}
              disabled={isAnimating}
              className="w-full py-4 rounded-xl font-black text-xl transition-all duration-300 hover:scale-105 animate-pulse"
              style={{
                background: 'linear-gradient(180deg, #ff6b35 0%, #e55a25 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 0 25px rgba(255, 107, 53, 0.5), 0 6px 0 #cc4400',
              }}
            >
              🃏 DRAW 🃏
            </button>
          )}
          
          {gamePhase === 'result' && (
            <button
              onClick={startNewGame}
              className="w-full py-4 rounded-xl font-black text-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #2196F3 0%, #1565C0 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 0 20px rgba(33, 150, 243, 0.4), 0 6px 0 #0D47A1',
              }}
            >
              🔄 PLAY AGAIN 🔄
            </button>
          )}
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default VideoPokerBattleTested;
