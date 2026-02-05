/**
 * SlotsGame - Embeddable slot machine component
 * Renders the slots-play page content inside a component for use in windows
 */

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getTotalWin, PAYLINES, FLUNKS_SYMBOLS } from '../../lib/slots/flunksPaytable';
import { processCasinoTransaction } from '../../utils/casinoTransactions';
import { useDemoModeOptional, isIOSPlatform } from '../../contexts/DemoModeContext';

// Vegas-style weighted symbol distribution for client-side spins
const SYMBOL_WEIGHTS: { [key: string]: number } = {
  pencil: 8,        // Common - 21%
  eraser: 7,        // Common - 18%
  notebook: 6,      // Common - 16%
  backpack: 5,      // Uncommon - 13%
  calculator: 4,    // Uncommon - 11%
  trophy: 3,        // Rare - 8%
  diploma: 2,       // Rare - 5%
  gum_pile: 2,      // Epic - 5%
  flunks_logo: 1    // Jackpot - 2.6%
};

// Create weighted array for random selection
const WEIGHTED_SYMBOLS: string[] = [];
Object.entries(SYMBOL_WEIGHTS).forEach(([symbol, weight]) => {
  for (let i = 0; i < weight; i++) {
    WEIGHTED_SYMBOLS.push(symbol);
  }
});

// Generate random symbol from weighted distribution
function getRandomWeightedSymbol(): string {
  return WEIGHTED_SYMBOLS[Math.floor(Math.random() * WEIGHTED_SYMBOLS.length)];
}

// Generate a 3x3 grid of symbols (3 rows, 3 cols)
function generateSpinGrid(): string[][] {
  const grid: string[][] = [];
  for (let row = 0; row < 3; row++) {
    const rowSymbols: string[] = [];
    for (let col = 0; col < 3; col++) {
      rowSymbols.push(getRandomWeightedSymbol());
    }
    grid.push(rowSymbols);
  }
  return grid;
}

// Types
interface SlotsGameProps {
  walletAddress?: string;
  initialBalance?: number;
  onBalanceUpdate?: (newBalance: number) => void;
  onClose?: () => void;
}

// Symbol keys from the paytable (with fallbacks)
const SYMBOL_KEYS = Object.keys(FLUNKS_SYMBOLS);
const getSymbolKey = (index: number): string => SYMBOL_KEYS[index] || 'pencil';

// Styled components
const SlotContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 5px;
  padding-bottom: 10%;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
  height: 100%;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 2px;
    padding-bottom: 10%;
    overflow: hidden;
  }
