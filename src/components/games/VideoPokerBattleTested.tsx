/**
 * VideoPoker - Battle-tested Jacks or Better video poker game
 * Based on: https://github.com/keyeh/videopoker (MIT License)
 * 
 * This component separates game logic from UI for easy aesthetic customization.
 * The core poker logic is in /lib/pokersolver.ts
 * 
 * Uses real GUM via /api/videopoker/transaction API
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
  initialBalance?: number;
  onBalanceUpdate?: (newBalance: number) => void;
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
  initialBalance = 0,
  onBalanceUpdate 
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
  const [gumBalance, setGumBalance] = useState(initialBalance);

  const bet = BET_LEVELS[betLevel] * GUM_PER_COIN;

  // Update local balance when initialBalance prop changes
  useEffect(() => {
    setGumBalance(initialBalance);
  }, [initialBalance]);

  // ============================================================================
  // GUM API TRANSACTION (same pattern as slots)
  // ============================================================================

  const pokerTransaction = async (
    type: 'bet' | 'win' | 'refund', 
    amount: number, 
    metadata?: any
  ): Promise<{ success: boolean; new_balance?: number; error?: string }> => {
    if (!walletAddress) {
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const response = await fetch('/api/videopoker/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, type, amount, metadata })
      });

      const result = await response.json();

      if (result.success && result.new_balance !== undefined) {
        // Instant UI update with new balance from API
        setGumBalance(result.new_balance);
        onBalanceUpdate?.(result.new_balance);
        console.log(`🃏 Video Poker ${type}: Updated balance to ${result.new_balance}`);
      }

      return result;
    } catch (error) {
      console.error('Video poker transaction error:', error);
      return { success: false, error: 'Transaction failed' };
    }
  };

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
      setMessage('NOT ENOUGH GUM!');
      return;
    }

    if (!walletAddress) {
      setMessage('CONNECT WALLET!');
      return;
    }

    if (!roundEnded) return;

    setIsAnimating(true);
    
    // Place bet via API
    const betResult = await pokerTransaction('bet', bet, { bet_level: betLevel + 1 });
    if (!betResult.success) {
      setMessage(betResult.error || 'BET FAILED!');
      setIsAnimating(false);
      return;
    }
    
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
      setMessage(`${result.name} - SELECT HOLD`);
    } else {
      setMessage('SELECT HOLD THEN DRAW');
    }

    setRoundEnded(false);
    setGamePhase('holding');
    setIsAnimating(false);
  }, [gumBalance, bet, roundEnded, walletAddress, betLevel]);

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
      // Award winnings via API
      const winResult = await pokerTransaction('win', winAmount, { 
        hand: result.name,
        bet_level: betLevel + 1,
        cards: handCodes 
      });
      
      if (winResult.success) {
        winSoundRef.current?.play().catch(() => {});
        setMessage(`${result.name}! +${winAmount} GUM!`);
      } else {
        setMessage(`WIN ERROR: ${winResult.error}`);
      }
    } else {
    } else {
      loseSoundRef.current?.play().catch(() => {});
      setMessage('NO WIN - TRY AGAIN');
    }

    setIsAnimating(false);
  }, [gamePhase, isAnimating, deck, hand, holdState, betLevel, walletAddress]);

  const startNewGame = useCallback(() => {
    setHand([]);
    setHoldState([false, false, false, false, false]);
    setLastWin(0);
    setWinningHand('');
    setMessage('PLACE BET AND DEAL!');
    setRoundEnded(true);
    setGamePhase('betting');
  }, []);

  // ============================================================================
  // RENDER CARD - Using classic SVG playing cards!
  // ============================================================================

  // Convert card code (e.g., "Ah", "Ts") to SVG filename (e.g., "AH.svg", "10S.svg")
  const getCardSvgUrl = (cardCode: string): string => {
    const value = cardCode.charAt(0);
    const suit = cardCode.charAt(1).toUpperCase();
    
    // Handle 10 (T in code)
    const displayValue = value === 'T' ? '10' : value.toUpperCase();
    
    return `/cards/${displayValue}${suit}.svg`;
  };

  const renderCard = (card: CardState | undefined, index: number) => {
    const isEmpty = !card;
    const isRevealed = card?.revealed ?? false;
    const isHeld = holdState[index];

    return (
      <div 
        key={index}
        onClick={() => card && holdCard(index)}
        className="relative cursor-pointer transition-all duration-200"
        style={{
          width: '80px',
          height: '112px',
          transform: isHeld ? 'translateY(-12px)' : 'none',
        }}
      >
        {/* HOLD indicator - old school yellow text */}
        {isHeld && (
          <div 
            className="absolute -top-6 left-0 right-0 text-center font-bold"
            style={{ 
              color: '#ffff00', 
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
            }}
          >
            HELD
          </div>
        )}
        
        {/* Card image */}
        <div
          className="w-full h-full rounded-lg overflow-hidden select-none"
          style={{
            border: isHeld 
              ? '3px solid #ffff00' 
              : '2px solid #333',
            boxShadow: isHeld 
              ? '0 0 15px rgba(255, 255, 0, 0.6), 0 6px 12px rgba(0, 0, 0, 0.5)' 
              : '0 4px 8px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.15s ease',
            background: '#1a237e',
          }}
        >
          {isEmpty ? (
            // Empty slot
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d1442 100%)' }}
            >
              <span className="text-3xl opacity-30">🃏</span>
            </div>
          ) : isRevealed && card ? (
            // Face-up card - use SVG
            <img 
              src={getCardSvgUrl(card.code)}
              alt={card.code}
              className="w-full h-full object-contain"
              style={{ background: '#fff' }}
              draggable={false}
            />
          ) : (
            // Card back
            <img 
              src="/cards/BACK.svg"
              alt="Card back"
              className="w-full h-full object-cover"
              draggable={false}
            />
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
        background: 'linear-gradient(180deg, #0000cc 0%, #000066 100%)',
        minHeight: '100%',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }}
    >
      {/* Pay Table - Classic Yellow on Dark Blue */}
      <div 
        className="mb-4 rounded overflow-hidden flex-shrink-0"
        style={{
          background: '#000033',
          border: '3px solid #ffff00',
        }}
      >
        {/* Header */}
        <div 
          className="grid text-center font-bold"
          style={{ 
            gridTemplateColumns: '1fr repeat(5, 45px)',
            background: '#000044',
            borderBottom: '2px solid #ffff00',
            fontSize: '10px',
          }}
        >
          <div style={{ padding: '6px', color: '#ffff00' }}>HAND</div>
          {BET_LEVELS.map((level, idx) => (
            <div 
              key={idx}
              style={{ 
                padding: '6px',
                color: betLevel === idx ? '#000' : '#ffff00',
                background: betLevel === idx ? '#ff0000' : 'transparent',
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
            className="grid text-center"
            style={{ 
              gridTemplateColumns: '1fr repeat(5, 45px)',
              borderBottom: '1px solid #333366',
              background: winningHand === row.pokersolver 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'transparent',
              animation: winningHand === row.pokersolver ? 'blink 0.3s ease-in-out infinite' : 'none',
              fontSize: '9px',
            }}
          >
            <div 
              style={{ 
                padding: '4px 8px', 
                color: winningHand === row.pokersolver ? '#ffffff' : '#ffff00',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              {row.display}
            </div>
            {row.payouts.map((payout, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '4px',
                  color: '#ffff00',
                  background: betLevel === idx ? '#ff0000' : 'transparent',
                }}
              >
                <span style={{ color: betLevel === idx ? '#ffffff' : undefined }}>
                  {payout}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Area - Classic blue felt look */}
      <div 
        className="flex-1 rounded p-4 flex flex-col"
        style={{
          background: '#000088',
          border: '4px solid #ffff00',
          minHeight: '320px',
        }}
      >
        {/* Cards */}
        <div 
          className="flex justify-center gap-3 mb-4 p-4 flex-shrink-0"
          style={{
            minHeight: '140px',
          }}
        >
          {[0, 1, 2, 3, 4].map(i => renderCard(hand[i], i))}
        </div>

        {/* Message - Red text with yellow stroke like old-school casino */}
        <div 
          className="text-center p-3 mb-4 flex-shrink-0"
          style={{
            color: lastWin > 0 ? '#ffffff' : '#ff0000',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '2px 2px 0 #ffff00, -1px -1px 0 #ffff00, 1px -1px 0 #ffff00, -1px 1px 0 #ffff00',
            animation: lastWin > 0 ? 'blink 0.5s ease-in-out infinite' : 'none',
          }}
        >
          {message}
        </div>

        {/* Bet Selector (only in betting phase) */}
        {gamePhase === 'betting' && (
          <div className="mb-4 flex-shrink-0">
            <div className="text-center text-xs mb-2" style={{ color: '#ffff00' }}>
              SELECT BET
            </div>
            <div className="flex justify-center gap-2">
              {BET_LEVELS.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => setBetLevel(idx)}
                  className="transition-all duration-100"
                  style={{
                    width: '50px',
                    height: '36px',
                    borderRadius: '4px',
                    border: '2px solid #ffff00',
                    borderStyle: betLevel === idx ? 'inset' : 'outset',
                    background: betLevel === idx 
                      ? '#e0c725'
                      : 'linear-gradient(180deg, #e0c725 0%, #b8a020 100%)',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace',
                    boxShadow: betLevel === idx 
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.5)' 
                      : '0 0 0 1px #9e9f27, 0 0 0 3px black',
                  }}
                >
                  {level * GUM_PER_COIN}
                </button>
              ))}
            </div>
            {betLevel === 4 && (
              <div className="text-center mt-2 text-xs" style={{ color: '#ff0000', textShadow: '1px 1px 0 #ffff00' }}>
                ★ MAX BET BONUS ★
              </div>
            )}
          </div>
        )}

        {/* Bottom Row - Credit/Win/Bet like classic machines */}
        <div 
          className="grid grid-cols-3 mb-4 flex-shrink-0"
          style={{ fontSize: '10px' }}
        >
          <div className="text-center" style={{ color: '#ffff00' }}>
            <div>BET</div>
            <div className="text-xl">{BET_LEVELS[betLevel]}</div>
          </div>
          <div className="text-center" style={{ color: lastWin > 0 ? '#ffffff' : '#ffff00' }}>
            <div>WIN</div>
            <div className="text-xl">{lastWin}</div>
          </div>
          <div className="text-center" style={{ color: '#ffff00' }}>
            <div>CREDIT</div>
            <div className="text-xl">{gumBalance}</div>
          </div>
        </div>

        {/* Action Buttons - Classic casino style */}
        <div className="flex-shrink-0">
          {gamePhase === 'betting' && (
            <button
              onClick={newHand}
              disabled={isAnimating || gumBalance < bet}
              className={`w-full py-3 font-black text-lg transition-all duration-100 ${!isAnimating && gumBalance >= bet ? 'animate-pulse' : ''}`}
              style={{
                background: gumBalance < bet 
                  ? '#444'
                  : '#e0c725',
                border: '3px solid #000',
                borderStyle: 'outset',
                borderRadius: '4px',
                color: '#000',
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
                cursor: gumBalance < bet ? 'not-allowed' : 'pointer',
                opacity: gumBalance < bet ? 0.5 : 1,
                fontSize: '14px',
              }}
            >
              DEAL
            </button>
          )}
          
          {gamePhase === 'holding' && (
            <button
              onClick={dealNextCards}
              disabled={isAnimating}
              className="w-full py-3 font-black text-lg transition-all duration-100 animate-pulse"
              style={{
                background: '#e0c725',
                border: '3px solid #000',
                borderStyle: 'outset',
                borderRadius: '4px',
                color: '#000',
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
                fontSize: '14px',
              }}
            >
              DRAW
            </button>
          )}
          
          {gamePhase === 'result' && (
            <button
              onClick={startNewGame}
              className="w-full py-3 font-black text-lg transition-all duration-100"
              style={{
                background: '#e0c725',
                border: '3px solid #000',
                borderStyle: 'outset',
                borderRadius: '4px',
                color: '#000',
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
                fontSize: '14px',
              }}
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>

      {/* CSS for blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
};

export default VideoPokerBattleTested;
