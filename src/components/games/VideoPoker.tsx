import { useState, useEffect, useRef, useCallback } from 'react';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_COLORS: { [key: string]: string } = {
  '♠': '#000',
  '♥': '#ff0000',
  '♦': '#ff0000',
  '♣': '#000',
};

interface Card {
  suit: string;
  value: string;
  held: boolean;
}

// Payout table structure - matches classic Jacks or Better
// Format: [1 coin, 2 coins, 3 coins, 4 coins, 5 coins (max bet bonus)]
const PAYOUT_TABLE = {
  'ROYAL_FLUSH':     { name: 'ROYAL FLUSH',     payouts: [250, 500, 750, 1000, 4000] },
  'STRAIGHT_FLUSH':  { name: 'STRAIGHT FLUSH',  payouts: [50, 100, 150, 200, 250] },
  'FOUR_OF_A_KIND':  { name: 'FOUR OF A KIND',  payouts: [25, 50, 75, 100, 125] },
  'FULL_HOUSE':      { name: 'FULL HOUSE',      payouts: [9, 18, 27, 36, 45] },
  'FLUSH':           { name: 'FLUSH',           payouts: [6, 12, 18, 24, 30] },
  'STRAIGHT':        { name: 'STRAIGHT',        payouts: [4, 8, 12, 16, 20] },
  'THREE_OF_A_KIND': { name: 'THREE OF A KIND', payouts: [3, 6, 9, 12, 15] },
  'TWO_PAIR':        { name: 'TWO PAIR',        payouts: [2, 4, 6, 8, 10] },
  'JACKS_OR_BETTER': { name: 'JACKS OR BETTER', payouts: [1, 2, 3, 4, 5] },
};

// Bet levels in GUM (1 coin = 10 GUM)
const BET_LEVELS = [10, 20, 30, 40, 50];

const HAND_NAMES: { [key: string]: string } = {
  'ROYAL_FLUSH': '👑 ROYAL FLUSH!',
  'STRAIGHT_FLUSH': '🌟 Straight Flush!',
  'FOUR_OF_A_KIND': '💎 Four of a Kind!',
  'FULL_HOUSE': '🏠 Full House!',
  'FLUSH': '🃏 Flush!',
  'STRAIGHT': '📈 Straight!',
  'THREE_OF_A_KIND': '🎯 Three of a Kind!',
  'TWO_PAIR': '✌️ Two Pair!',
  'JACKS_OR_BETTER': '👑 Jacks or Better!',
  'NOTHING': '❌ No Win',
};

interface VideoPokerProps {
  onClose?: () => void;
  walletAddress?: string;
  gumBalance?: number;
  onGumChange?: (amount: number) => void;
}

