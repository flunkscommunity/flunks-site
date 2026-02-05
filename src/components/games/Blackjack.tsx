/**
 * Blackjack - Retro 8-bit style blackjack game
 * Inspired by: https://github.com/kwwalter/retro-blackjack
 * Converted to React/TypeScript with GUM integration
 * 
 * Uses SVG playing cards (same as VideoPoker)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { processCasinoTransaction } from '../../utils/casinoTransactions';
import { useDemoModeOptional, isIOSPlatform } from '../../contexts/DemoModeContext';

// ============================================================================
// TYPES
// ============================================================================

interface Card {
  rank: string;      // "2"-"10", "J", "Q", "K", "A"
  suit: string;      // "C", "D", "H", "S"
  value: number;     // Numeric value (Ace can be 1 or 11)
}

type GamePhase = 'betting' | 'playing' | 'dealer-turn' | 'result';

interface BlackjackProps {
  walletAddress?: string;
  initialBalance?: number;
  onBalanceUpdate?: (newBalance: number) => void;
  onClose?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUITS = ['C', 'D', 'H', 'S'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
const BET_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// HELPERS
// ============================================================================

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = parseInt(rank);
      if (rank === 'J' || rank === 'Q' || rank === 'K') value = 10;
      if (rank === 'A') value = 11; // Ace starts as 11
      deck.push({ rank, suit, value });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
};

const calculateHandValue = (cards: Card[]): { total: number; soft: boolean } => {
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return { total: 0, soft: false };
  }
  
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank);
    }
  }

  // Adjust for aces if busting
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return { total, soft: aces > 0 && total <= 21 };
};

const getCardSvgUrl = (card: Card): string => {
  return `/cards/${card.rank}${card.suit}.svg`;
};

const isBlackjack = (cards: Card[]): boolean => {
  return cards.length === 2 && calculateHandValue(cards).total === 21;
};

// ============================================================================
// COMPONENT
// ============================================================================

const Blackjack: React.FC<BlackjackProps> = ({
  walletAddress,
  initialBalance = 0,
  onBalanceUpdate,
  onClose,
}) => {
  // Demo mode for iOS App Store reviewers only
  const demoMode = useDemoModeOptional();
  const isDemoMode = isIOSPlatform() && (demoMode?.isDemoMode ?? false);
  
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState(25);
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting');
  const [message, setMessage] = useState('PLACE YOUR BET!');
  const [lastWin, setLastWin] = useState(0);
  const [gumBalance, setGumBalance] = useState(initialBalance);
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Effective balance (demo mode or real)
  const effectiveBalance = isDemoMode ? (demoMode?.demoBalance ?? 1000) : gumBalance;
  const effectiveWallet = walletAddress || (isDemoMode ? '0xdemo000000000001' : null);

  // Audio refs
  const dealSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const blackjackWinSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Function ref to avoid circular dependency
  const standRef = useRef<(currentPlayerHand?: Card[], currentDeckOverride?: Card[]) => Promise<void>>();
  
  // Ref to always have access to current player hand (avoids stale closure issues)
  const playerHandRef = useRef<Card[]>([]);
  useEffect(() => {
    playerHandRef.current = playerHand;
  }, [playerHand]);

  useEffect(() => {
    setGumBalance(initialBalance);
  }, [initialBalance]);

  // Listen for external gum balance updates (e.g., from MyLocker claiming GUM)
  useEffect(() => {
    const handleGumUpdate = (event: CustomEvent) => {
      if (!isDemoMode && event.detail?.balance !== undefined) {
        console.log('🂡 [Blackjack] External balance update:', event.detail.balance);
        setGumBalance(event.detail.balance);
      }
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    return () => {
      window.removeEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    };
  }, [isDemoMode]);

  useEffect(() => {
    // Preload sounds - using original keyeh/videopoker casino sounds
    dealSoundRef.current = new Audio('/sounds/cardReveal.mp3');
    winSoundRef.current = new Audio('/sounds/win1.mp3');
    blackjackWinSoundRef.current = new Audio('/sounds/win2.mp3');
  }, []);

  // ============================================================================
  // GUM API
  // ============================================================================

  const blackjackTransaction = async (
    type: 'bet' | 'win' | 'refund',
    amount: number,
    metadata?: any
  ): Promise<{ success: boolean; new_balance?: number; error?: string }> => {
    // Demo mode: handle locally without API
    if (isDemoMode && demoMode) {
      if (type === 'bet') {
        demoMode.spendDemoGum(amount);
      } else if (type === 'win' || type === 'refund') {
        demoMode.earnDemoGum(amount);
      }
      return { success: true, new_balance: demoMode.demoBalance };
    }
    
    if (!walletAddress) {
      return { success: false, error: 'No wallet connected' };
    }

    const result = await processCasinoTransaction(walletAddress, type, amount, 'blackjack', metadata);

    if (result.success && result.new_balance !== undefined) {
      setGumBalance(result.new_balance);
      onBalanceUpdate?.(result.new_balance);
      console.log(`🃏 Blackjack ${type}: Updated balance to ${result.new_balance}`);
    }

    return result;
  };

  // ============================================================================
  // GAME LOGIC
  // ============================================================================

  const startNewHand = useCallback(async () => {
    if (effectiveBalance < bet) {
      setMessage('NOT ENOUGH GUM!');
      return;
    }

    if (!effectiveWallet) {
      setMessage('CONNECT WALLET!');
      return;
    }

    setIsAnimating(true);

    // Place bet via API
    const betResult = await blackjackTransaction('bet', bet, { bet_amount: bet });
    if (!betResult.success) {
      setMessage(betResult.error || 'BET FAILED!');
      setIsAnimating(false);
      return;
    }

    // Create and shuffle deck
    const newDeck = shuffleDeck(createDeck());
    
    // Deal cards - assert non-null since we just created a fresh deck
    const playerCards: Card[] = [newDeck[0]!, newDeck[2]!];
    const dealerCards: Card[] = [newDeck[1]!, newDeck[3]!];
    const remainingDeck = newDeck.slice(4);

    dealSoundRef.current?.play().catch(() => {});

    setDeck(remainingDeck);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setShowDealerCard(false);
    setLastWin(0);

    // Check for blackjacks
    const playerBJ = isBlackjack(playerCards);
    const dealerBJ = isBlackjack(dealerCards);

    if (playerBJ || dealerBJ) {
      setShowDealerCard(true);
      await handleBlackjacks(playerBJ, dealerBJ);
    } else {
      setMessage('HIT OR STAND?');
      setGamePhase('playing');
    }

    setIsAnimating(false);
  }, [effectiveBalance, bet, effectiveWallet]);

  const handleBlackjacks = async (playerBJ: boolean, dealerBJ: boolean) => {
    if (playerBJ && dealerBJ) {
      // Push - return bet
      await blackjackTransaction('refund', bet, { result: 'push_blackjack' });
      setMessage('DOUBLE BLACKJACK! PUSH!');
      winSoundRef.current?.play().catch(() => {});
    } else if (playerBJ) {
      // Player blackjack pays 3:2
      const winAmount = Math.floor(bet * 2.5);
      await blackjackTransaction('win', winAmount, { result: 'player_blackjack' });
      setLastWin(winAmount);
      setMessage('BLACKJACK! YOU WIN!');
      blackjackWinSoundRef.current?.play().catch(() => {}); // Special blackjack sound!
    } else {
      // Dealer blackjack
      setMessage('DEALER BLACKJACK!');
      // Silent on loss
    }
    setGamePhase('result');
  };

  const hit = useCallback(async () => {
    if (gamePhase !== 'playing' || isAnimating || deck.length === 0) return;

    const newCard = deck[0]!;
    const newDeck = deck.slice(1);
    const newHand: Card[] = [...playerHand, newCard];

    dealSoundRef.current?.play().catch(() => {});
    setDeck(newDeck);
    setPlayerHand(newHand);

    const { total } = calculateHandValue(newHand);
    
    if (total > 21) {
      setMessage('BUST! YOU LOSE!');
      setShowDealerCard(true);
      // Silent on loss
      setGamePhase('result');
    } else if (total === 21) {
      // Auto-stand on 21 - pass the current hand to avoid stale state
      standRef.current?.(newHand, newDeck);
    }
  }, [gamePhase, isAnimating, deck, playerHand, dealerHand, bet]);

  const stand = useCallback(async (currentPlayerHand?: Card[], currentDeckOverride?: Card[]) => {
    if (gamePhase !== 'playing' || isAnimating) return;

    setIsAnimating(true);
    setShowDealerCard(true);
    setGamePhase('dealer-turn');
    setMessage('DEALER PLAYS...');

    // Use passed values, or ref for most current state (fixes stale closure bug)
    const handToUse = currentPlayerHand || playerHandRef.current;
    let currentDeck = currentDeckOverride ? [...currentDeckOverride] : [...deck];
    let currentDealerHand: Card[] = [...dealerHand];
    
    await new Promise(r => setTimeout(r, 500));

    while (calculateHandValue(currentDealerHand).total < 17 && currentDeck.length > 0) {
      const newCard = currentDeck[0]!;
      currentDeck = currentDeck.slice(1);
      currentDealerHand = [...currentDealerHand, newCard];
      
      dealSoundRef.current?.play().catch(() => {});
      setDealerHand([...currentDealerHand]);
      setDeck([...currentDeck]);
      
      await new Promise(r => setTimeout(r, 700));
    }

    // Determine winner - ensure handToUse is always a valid array
    const finalHand = Array.isArray(handToUse) && handToUse.length > 0 ? handToUse : playerHandRef.current;
    const playerTotal = calculateHandValue(finalHand).total;
    const dealerTotal = calculateHandValue(currentDealerHand).total;

    console.log('🃏 BLACKJACK RESULT DEBUG:');
    console.log('  finalHand:', finalHand?.map(c => `${c.rank}${c.suit}`).join(', ') || 'EMPTY');
    console.log('  playerTotal:', playerTotal);
    console.log('  dealerTotal:', dealerTotal);

    await new Promise(r => setTimeout(r, 300));

    if (dealerTotal > 21) {
      // Dealer busts
      const winAmount = bet * 2;
      await blackjackTransaction('win', winAmount, { result: 'dealer_bust', player_total: playerTotal, dealer_total: dealerTotal });
      setLastWin(winAmount);
      setMessage('DEALER BUSTS! YOU WIN!');
      winSoundRef.current?.play().catch(() => {});
    } else if (playerTotal > dealerTotal) {
      // Player wins
      const winAmount = bet * 2;
      await blackjackTransaction('win', winAmount, { result: 'player_wins', player_total: playerTotal, dealer_total: dealerTotal });
      setLastWin(winAmount);
      setMessage('YOU WIN!');
      winSoundRef.current?.play().catch(() => {});
    } else if (playerTotal < dealerTotal) {
      // Dealer wins
      setMessage('DEALER WINS!');
      // Silent on loss
    } else {
      // Push
      await blackjackTransaction('refund', bet, { result: 'push', total: playerTotal });
      setMessage('PUSH! BET RETURNED');
      winSoundRef.current?.play().catch(() => {});
    }

    setGamePhase('result');
    setIsAnimating(false);
  }, [gamePhase, isAnimating, deck, dealerHand, playerHand, bet]);

  // Keep ref updated with latest stand function
  useEffect(() => {
    standRef.current = stand;
  }, [stand]);

  const newGame = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setShowDealerCard(false);
    setLastWin(0);
    setMessage('PLACE YOUR BET!');
    setGamePhase('betting');
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCard = (card: Card | null, faceDown = false, index: number) => (
    <div
      key={index}
      className="relative transition-all duration-200"
      style={{
        width: window.innerWidth < 768 ? '55px' : '65px',
        height: window.innerWidth < 768 ? '77px' : '91px',
        marginLeft: index > 0 ? (window.innerWidth < 768 ? '-20px' : '-25px') : '0',
        flexShrink: 0,
      }}
    >
      <div
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          border: '2px solid #333',
          boxShadow: '3px 3px 6px rgba(0,0,0,0.5)',
          background: faceDown ? '#1a237e' : '#fff',
        }}
      >
        {card && !faceDown ? (
          <img
            src={getCardSvgUrl(card)}
            alt={`${card.rank} of ${card.suit}`}
            className="w-full h-full object-contain"
            style={{ background: '#fff' }}
            draggable={false}
          />
        ) : (
          <img
            src="/cards/RED_BACK.svg"
            alt="Card back"
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
      </div>
    </div>
  );

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="w-full h-full flex flex-col p-3 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #006400 0%, #004d00 100%)',
        fontFamily: '"Press Start 2P", monospace',
        minHeight: '100%',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Header - Dealer Section */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '3px solid #ffd700',
        }}
      >
        <div className="text-center mb-2" style={{ color: '#ffd700', fontSize: window.innerWidth < 768 ? '8px' : '10px' }}>
          DEALER {showDealerCard ? `(${dealerValue.total})` : '(??)'}
        </div>
        <div className="flex justify-center items-center min-h-[100px]" style={{ overflow: 'hidden' }}>
          {dealerHand.length > 0 ? (
            <div className="flex" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {dealerHand.map((card, i) => renderCard(card, i === 0 && !showDealerCard, i))}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">Waiting for deal...</div>
          )}
        </div>
      </div>

      {/* Message Display */}
      <div
        className="text-center py-3 mb-3"
        style={{
          color: lastWin > 0 ? '#00ff00' : '#ffd700',
          fontSize: window.innerWidth < 768 ? '10px' : '14px',
          textShadow: lastWin > 0 
            ? '0 0 10px #00ff00' 
            : '2px 2px 0 #000',
          animation: lastWin > 0 ? 'blink 0.5s ease-in-out infinite' : 'none',
        }}
      >
        {message}
        {lastWin > 0 && <div className="mt-1" style={{ fontSize: window.innerWidth < 768 ? '12px' : '18px' }}>+{lastWin} GUM!</div>}
      </div>

      {/* Player Section */}
      <div
        className="rounded-lg p-3 mb-3 flex-1"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '3px solid #ffd700',
        }}
      >
        <div className="text-center mb-2" style={{ color: '#ffd700', fontSize: window.innerWidth < 768 ? '8px' : '10px' }}>
          YOUR HAND {playerHand.length > 0 ? `(${playerValue.total}${playerValue.soft ? ' soft' : ''})` : ''}
        </div>
        <div className="flex justify-center items-center min-h-[100px]" style={{ overflow: 'hidden' }}>
          {playerHand.length > 0 ? (
            <div className="flex" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {playerHand.map((card, i) => renderCard(card, false, i))}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">Press DEAL to start</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Bet Selector */}
        {gamePhase === 'betting' && (
          <div className="flex justify-center gap-2">
            {BET_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setBet(amount)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: bet === amount ? '3px solid #fff' : '2px solid #ffd700',
                  background: bet === amount ? '#ffd700' : '#333',
                  color: bet === amount ? '#000' : '#ffd700',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        )}

        {/* Game Buttons */}
        <div className="flex justify-center gap-3">
          {gamePhase === 'betting' && (
            <button
              onClick={startNewHand}
              disabled={isAnimating || effectiveBalance < bet}
              className="transition-all duration-100"
              style={{
                padding: window.innerWidth < 768 ? '8px 16px' : '12px 32px',
                borderRadius: '4px',
                border: '3px solid #000',
                borderStyle: 'outset',
                background: effectiveBalance < bet ? '#666' : '#e0c725',
                color: '#000',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: window.innerWidth < 768 ? '10px' : '14px',
                cursor: effectiveBalance < bet ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
              }}
            >
              DEAL
            </button>
          )}

          {gamePhase === 'playing' && (
            <>
              <button
                onClick={hit}
                disabled={isAnimating}
                style={{
                  padding: window.innerWidth < 768 ? '8px 12px' : '12px 24px',
                  borderRadius: '4px',
                  border: '3px solid #000',
                  borderStyle: 'outset',
                  background: '#4CAF50',
                  color: '#fff',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                HIT
              </button>
              <button
                onClick={stand}
                disabled={isAnimating}
                style={{
                  padding: window.innerWidth < 768 ? '8px 12px' : '12px 24px',
                  borderRadius: '4px',
                  border: '3px solid #000',
                  borderStyle: 'outset',
                  background: '#f44336',
                  color: '#fff',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                STAND
              </button>
            </>
          )}

          {gamePhase === 'result' && (
            <button
              onClick={newGame}
              style={{
                padding: window.innerWidth < 768 ? '8px 16px' : '12px 32px',
                borderRadius: '4px',
                border: '3px solid #000',
                borderStyle: 'outset',
                background: '#e0c725',
                color: '#000',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: window.innerWidth < 768 ? '10px' : '14px',
                cursor: 'pointer',
                boxShadow: '0 0 0 1px #9e9f27, 0 0 0 3px black',
              }}
            >
              NEW HAND
            </button>
          )}
        </div>

        {/* Balance Display */}
        <div
          className="grid grid-cols-3 text-center"
          style={{ fontSize: '10px', color: '#ffd700' }}
        >
          <div>
            <div>BET</div>
            <div className="text-lg">{bet}</div>
          </div>
          <div>
            <div>WIN</div>
            <div className="text-lg" style={{ color: lastWin > 0 ? '#00ff00' : '#ffd700' }}>
              {lastWin}
            </div>
          </div>
          <div>
            <div>CREDIT</div>
            <div className="text-lg">{effectiveBalance}{isDemoMode && ' 🎮'}</div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Blackjack;
