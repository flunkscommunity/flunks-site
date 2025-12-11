'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { processSlotSpin, getGumBalance } from '@/lib/slots/gumIntegration';

const SlotMachineContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 4px solid #ffd700;
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 20px;
    background: linear-gradient(90deg, #ff6b6b 0%, #ffd700 50%, #ff6b6b 100%);
    border-radius: 10px;
  }
`;

const SlotTitle = styled.h2`
  text-align: center;
  color: #ffd700;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  font-family: 'Courier New', monospace;
`;

const ReelsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
  perspective: 1000px;
`;

const Reel = styled.div<{ spinning: boolean }>`
  width: 120px;
  height: 360px;
  background: #000;
  border: 3px solid #ffd700;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.3);
  
  ${props => props.spinning && `
    animation: reelSpin 0.5s ease-in-out;
  `}
  
  @keyframes reelSpin {
    0% { transform: translateY(0); }
    50% { transform: translateY(-50px); }
    100% { transform: translateY(0); }
  }
`;

const ReelSymbols = styled.div<{ position: number; spinning: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  transition: ${props => props.spinning ? 'none' : 'transform 0.3s ease'};
  transform: translateY(${props => props.position * -120}px);
`;

const Symbol = styled.div`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a3e 100%);
  border-bottom: 2px solid #333;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
`;

const BalanceDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 2px solid #ffd700;
`;

const BalanceItem = styled.div`
  text-align: center;
  
  label {
    display: block;
    color: #ffd700;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
  
  span {
    display: block;
    color: #fff;
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const BetControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
`;

const BetButton = styled.button`
  padding: 10px 20px;
  background: #444;
  color: #ffd700;
  border: 2px solid #ffd700;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: #ffd700;
    color: #000;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BetAmount = styled.div`
  font-size: 2rem;
  color: #ffd700;
  font-weight: bold;
  min-width: 100px;
  text-align: center;