const VideoPoker: React.FC<VideoPokerProps> = ({ 
  onClose, 
  walletAddress,
  gumBalance = 0,
  onGumChange 
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [betLevel, setBetLevel] = useState(0); // 0-4 for the 5 bet levels
  const [gamePhase, setGamePhase] = useState<'betting' | 'holding' | 'result'>('betting');
  const [lastWin, setLastWin] = useState(0);
  const [handResult, setHandResult] = useState('');
  const [message, setMessage] = useState('Select your bet and DEAL!');
  const [isDealing, setIsDealing] = useState(false);
  
  const bet = BET_LEVELS[betLevel];
  
  // Audio refs
  const dealSoundRef = useRef<HTMLAudioElement | null>(null);
  const holdSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sounds
    dealSoundRef.current = new Audio('/sounds/ding.mp3');
    holdSoundRef.current = new Audio('/sounds/bubble.mp3');
    winSoundRef.current = new Audio('/sounds/correct.mp3');
    loseSoundRef.current = new Audio('/sounds/incorrect.mp3');

    return () => {
      [dealSoundRef, holdSoundRef, winSoundRef, loseSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);

  // Create and shuffle deck
  const createDeck = useCallback((): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        newDeck.push({ suit, value, held: false });
      }
    }
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }, []);

  // Get numeric value of card for hand evaluation
  const getCardValue = (value: string): number => {
    if (value === 'A') return 14;
    if (value === 'K') return 13;
    if (value === 'Q') return 12;
    if (value === 'J') return 11;
    return parseInt(value);
  };

  // Evaluate the hand
  const evaluateHand = useCallback((cards: Card[]): string => {
    const values = cards.map(c => getCardValue(c.value)).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const valueCounts: { [key: number]: number } = {};
    
    values.forEach(v => {
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    });
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1) ||
                       (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14); // Ace-low straight
    
    // Royal Flush
    if (isFlush && isStraight && values[0] === 10) {
      return 'ROYAL_FLUSH';
    }
    
    // Straight Flush
    if (isFlush && isStraight) {
      return 'STRAIGHT_FLUSH';
    }
    
    // Four of a Kind
    if (counts[0] === 4) {
      return 'FOUR_OF_A_KIND';
    }
    
    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
      return 'FULL_HOUSE';
    }
    
    // Flush
    if (isFlush) {
      return 'FLUSH';
    }
    
    // Straight
    if (isStraight) {
      return 'STRAIGHT';
    }
    
    // Three of a Kind
    if (counts[0] === 3) {
      return 'THREE_OF_A_KIND';
    }
    
    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      return 'TWO_PAIR';
    }
    
    // Jacks or Better (pair of Jacks, Queens, Kings, or Aces)
    if (counts[0] === 2) {
      const pairValue = parseInt(Object.keys(valueCounts).find(k => valueCounts[parseInt(k)] === 2) || '0');
      if (pairValue >= 11) {
        return 'JACKS_OR_BETTER';
      }
    }
    
    return 'NOTHING';
  }, []);

  // Deal new hand
  const deal = useCallback(async () => {
    if (gumBalance < bet) {
      setMessage('❌ Not enough GUM! Get more at other locations.');
      return;
    }
    
    if (gamePhase !== 'betting') return;
    
    setIsDealing(true);
    onGumChange?.(-bet);
    
    // Create fresh deck and deal 5 cards
    const newDeck = createDeck();
    const newHand = newDeck.slice(0, 5);
    setDeck(newDeck.slice(5));
    
    // Animate dealing
    dealSoundRef.current?.play().catch(() => {});
    
    setHand([]);
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setHand(prev => [...prev, newHand[i]]);
    }
    
    setGamePhase('holding');
    setMessage('Select cards to HOLD, then draw!');
    setIsDealing(false);
  }, [gumBalance, bet, gamePhase, onGumChange, createDeck]);

  // Toggle hold on a card
  const toggleHold = (index: number) => {
    if (gamePhase !== 'holding') return;
    
    holdSoundRef.current?.play().catch(() => {});
    
    setHand(prev => prev.map((card, i) => 
      i === index ? { ...card, held: !card.held } : card
    ));
  };

  // Draw new cards
  const draw = useCallback(async () => {
    if (gamePhase !== 'holding') return;
    
    setIsDealing(true);
    dealSoundRef.current?.play().catch(() => {});
    
    let deckIndex = 0;
    const newHand = hand.map(card => {
      if (card.held) return card;
      return { ...deck[deckIndex++], held: false };
    });
    
    // Animate card replacement
    for (let i = 0; i < 5; i++) {
      if (!hand[i].held) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setHand(prev => prev.map((c, idx) => idx === i ? newHand[i] : c));
      }
    }
    
    // Evaluate final hand
    const result = evaluateHand(newHand);
    const payoutData = PAYOUT_TABLE[result as keyof typeof PAYOUT_TABLE];
    const winAmount = payoutData ? payoutData.payouts[betLevel] * 10 : 0; // Multiply by 10 for GUM
    
    setHandResult(result);
    setLastWin(winAmount);
    
    if (winAmount > 0) {
      onGumChange?.(winAmount);
      winSoundRef.current?.play().catch(() => {});
      setMessage(`${HAND_NAMES[result]} You won ${winAmount} GUM!`);
    } else {
      loseSoundRef.current?.play().catch(() => {});
      setMessage(HAND_NAMES[result]);
    }
    
    setGamePhase('result');
    setIsDealing(false);
  }, [gamePhase, hand, deck, bet, evaluateHand, onGumChange]);

  // Start new game
  const newGame = () => {
    setHand([]);
    setLastWin(0);
    setHandResult('');
    setMessage('Place your bet and deal!');
    setGamePhase('betting');
  };

  // Render a single card
  const renderCard = (card: Card | null, index: number) => {
    const isEmpty = !card;
    const isHeld = card?.held;
    
    return (
      <div 
        key={index}
        onClick={() => card && toggleHold(index)}
        className="relative cursor-pointer transition-all duration-200"
        style={{
          width: '80px',
          height: '120px',
          transform: isHeld ? 'translateY(-10px)' : 'none',
        }}
      >
        {/* HOLD indicator */}
        {isHeld && (
          <div 
            className="absolute -top-6 left-0 right-0 text-center text-xs font-bold"
            style={{ color: '#00ff00', textShadow: '0 0 5px #00ff00' }}
          >
            HOLD
          </div>
        )}
        
        {/* Card */}
        <div
          className="w-full h-full rounded-lg flex flex-col items-center justify-center"
          style={{
            background: isEmpty 
              ? 'linear-gradient(135deg, #1a3a5c 0%, #0d1f30 100%)' 
              : 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
            border: isHeld 
              ? '3px solid #00ff00' 
              : '3px solid #333',
            boxShadow: isHeld 
              ? '0 0 15px rgba(0, 255, 0, 0.5)' 
              : '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          {card && (
            <>
              <div 
                className="text-2xl font-bold"
                style={{ color: SUIT_COLORS[card.suit] }}
              >
                {card.value}
              </div>
              <div 
                className="text-3xl"
                style={{ color: SUIT_COLORS[card.suit] }}
              >
                {card.suit}
              </div>
            </>
          )}
          {isEmpty && (
            <div className="text-4xl opacity-30">🃏</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a2a1a 0%, #1a4a2a 50%, #0a2a1a 100%)',
        minHeight: '550px',
      }}
    >
      {/* Payout Odds Reference - Above Game Table */}
      <div 
        className="mb-3 p-3 rounded-lg max-w-lg w-full"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #ffd700',
        }}
      >
        <div 
          className="text-center mb-2 font-bold"
          style={{ color: '#ffd700', fontSize: '14px' }}
        >
          PAYOUT ODDS → ACTUAL PAYOUT
        </div>
        <div 
          className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs"
          style={{ color: '#ffd700' }}
        >
          <div>Royal Flush: <span style={{ color: '#ff0000' }}>250x</span> → <span style={{ color: '#00ff00' }}>2,500</span></div>
          <div>Straight Flush: <span style={{ color: '#ff0000' }}>50x</span> → <span style={{ color: '#00ff00' }}>500</span></div>
          <div>4 of a Kind: <span style={{ color: '#ff0000' }}>25x</span> → <span style={{ color: '#00ff00' }}>250</span></div>
          <div>Full House: <span style={{ color: '#ff0000' }}>9x</span> → <span style={{ color: '#00ff00' }}>90</span></div>
          <div>Flush: <span style={{ color: '#ff0000' }}>6x</span> → <span style={{ color: '#00ff00' }}>60</span></div>
          <div>Straight: <span style={{ color: '#ff0000' }}>4x</span> → <span style={{ color: '#00ff00' }}>40</span></div>
          <div>3 of a Kind: <span style={{ color: '#ff0000' }}>3x</span> → <span style={{ color: '#00ff00' }}>30</span></div>
          <div>Two Pair: <span style={{ color: '#ff0000' }}>2x</span> → <span style={{ color: '#00ff00' }}>20</span></div>
          <div>Jacks+: <span style={{ color: '#ff0000' }}>1x</span> → <span style={{ color: '#00ff00' }}>10</span></div>
        </div>
        <div 
          className="text-center mt-2 text-xs"
          style={{ color: '#888' }}
        >
          (Based on 10 GUM bet • Higher bets = proportional payouts)
        </div>
      </div>

      {/* Game Table */}
      <div 
        className="relative p-6 rounded-2xl max-w-lg w-full"
        style={{
          background: 'linear-gradient(180deg, #1a5a3a 0%, #0d3d25 100%)',
          border: '8px solid #8B4513',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Title */}
        <div 
          className="text-center mb-2"
          style={{
            fontFamily: 'Cooper Black, Georgia, serif',
            fontSize: '20px',
            color: '#ffd700',
            textShadow: '2px 2px 4px #000',
          }}
        >
          🃏 JACKS OR BETTER 🃏
        </div>

        {/* Classic Payout Table */}
        <div 
          className="mb-3 rounded overflow-hidden"
          style={{
            background: '#000',
            border: '3px solid #ffd700',
          }}
        >
          {/* Header row with bet amounts */}
          <div 
            className="grid text-center font-bold text-xs"
            style={{ 
              gridTemplateColumns: '1fr repeat(5, 50px)',
              background: '#1a1a1a',
              borderBottom: '2px solid #ffd700',
            }}
          >
            <div style={{ padding: '4px', color: '#ffd700' }}>PAYOUT ODDS</div>
            {BET_LEVELS.map((level, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '4px',
                  color: betLevel === idx ? '#ff0000' : '#ffd700',
                  background: betLevel === idx ? '#ffd700' : 'transparent',
                  fontWeight: betLevel === idx ? 'bold' : 'normal',
                }}
              >
                {level}
              </div>
            ))}
          </div>
          
          {/* Payout rows */}
          {Object.entries(PAYOUT_TABLE).map(([key, data]) => (
            <div 
              key={key}
              className="grid text-center text-xs"
              style={{ 
                gridTemplateColumns: '1fr repeat(5, 50px)',
                borderBottom: '1px solid #333',
                background: handResult === key ? 'rgba(0, 255, 0, 0.3)' : 'transparent',
              }}
            >
              <div 
                style={{ 
                  padding: '3px 6px', 
                  color: '#ffd700',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.name}
              </div>
              {data.payouts.map((payout, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    padding: '3px',
                    color: idx === 4 ? '#ff0000' : '#ffd700', // Max bet column in red
                    background: betLevel === idx ? (idx === 4 ? '#ff0000' : '#ffd700') : 'transparent',
                    fontWeight: betLevel === idx ? 'bold' : 'normal',
                  }}
                >
                  <span style={{ color: betLevel === idx ? '#000' : undefined }}>
                    {payout * 10}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Cards */}
        <div 
          className="flex justify-center gap-2 mb-3 p-3 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            minHeight: '140px',
          }}
        >
          {[0, 1, 2, 3, 4].map(i => renderCard(hand[i] || null, i))}
        </div>

        {/* Message Display */}
        <div 
          className="text-center p-2 rounded-lg mb-3"
          style={{
            background: '#000',
            border: '2px solid #ffd700',
            color: lastWin > 0 ? '#00ff00' : '#ffd700',
            fontFamily: 'monospace',
            fontSize: '14px',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: lastWin > 0 ? '0 0 10px #00ff00' : 'none',
          }}
        >
          {message}
        </div>

        {/* Bet Level Selector - Classic coin style */}
        {gamePhase === 'betting' && (
          <div className="mb-3">
            <div className="flex justify-center gap-2">
              {BET_LEVELS.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => setBetLevel(idx)}
                  className="transition-all duration-200"
                  style={{
                    width: '50px',
                    height: '40px',
                    borderRadius: '8px',
                    border: betLevel === idx ? '3px solid #fff' : '2px solid #ffd700',
                    background: betLevel === idx 
                      ? (idx === 4 ? 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)' : 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)')
                      : 'linear-gradient(180deg, #333 0%, #111 100%)',
                    color: betLevel === idx ? '#fff' : '#ffd700',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: betLevel === idx ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
                    transform: betLevel === idx ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="text-center mt-2" style={{ color: '#ffd700', fontSize: '12px' }}>
              {betLevel === 4 ? '⭐ MAX BET - Royal Flush Bonus! ⭐' : `Bet: ${bet} GUM`}
            </div>
          </div>
        )}

        {/* GUM Balance */}
        <div 
          className="text-center mb-3 p-2 rounded"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#ffd700',
            fontFamily: 'monospace',
          }}
        >
          💰 Balance: {gumBalance} GUM
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {gamePhase === 'betting' && (
            <button
              onClick={deal}
              disabled={isDealing || gumBalance < bet}
              className="flex-1 py-4 rounded-xl font-black text-xl transition-all duration-300"
              style={{
                background: gumBalance < bet 
                  ? 'linear-gradient(180deg, #555 0%, #333 100%)'
                  : 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Cooper Black, Georgia, serif',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.3), 0 5px 0 #1B5E20',
                cursor: gumBalance < bet ? 'not-allowed' : 'pointer',
                opacity: gumBalance < bet ? 0.5 : 1,
              }}
            >
              🃏 DEAL 🃏
            </button>
          )}
          
          {gamePhase === 'holding' && (
            <button
              onClick={draw}
              disabled={isDealing}
              className="flex-1 py-4 rounded-xl font-black text-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(180deg, #ff6b35 0%, #f7931e 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Cooper Black, Georgia, serif',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.5), 0 5px 0 #cc5500',
              }}
            >
              🃏 DRAW 🃏
            </button>
          )}
          
          {gamePhase === 'result' && (
            <button
              onClick={newGame}
              className="flex-1 py-4 rounded-xl font-black text-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(180deg, #2196F3 0%, #1565C0 100%)',
                border: '4px solid #ffd700',
                color: 'white',
                fontFamily: 'Cooper Black, Georgia, serif',
                boxShadow: '0 0 20px rgba(33, 150, 243, 0.5), 0 5px 0 #0D47A1',
              }}
            >
              🔄 NEW GAME 🔄
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPoker;