`;

const SlotsGame: React.FC<SlotsGameProps> = ({
  walletAddress,
  initialBalance = 0,
  onBalanceUpdate,
  onClose
}) => {
  const demoMode = useDemoModeOptional();
  const isDemoMode = isIOSPlatform() && (demoMode?.isDemoMode || false);
  
  // Debug: Log demo mode status on mount
  useEffect(() => {
    console.log('🎰 [SlotsGame] Demo mode check:', {
      isIOSPlatform: isIOSPlatform(),
      contextIsDemoMode: demoMode?.isDemoMode,
      finalIsDemoMode: isDemoMode,
      demoBalance: demoMode?.demoBalance
    });
  }, [isDemoMode, demoMode?.isDemoMode, demoMode?.demoBalance]);

  // State - use demo balance if in demo mode
  const effectiveInitialBalance = isDemoMode ? (demoMode?.demoBalance ?? 1000) : initialBalance;
  const [gumBalance, setGumBalance] = useState(effectiveInitialBalance);
  const [reels, setReels] = useState<string[][]>([
    [getSymbolKey(0), getSymbolKey(1), getSymbolKey(2)],
    [getSymbolKey(3), getSymbolKey(4), getSymbolKey(5)],
    [getSymbolKey(6), getSymbolKey(7), getSymbolKey(8)],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(15);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [message, setMessage] = useState('');
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([false, false, false]);

  // Update balance from prop or demo mode
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
        console.log('🎰 [SlotsGame] External balance update:', event.detail.balance);
        setGumBalance(event.detail.balance);
      }
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    return () => {
      window.removeEventListener('gumBalanceUpdated', handleGumUpdate as EventListener);
    };
  }, [isDemoMode]);

  // Slot transaction helper
  const slotTransaction = async (type: 'bet' | 'win' | 'refund', amount: number, metadata?: any) => {
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

    if (!walletAddress) return { success: false, error: 'No wallet connected' };
    
    const result = await processCasinoTransaction(walletAddress, type, amount, 'slots', metadata);
    
    if (result.success && result.new_balance !== undefined) {
      setGumBalance(result.new_balance);
      onBalanceUpdate?.(result.new_balance);
      console.log(`🎰 ${type}: Updated balance to ${result.new_balance}`);
    }
    
    return result;
  };

  const spinReels = async () => {
    if (spinning) return;
    
    if (gumBalance < bet) {
      setMessage('Not enough GUM! 💔');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    if (!walletAddress && !isDemoMode) {
      setMessage('Connect wallet to play! 🔗');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    setSpinning(true);
    setShowWin(false);
    setStoppedReels([false, false, false]);
    
    // Spend GUM for the bet
    const spendResult = await slotTransaction('bet', bet, { bet_amount: bet });
    if (!spendResult.success) {
      setMessage(spendResult.error || 'Failed to place bet! Try again.');
      setSpinning(false);
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    // Animate reels
    const spinDuration = 1500;
    const spinInterval = setInterval(() => {
      const randomGrid: string[][] = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => 
          getSymbolKey(Math.floor(Math.random() * SYMBOL_KEYS.length))
        )
      );
      setReels(randomGrid);
    }, 100);
    
    try {
      // Client-side spin calculation (no API needed)
      const grid = generateSpinGrid();
      const winCalc = getTotalWin(grid, bet);
      const result = {
        screen: grid,
        gain: winCalc.totalWin,
        lines: winCalc.paylineWins
      };
      console.log('🎰 Spin result:', result);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        
        // Use result from serverless API
        const gridByRows = result.screen;
        
        // Transpose to columns for display
        const finalGrid: string[][] = Array(3).fill(null).map((_, col) => 
          Array(3).fill(null).map((_, row) => gridByRows[row][col])
        );
        
        // Reveal reels one by one
        const revealDelay = 300;
        finalGrid.forEach((column, colIndex) => {
          setTimeout(() => {
            setReels(prevReels => {
              const newReels = [...prevReels];
              newReels[colIndex] = column;
              return newReels;
            });
            setStoppedReels(prev => {
              const newStopped = [...prev];
              newStopped[colIndex] = true;
              return newStopped;
            });
          }, colIndex * revealDelay);
        });
        
        // Process win
        const winResult = {
          totalWin: result.gain || 0,
          paylineWins: result.lines || [],
        };
        
        const totalRevealTime = finalGrid.length * revealDelay + 200;
        setTimeout(async () => {
          if (winResult.totalWin > 0) {
            const totalGain = Math.floor(winResult.totalWin);
            setWinAmount(totalGain);
            setShowWin(true);
            
            if (totalGain > 0) {
              await slotTransaction('win', totalGain, { 
                win_amount: totalGain, 
                bet_amount: bet,
                multiplier: totalGain / bet 
              });
            }
            
            setMessage(`🎉 WIN ${totalGain} GUM!`);
            
            setTimeout(() => {
              setShowWin(false);
              setMessage('');
            }, 4000);
          } else {
            setMessage('Try again!');
            setTimeout(() => setMessage(''), 2000);
          }
          
          setSpinning(false);
        }, totalRevealTime);
      }, spinDuration);
      
    } catch (error) {
      console.error('Spin error:', error);
      setSpinning(false);
      await slotTransaction('refund', bet, { reason: 'spin_error' });
      setMessage('Error - bet refunded');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const adjustBet = (delta: number) => {
    setBet(prev => Math.max(5, Math.min(25, prev + delta)));
  };

  // Symbol images mapping (same as slots-play.tsx)
  const SYMBOL_IMAGES: { [key: string]: string } = {
    pencil: '/images/icons/slot-icons/cd.png',
    eraser: '/images/icons/slot-icons/vhs.png',
    notebook: '/images/icons/slot-icons/walkman.png',
    backpack: '/images/icons/slot-icons/pogs.png',
    calculator: '/images/icons/slot-icons/talkboy.png',
    trophy: '/images/icons/slot-icons/sun.png',
    diploma: '/images/icons/slot-icons/hoverboard.png',
    gum_pile: '/images/icons/slot-icons/powerglove.png',
    flunks_logo: '/images/icons/slot-icons/jackpot.png',
    scatter_keyhole: '/images/icons/slot-icons/freespin.png',
    flunk_basic: '/images/icons/slot-icons/cd.png',
    flunk_evolved: '/images/icons/slot-icons/sun.png',
    golden_ticket: '/images/icons/slot-icons/jackpot.png',
    wild_flunk: '/images/icons/slot-icons/powerglove.png',
  };

  // Render symbol image
  const getSymbolImage = (symbolKey: string) => {
    return SYMBOL_IMAGES[symbolKey] || '/slots/images/beetle.png';
  };

  return (
    <SlotContent>
      {/* Win/Message display - positioned in the open area above GUM */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '13%',
          left: '50%',
          transform: showWin ? 'translateX(-50%) scale(1)' : 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 24px',
          borderRadius: '12px',
          background: showWin 
            ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 165, 0, 0.9) 100%)'
            : 'linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(30, 30, 30, 0.85) 100%)',
          border: showWin ? '3px solid #ffd700' : '2px solid #fbbf24',
          color: showWin ? '#1a1a1a' : '#fbbf24',
          fontFamily: "'Lilita One', cursive",
          fontSize: showWin ? '1.6em' : '1.3em',
          fontWeight: 'bold',
          textShadow: showWin 
            ? '0 0 10px rgba(255, 255, 255, 0.5)'
            : '0 0 10px rgba(251, 191, 36, 0.5), 1px 1px 0 #b45309',
          textAlign: 'center',
          transformOrigin: 'center',
          animation: showWin ? 'winPulse 0.5s ease-in-out infinite' : 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          {message}
        </div>
      )}

      {/* Slot Machine Frame */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '380px',
        margin: '0 auto',
      }}>
        {/* Reels container - positioned BEHIND the frame */}
        <div style={{
          position: 'absolute',
          top: '48%',
          left: '5%',
          width: '90%',
          height: '38%',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '2%'
        }}>
          {reels.map((column, colIndex) => (
            <div 
              key={colIndex}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                borderRadius: '6px'
              }}
            >
              {column.map((symbol, rowIndex) => (
                <img 
                  key={rowIndex}
                  src={getSymbolImage(symbol)}
                  alt={symbol}
                  style={{
                    width: '70%',
                    height: 'auto',
                    maxHeight: '30%',
                    objectFit: 'contain',
                    transition: stoppedReels[colIndex] ? 'transform 0.2s' : 'none',
                  }}
                  draggable={false}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Frame background image - ON TOP of the reels */}
        <img 
          src="/slots/images/slot-machine.png"
          alt="Slot Machine"
          style={{ 
            width: '100%', 
            height: 'auto',
            position: 'relative',
            zIndex: 2,
            pointerEvents: 'none',
            marginBottom: '-8%', // Push image up so buttons align with visual buttons
          }}
          draggable={false}
        />
        
        {/* GUM Balance display - positioned in the dark pill area */}
        <div style={{
          position: 'absolute',
          top: '16.7%',
          left: '59.5%',
          width: '25%',
          height: '4%',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fbbf24',
          fontFamily: "'Lilita One', cursive",
          fontSize: '1.4em',
          fontWeight: 'normal',
          textShadow: '0 0 5px rgba(251, 191, 36, 0.5), 1px 1px 0 #b45309'
        }}>
          {gumBalance}
        </div>
        
        {/* Bet amount display - positioned in the dark circle */}
        <div style={{
          position: 'absolute',
          top: '28%',
          right: '11%',
          width: '14%',
          height: '9%',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fbbf24',
          fontFamily: "'Lilita One', cursive",
          fontSize: '1.6em',
          fontWeight: 'normal',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 2px 2px 0 #b45309'
        }}>
          {bet}
        </div>
        
        {/* Control buttons - positioned over the frame */}
        {/* -5 Button (left) */}
        <button
          onClick={() => { console.log('🔽 SlotsGame -5 clicked'); adjustBet(-5); }}
          style={{
            position: 'absolute',
            bottom: '11%',
            left: '5%',
            width: '22%',
            height: '14%',
            background: 'rgba(255,0,0,0.0)', // Debug: change to 0.3 to see touch area
            border: 'none',
            cursor: 'pointer',
            zIndex: 20,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        />
        
        {/* SPIN WHEEL Button (center) */}
        <button
          onClick={() => { console.log('🎰 SlotsGame SPIN clicked'); spinReels(); }}
          disabled={spinning || gumBalance < bet}
          style={{
            position: 'absolute',
            bottom: '11%',
            left: '27%',
            width: '46%',
            height: '14%',
            background: 'rgba(0,255,0,0.0)', // Debug: change to 0.3 to see touch area
            border: 'none',
            cursor: spinning || gumBalance < bet ? 'not-allowed' : 'pointer',
            opacity: spinning || gumBalance < bet ? 0.7 : 1,
            zIndex: 20,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        />
        
        {/* +5 Button (right) */}
        <button
          onClick={() => { console.log('🔼 SlotsGame +5 clicked'); adjustBet(5); }}
          style={{
            position: 'absolute',
            bottom: '11%',
            right: '5%',
            width: '22%',
            height: '14%',
            background: 'rgba(0,0,255,0.0)', // Debug: change to 0.3 to see touch area
            border: 'none',
            cursor: 'pointer',
            zIndex: 20,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        />
      </div>
      
      {!walletAddress && (
        <div style={{ 
          textAlign: 'center', 
          color: '#ff6b6b', 
          marginTop: '10px', 
          fontSize: '0.85em' 
        }}>
          Connect your wallet to play!
        </div>
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        
        @keyframes winPulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.05);
          }
        }
      `}</style>
    </SlotContent>
  );
};

export default SlotsGame;
