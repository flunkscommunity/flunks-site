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
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
`;

const WinMessage = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #ffd700;
  font-weight: bold;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 10;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  font-family: 'Lilita One', cursive;
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

  // Render symbol image
  const getSymbolImage = (symbolKey: string) => {
    const symbol = FLUNKS_SYMBOLS[symbolKey];
    return symbol?.image || '/images/slots/symbols/default.png';
  };

  return (
    <SlotContent>
      {/* Slot Machine Frame */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '380px',
      }}>
        {/* Frame background image */}
        <img 
          src="/images/slots/slot-machine-frame.png"
          alt="Slot Machine"
          style={{ width: '100%', height: 'auto' }}
          draggable={false}
        />
        
        {/* GUM Balance overlay */}
        <div style={{
          position: 'absolute',
          top: '6%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#ffd700',
          fontFamily: '"Lilita One", cursive',
          fontSize: '1.4rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: '#90EE90', fontWeight: 'bold' }}>GUM</span>
          <span style={{ 
            background: 'rgba(0,0,0,0.6)', 
            padding: '4px 12px', 
            borderRadius: '8px',
            border: '2px solid #ffd700'
          }}>
            {gumBalance}
          </span>
        </div>
        
        {/* Bet display */}
        <div style={{
          position: 'absolute',
          top: '6%',
          right: '10%',
          color: '#ffd700',
          fontFamily: '"Lilita One", cursive',
          fontSize: '1.2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 10px',
          borderRadius: '50%',
          border: '2px solid #ffd700',
        }}>
          {bet}
        </div>
        
        {/* Reels overlay */}
        <div style={{
          position: 'absolute',
          top: '31%',
          left: '12%',
          width: '73%',
          height: '35%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {reels.map((column, colIndex) => (
            <div key={colIndex} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: 'rgba(0,0,30,0.7)',
              borderRadius: '8px',
              padding: '4px',
            }}>
              {column.map((symbol, rowIndex) => (
                <div key={rowIndex} style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: stoppedReels[colIndex] 
                    ? 'rgba(50,30,80,0.8)' 
                    : 'rgba(30,20,60,0.6)',
                  borderRadius: '6px',
                  transition: 'background 0.3s',
                }}>
                  <img 
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    style={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                    }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Control buttons - positioned over the frame */}
        <button
          onClick={() => adjustBet(-5)}
          style={{
            position: 'absolute',
            top: '80%',
            left: '7%',
            width: '18%',
            height: '9%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        />
        
        <button
          onClick={spinReels}
          disabled={spinning || gumBalance < bet}
          style={{
            position: 'absolute',
            top: '83%',
            left: '14%',
            width: '34%',
            height: '11%',
            background: 'transparent',
            border: 'none',
            cursor: spinning || gumBalance < bet ? 'not-allowed' : 'pointer',
            opacity: spinning || gumBalance < bet ? 0.7 : 1,
          }}
        />
        
        <button
          onClick={() => adjustBet(5)}
          style={{
            position: 'absolute',
            top: '80%',
            left: '23%',
            width: '18%',
            height: '9%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
      
      {/* Win message */}
      <WinMessage show={showWin}>
        🎉 WIN! 🎉
      </WinMessage>

      {message && (
        <div style={{ 
          textAlign: 'center', 
          color: '#fbbf24', 
          marginTop: '10px', 
          fontSize: '0.9em',
          fontFamily: '"Lilita One", cursive',
        }}>
          {message}
        </div>
      )}
      
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
      `}</style>
    </SlotContent>
  );
};

export default SlotsGame;
