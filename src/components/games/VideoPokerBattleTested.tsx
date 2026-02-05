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
import { processCasinoTransaction } from '../../utils/casinoTransactions';
import { useDemoModeOptional, isIOSPlatform } from '../../contexts/DemoModeContext';
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
  const demoMode = useDemoModeOptional();
  const isDemoMode = isIOSPlatform() && (demoMode?.isDemoMode || false);
  
  // Debug: Log demo mode status on mount
  useEffect(() => {
    console.log('🃏 [VideoPoker] Demo mode check:', {
      isIOSPlatform: isIOSPlatform(),
      contextIsDemoMode: demoMode?.isDemoMode,
      finalIsDemoMode: isDemoMode,
      demoBalance: demoMode?.demoBalance
    });
  }, [isDemoMode, demoMode?.isDemoMode, demoMode?.demoBalance]);

  // Game state - use demo balance if in demo mode
  const effectiveInitialBalance = isDemoMode ? (demoMode?.demoBalance ?? 1000) : initialBalance;
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
  const [gumBalance, setGumBalance] = useState(effectiveInitialBalance);

  const bet = BET_LEVELS[betLevel] * GUM_PER_COIN;

  // Update local balance when initialBalance prop changes or demo balance changes
  useEffect(() => {
    if (isDemoMode && demoMode?.demoBalance !== undefined) {
      setGumBalance(demoMode.demoBalance);
    } else {
      setGumBalance(initialBalance);
    }
  }, [initialBalance, isDemoMode, demoMode?.demoBalance]);

  // Listen for external gum balance updates (e.g., from MyLocker claiming GUM)
  useEffect(() => {
    const handleGumUpdate = (event: CustomEvent) => {
      if (!isDemoMode && event.detail?.balance !== undefined) {
        console.log('🃏 [VideoPoker] External balance update:', event.detail.balance);
        setGumBalance(event.detail.balance);
      }
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    return () => {
      window.removeEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    };
  }, [isDemoMode]);

  // ============================================================================
  // GUM API TRANSACTION (same pattern as slots)
  // ============================================================================

  const pokerTransaction = async (
    type: 'bet' | 'win' | 'refund', 
    amount: number, 
    metadata?: any
  ): Promise<{ success: boolean; new_balance?: number; error?: string }> => {
    if (isDemoMode && demoMode) {
      const currentBalance = demoMode.demoBalance ?? 0;
      if (type === 'bet') {
        if (currentBalance < amount) {
          return { success: false, error: 'Not enough GUM' };
        }
        const newBalance = currentBalance - amount;
        demoMode.updateDemoBalance(newBalance);
        setGumBalance(newBalance);
        onBalanceUpdate?.(newBalance);
        return { success: true, new_balance: newBalance };
      }

      const newBalance = currentBalance + amount;
      demoMode.updateDemoBalance(newBalance);
      setGumBalance(newBalance);
      onBalanceUpdate?.(newBalance);
      return { success: true, new_balance: newBalance };
    }

    if (!walletAddress) {
      return { success: false, error: 'No wallet connected' };
    }

    const result = await processCasinoTransaction(walletAddress, type, amount, 'videopoker', metadata);

    if (result.success && result.new_balance !== undefined) {
      // Instant UI update with new balance from API
      setGumBalance(result.new_balance);
      onBalanceUpdate?.(result.new_balance);
      console.log(`🃏 Video Poker ${type}: Updated balance to ${result.new_balance}`);
    }

    return result;
  };

  // Audio refs
  const dealSoundRef = useRef<HTMLAudioElement | null>(null);
  const holdSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload sounds - using original keyeh/videopoker sounds
    dealSoundRef.current = new Audio('/sounds/cardReveal.mp3');
    holdSoundRef.current = new Audio('/sounds/cardHold.mp3');
    winSoundRef.current = new Audio('/sounds/win1.mp3');
    loseSoundRef.current = new Audio('/sounds/win2.mp3');

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

    if (!walletAddress && !isDemoMode) {
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
  }, [gumBalance, bet, roundEnded, walletAddress, betLevel, isDemoMode]);

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
      <figure 
        key={index}
        onClick={() => card && holdCard(index)}
        className="cursor-pointer"
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* HOLD indicator */}
        <div 
          style={{ 
            color: '#fff',
            fontSize: '10px',
            height: '20px',
            paddingBottom: '6px',
            fontFamily: '"Press Start 2P", cursive',
            WebkitTextStroke: '0',
            visibility: isHeld ? 'visible' : 'hidden',
          }}
        >
          HELD
        </div>
        
        {/* Card image */}
        <div
          style={{
            width: window.innerWidth < 768 ? '50px' : '60px',
            height: window.innerWidth < 768 ? '70px' : '84px',
            minWidth: '45px',
            flexShrink: 0,
          }}
        >
          {isEmpty ? (
            // Empty slot - show card back
            <img 
              src="/cards/RED_BACK.svg"
              alt="Card back"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                cursor: 'pointer',
              }}
              draggable={false}
            />
          ) : isRevealed && card ? (
            // Face-up card
            <img 
              src={getCardSvgUrl(card.code)}
              alt={card.code}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                cursor: 'pointer',
              }}
              draggable={false}
            />
          ) : (
            // Card back
            <img 
              src="/cards/RED_BACK.svg"
              alt="Card back"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                cursor: 'pointer',
              }}
              draggable={false}
            />
          )}
        </div>
      </figure>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div 
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{
        background: 'blue', // Classic casino blue
        minHeight: '100%',
        fontFamily: '"Press Start 2P", cursive',
        color: '#ff0000', // Red text default
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Pay Table - Classic Yellow on Dark Blue */}
      <div 
        className="flex-shrink-0"
        style={{
          background: 'darkblue',
          border: '3px solid #ffff00',
          margin: '8px',
          marginBottom: '4px',
        }}
      >
        {/* Header */}
        <div 
          className="grid text-right font-bold"
          style={{ 
            gridTemplateColumns: window.innerWidth < 768 ? '1fr repeat(5, 48px)' : '1fr repeat(5, 60px)',
            borderBottom: '3px solid #ffff00',
            color: '#ffff00',
            fontSize: window.innerWidth < 768 ? '8px' : '10px',
          }}
        >
          <div style={{ padding: '5px', textAlign: 'left' }}></div>
          {BET_LEVELS.map((level, idx) => (
            <div 
              key={idx}
              style={{ 
                padding: '5px',
                color: betLevel === idx ? '#fff' : '#ffff00',
                background: betLevel === idx ? '#f00000' : 'transparent',
                borderLeft: '3px solid #ffff00',
              }}
            >
              {level * GUM_PER_COIN}
            </div>
          ))}
        </div>
        
        {/* Payout rows */}
        {PAY_TABLE_DATA.map((row, rowIdx) => (
          <div 
            key={rowIdx}
            className="grid text-right"
            style={{ 
              gridTemplateColumns: window.innerWidth < 768 ? '1fr repeat(5, 48px)' : '1fr repeat(5, 60px)',
              color: '#ffff00',
              fontSize: window.innerWidth < 768 ? '8px' : '10px',
            }}
          >
            <div 
              style={{ 
                padding: '5px 8px', 
                color: winningHand === row.pokersolver ? '#fff' : '#ffff00',
                textAlign: 'left',
                animation: winningHand === row.pokersolver && roundEnded ? 'blink 1s steps(1) infinite' : 'none',
              }}
            >
              {row.display}
            </div>
            {row.payouts.map((payout, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '5px',
                  color: winningHand === row.pokersolver && roundEnded ? '#fff' : '#ffff00',
                  background: betLevel === idx ? '#f00000' : 'transparent',
                  borderLeft: '3px solid #ffff00',
                  animation: winningHand === row.pokersolver && roundEnded ? 'blink 1s steps(1) infinite' : 'none',
                }}
              >
                {payout * GUM_PER_COIN}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Hand Status - Big red text with yellow stroke */}
      <div 
        className="text-center flex-shrink-0"
        style={{
          padding: '10px 8px',
          color: '#ff0000',
          fontSize: '16px',
          WebkitTextStroke: '2px #ffff00',
          lineHeight: '1.4',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ animation: lastWin > 0 && roundEnded ? 'blink 1s steps(1) infinite' : 'none' }}>
          {winningHand || (gamePhase === 'holding' ? 'CLICK CARDS TO HOLD' : ' ')}
        </span>
      </div>

      {/* Cards Area */}
      <div 
        className="flex justify-center gap-2 flex-shrink-0 px-2"
        style={{ 
          padding: '8px',
          flexWrap: 'wrap',
          maxWidth: '100%',
        }}
      >
        {[0, 1, 2, 3, 4].map(i => renderCard(hand[i], i))}
      </div>

      {/* Bottom Row - Credit/Win/Bet */}
      <div 
        className="grid grid-cols-3 flex-shrink-0"
        style={{ 
          padding: '10px 15px',
          fontSize: '16px',
          WebkitTextStroke: '2px #ffff00',
          color: '#ff0000',
        }}
      >
        <div className="text-left">
          BET {bet}
        </div>
        <div className="text-center">
          WIN {lastWin}
        </div>
        <div className="text-right">
          CREDIT {gumBalance}
        </div>
      </div>

      {/* Button Row */}
      <div 
        className="flex gap-2 flex-shrink-0"
        style={{ 
          padding: '0 8px 8px 8px',
        }}
      >
        {/* Help Button */}
        <button
          onClick={onClose}
          style={{
            flex: '1',
            padding: '12px 8px',
            fontFamily: '"Press Start 2P", cursive',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#000',
            fontSize: '10px',
            background: '#e0c725',
            borderRadius: '2px',
            borderColor: '#ddd',
            borderWidth: '2px',
            borderStyle: 'outset',
            boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
          }}
        >
          EXIT
        </button>

        {/* Bet Selection Buttons (only in betting phase) */}
        {gamePhase === 'betting' && (
          <div style={{ display: 'flex', gap: '4px', flex: '3' }}>
            {BET_LEVELS.map((level, idx) => {
              const betAmount = level * GUM_PER_COIN;
              const isSelected = betLevel === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setBetLevel(idx)}
                  style={{
                    flex: '1',
                    padding: '12px 4px',
                    fontFamily: '"Press Start 2P", cursive',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '9px',
                    background: isSelected ? '#ffd700' : '#333',
                    color: isSelected ? '#000' : '#ffd700',
                    borderRadius: '2px',
                    borderWidth: isSelected ? '3px' : '2px',
                    borderStyle: 'solid',
                    borderColor: isSelected ? '#fff' : '#ffd700',
                    boxShadow: isSelected ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {betAmount}
                </button>
              );
            })}
          </div>
        )}

        {/* Deal/Draw Button */}
        <button
          onClick={gamePhase === 'betting' ? newHand : gamePhase === 'holding' ? dealNextCards : startNewGame}
          disabled={isAnimating || (gamePhase === 'betting' && gumBalance < bet)}
          className={gamePhase !== 'result' && !isAnimating && gumBalance >= bet ? 'flash' : ''}
          style={{
            flex: '2',
            padding: '12px 8px',
            fontFamily: '"Press Start 2P", cursive',
            cursor: gumBalance < bet && gamePhase === 'betting' ? 'not-allowed' : 'pointer',
            textAlign: 'center',
            color: '#000',
            fontSize: '10px',
            background: '#e0c725',
            borderRadius: '2px',
            borderColor: '#ddd',
            borderWidth: '2px',
            borderStyle: 'outset',
            boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
            opacity: gumBalance < bet && gamePhase === 'betting' ? 0.5 : 1,
          }}
        >
          {gamePhase === 'betting' ? 'DEAL' : gamePhase === 'holding' ? 'DRAW' : 'DEAL'}
        </button>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes flash {
          0% { color: white; }
          50% { color: black; }
          100% { color: white; }
        }
        .flash {
          animation: flash 1s steps(1) infinite;
        }
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
};

export default VideoPokerBattleTested;
