/**
 * SlotsGame - Embeddable slot machine component
 * Renders the slots-play page content inside a component for use in windows
 */

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getTotalWin, PAYLINES, FLUNKS_SYMBOLS } from '../../lib/slots/flunksPaytable';

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
  // State
  const [gumBalance, setGumBalance] = useState(initialBalance);
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

  // Update balance from prop
  useEffect(() => {
    setGumBalance(initialBalance);
  }, [initialBalance]);

  // Slot transaction helper
  const slotTransaction = async (type: 'bet' | 'win' | 'refund', amount: number, metadata?: any) => {
    if (!walletAddress) return { success: false, error: 'No wallet connected' };
    
    try {
      const response = await fetch('/api/slots/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, type, amount, metadata })
      });
      
      const result = await response.json();
      
      if (result.success && result.new_balance !== undefined) {
        setGumBalance(result.new_balance);
        onBalanceUpdate?.(result.new_balance);
        console.log(`🎰 ${type}: Updated balance to ${result.new_balance}`);
      }
      
      return result;
    } catch (error) {
      console.error('Slot transaction error:', error);
      return { success: false, error: 'Transaction failed' };
    }
  };

  const spinReels = async () => {
    if (spinning) return;
    
    if (gumBalance < bet) {
      setMessage('Not enough GUM! 💔');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    if (!walletAddress) {
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
      // Call serverless slot API
      const response = await fetch('/api/slots/spin-serverless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet, walletAddress }),
      });
      
      const result = await response.json();
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
      {/* Win/Message display - at the very top of the container */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          background: showWin 
            ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%)'
            : 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
          color: showWin ? '#ffd700' : '#fbbf24',
          fontFamily: "'Lilita One', cursive",
          fontSize: showWin ? '1.6em' : '1.3em',
          fontWeight: 'bold',
          textShadow: showWin 
            ? '0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 0 #b45309'
            : '0 0 10px rgba(251, 191, 36, 0.5), 1px 1px 0 #b45309',
          textAlign: 'center',
          animation: showWin ? 'pulse 0.5s ease-in-out infinite' : 'none'
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
            pointerEvents: 'none'
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
          onClick={() => adjustBet(-5)}
          style={{
            position: 'absolute',
            bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '25%' : '15%',
            left: '5%',
            width: '20%',
            height: '10%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
          }}
        />
        
        {/* SPIN WHEEL Button (center) */}
        <button
          onClick={spinReels}
          disabled={spinning || gumBalance < bet}
          style={{
            position: 'absolute',
            bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '25%' : '15%',
            left: '27%',
            width: '46%',
            height: '10%',
            background: 'transparent',
            border: 'none',
            cursor: spinning || gumBalance < bet ? 'not-allowed' : 'pointer',
            opacity: spinning || gumBalance < bet ? 0.7 : 1,
            zIndex: 10,
          }}
        />
        
        {/* +5 Button (right) */}
        <button
          onClick={() => adjustBet(5)}
          style={{
            position: 'absolute',
            bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '25%' : '15%',
            right: '5%',
            width: '20%',
            height: '10%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
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
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </SlotContent>
  );
};

export default SlotsGame;