`;

const SpinButton = styled.button<{ canSpin: boolean }>`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${props => props.canSpin 
    ? 'linear-gradient(135deg, #ff6b6b 0%, #ff0000 100%)'
    : 'linear-gradient(135deg, #666 0%, #444 100%)'};
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  border: 6px solid ${props => props.canSpin ? '#ffd700' : '#888'};
  cursor: ${props => props.canSpin ? 'pointer' : 'not-allowed'};
  margin: 20px auto;
  display: block;
  transition: all 0.3s;
  box-shadow: 0 5px 20px ${props => props.canSpin 
    ? 'rgba(255, 107, 107, 0.5)' 
    : 'rgba(0, 0, 0, 0.3)'};
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.7);
  }
  
  &:active:not(:disabled) {
    transform: scale(1.05);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const WinDisplay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #ffd700;
  border-radius: 20px;
  padding: 40px 60px;
  font-size: 3rem;
  color: #ffd700;
  font-weight: bold;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 10;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
`;

interface FlunksSlotMachineProps {
  walletAddress: string;
  gameAlias?: string;
}

// Flunks-themed symbols
const SYMBOLS = ['🎓', '📚', '🏆', '⭐', '💎', '🔥', '🎯', '🎪'];

const FlunksSlotMachine: React.FC<FlunksSlotMachineProps> = ({
  walletAddress,
  gameAlias = 'Novomatic/Book of Ra Deluxe'
}) => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [gumBalance, setGumBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [reels, setReels] = useState<number[][]>([[0, 1, 2], [3, 4, 5], [6, 7, 0], [1, 2, 3], [4, 5, 6]]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [showWin, setShowWin] = useState<boolean>(false);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalSpins, setTotalSpins] = useState<number>(0);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        // Get GUM balance
        const balance = await getGumBalance(walletAddress);
        setGumBalance(balance);

        // Game uses serverless spin API now
        setGameId(1); // Default game ID
      } catch (error) {
        console.error('Failed to initialize slot game:', error);
      }
    };

    if (walletAddress) {
      initGame();
    }
  }, [walletAddress, gameAlias, betAmount]);

  const updateBet = (delta: number) => {
    const newBet = Math.max(1, Math.min(gumBalance, betAmount + delta));
    setBetAmount(newBet);
  };

  const spinReels = useCallback(async () => {
    if (!gameId || spinning || gumBalance < betAmount) return;

    setSpinning(true);
    setShowWin(false);
    setLastWin(0);

    try {
      // Process spin with GUM integration
      const result = await processSlotSpin(walletAddress, betAmount, gameId);

      if (!result.success) {
        console.error('Spin failed:', result.error);
        return;
      }

      // Animate reels
      const spinDuration = 2000;
      const spinInterval = 100;
      let elapsed = 0;

      const spinAnimation = setInterval(() => {
        setReels(prev => prev.map(reel => 
          reel.map(() => Math.floor(Math.random() * SYMBOLS.length))
        ));
        
        elapsed += spinInterval;
        if (elapsed >= spinDuration) {
          clearInterval(spinAnimation);
          
          // Show final result (would map from actual slot server response)
          // For now, random result
          const finalReels = Array(5).fill(0).map(() => 
            Array(3).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length))
          );
          setReels(finalReels);
          
          // Update stats
          setSpinning(false);
          setTotalSpins(prev => prev + 1);
          
          // Update balance
          const newBalance = await getGumBalance(walletAddress);
          setGumBalance(newBalance);
          
          // Show win if any
          if (result.winAmount && result.winAmount > 0) {
            setLastWin(result.winAmount);
            setTotalWins(prev => prev + result.winAmount);
            setShowWin(true);
            
            setTimeout(() => setShowWin(false), 3000);
          }
        }
      }, spinInterval);
      
    } catch (error) {
      console.error('Spin error:', error);
      setSpinning(false);
    }
  }, [gameId, spinning, gumBalance, betAmount, walletAddress]);

  const canSpin = !spinning && gumBalance >= betAmount && gameId !== null;

  return (
    <SlotMachineContainer>
      <SlotTitle>🎰 FLUNKS SLOTS 🎰</SlotTitle>
      
      <BalanceDisplay>
        <BalanceItem>
          <label>GUM Balance</label>
          <span>{gumBalance.toLocaleString()}</span>
        </BalanceItem>
        <BalanceItem>
          <label>Total Spins</label>
          <span>{totalSpins}</span>
        </BalanceItem>
        <BalanceItem>
          <label>Total Won</label>
          <span>{totalWins.toLocaleString()}</span>
        </BalanceItem>
      </BalanceDisplay>

      <ReelsContainer>
        {reels.map((reel, reelIndex) => (
          <Reel key={reelIndex} spinning={spinning}>
            <ReelSymbols position={0} spinning={spinning}>
              {reel.map((symbolIndex, pos) => (
                <Symbol key={pos}>
                  {SYMBOLS[symbolIndex]}
                </Symbol>
              ))}
            </ReelSymbols>
          </Reel>
        ))}
      </ReelsContainer>

      <WinDisplay show={showWin}>
        🎉 WIN: {lastWin} GUM! 🎉
      </WinDisplay>

      <ControlPanel>
        <BetControls>
          <BetButton onClick={() => updateBet(-10)} disabled={spinning}>
            -10
          </BetButton>
          <BetButton onClick={() => updateBet(-1)} disabled={spinning}>
            -1
          </BetButton>
          <BetAmount>{betAmount} GUM</BetAmount>
          <BetButton onClick={() => updateBet(1)} disabled={spinning}>
            +1
          </BetButton>
          <BetButton onClick={() => updateBet(10)} disabled={spinning}>
            +10
          </BetButton>
        </BetControls>

        <SpinButton 
          onClick={spinReels} 
          disabled={!canSpin}
          canSpin={canSpin}
        >
          {spinning ? '🔄' : 'SPIN'}
        </SpinButton>
      </ControlPanel>
    </SlotMachineContainer>
  );
};

export default FlunksSlotMachine;
