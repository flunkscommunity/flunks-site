import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';
import { getTotalWin, PAYLINES, FLUNKS_SYMBOLS } from '../lib/slots/flunksPaytable';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { isFeatureEnabled } from 'utils/buildMode';
import { useGum } from 'contexts/GumContext';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
  max-width: 900px;
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #fbbf24;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  
  @media (max-width: 768px) {
    font-size: 1.8em;
  }
`;

const GameInfo = styled.div`
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 15px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 15px;
    font-size: 0.9em;
  }`;

const SlotMachine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const SlotContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
  min-height: 100%;
  overflow-y: auto;
`;

const CabinetTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  width: 100%;
`;

const Screen = styled.div`
  display: flex;
  justify-content: center;
`;

const PayoutDisplay = styled.div`
  text-align: center;
  padding: 10px 20px;
  background: 
    repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.95) 0px,
      rgba(10,10,10,0.95) 1px,
      rgba(0,0,0,0.95) 2px
    ),
    #000;
  border-radius: 0;
  border: 4px solid #222;
  border-bottom-color: #444;
  border-right-color: #444;
  box-shadow: 
    inset 0 0 30px rgba(255,255,0,0.1),
    inset 0 4px 10px rgba(0,0,0,0.9),
    0 4px 15px rgba(0,0,0,0.8);
  
  h2 {
    color: #ffff00;
    font-size: 1em;
    margin: 0;
    font-family: 'Impact', 'Arial Black', sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-shadow: 
      0 0 10px #ffff00,
      0 0 20px #ffff00,
      2px 2px 0px rgba(0,0,0,0.8);
    animation: glow 2s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% { 
      text-shadow: 
        0 0 10px #ffff00,
        0 0 20px #ffff00,
        2px 2px 0px rgba(0,0,0,0.8);
    }
    50% { 
      text-shadow: 
        0 0 15px #ffff00,
        0 0 30px #ffff00,
        0 0 40px #ff9900,
        2px 2px 0px rgba(0,0,0,0.8);
    }
  }
`;

const ReelsContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 5px;
  }
  
  &::before, &::after {
    content: '⭐';
    position: absolute;
    font-size: 3em;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.3;
  }
  
  &::before {
    left: -40px;
  }
  
  &::after {
    right: -40px;
  }
`;

const Reel = styled.div<{ spinning: boolean; stopped?: boolean }>`
  width: 110px;
  background: rgba(0,0,0,0.8);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 10px 5px;
  border: 2px solid ${props => props.stopped ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.3)'};
  box-shadow: 0 4px 15px rgba(0,0,0,0.8);
  animation: ${props => props.spinning ? 'spinReel 0.1s linear infinite' : 'none'};
  transition: border-color 0.3s ease;
  
  @media (max-width: 768px) {
    width: 80px;
    padding: 8px 3px;
  }
  
  @keyframes spinReel {
    0% { transform: translateY(0); }
    100% { transform: translateY(-20px); }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const WinLines = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent 0%, #FFD700 20%, #FFD700 80%, transparent 100%);
  transform: translateY(-50%);
  opacity: 0.5;
  pointer-events: none;
`;

const Controls = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`;

const CenterSection = styled.div`
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-self: center;
`;

const GumBump = styled.div`
  background: #000;
  color: #ff3300;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  border: 2px solid #333;
  border-top-color: #1a1a1a;
  border-left-color: #1a1a1a;
  border-bottom-color: #555;
  border-right-color: #555;
  border-radius: 3px;
  text-shadow: 
    0 0 8px #ff3300,
    0 0 15px #ff3300,
    0 0 2px #fff;
  box-shadow: 
    inset 0 0 20px rgba(255,51,0,0.2),
    inset 0 2px 5px rgba(0,0,0,0.8),
    0 0 5px rgba(0,0,0,0.8);
  animation: flicker 3s infinite;
`;

const LeftControls = styled.div`
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const RightControls = styled.div`
  grid-column: 3;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const SpinButton = styled.button`
  padding: 18px 50px;
  border-radius: 6px;
  background: linear-gradient(135deg, #CC0000 0%, #FF4444 50%, #CC0000 100%);
  border: 4px solid #FFD700;
  border-bottom: 6px solid #8B6914;
  border-right: 6px solid #8B6914;
  color: white;
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 1.8em;
  font-weight: bold;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.15s;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 
    0 6px 15px rgba(255,68,68,0.4),
    inset 0 2px 8px rgba(255,255,255,0.3),
    inset 0 -2px 8px rgba(0,0,0,0.5);
  position: relative;
  text-shadow: 
    2px 2px 4px rgba(0,0,0,0.8),
    0 0 10px rgba(255,255,255,0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
    border-radius: 2px;
    pointer-events: none;
  }
  
  &:hover {
    background: linear-gradient(135deg, #DD0000 0%, #FF5555 50%, #DD0000 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px rgba(255,68,68,0.6),
      inset 0 2px 10px rgba(255,255,255,0.4),
      inset 0 -2px 10px rgba(0,0,0,0.5);
  }
  
  &:active {
    transform: translateY(2px);
    border-bottom: 2px solid #8B6914;
    box-shadow: 
      0 2px 8px rgba(255,68,68,0.4),
      inset 0 2px 8px rgba(0,0,0,0.7);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    animation: disabledPulse 1s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 6px 15px rgba(255,68,68,0.4),
                  inset 0 2px 8px rgba(255,255,255,0.3),
                  inset 0 -2px 8px rgba(0,0,0,0.5);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(255,68,68,0.7),
                  0 0 30px rgba(255,215,0,0.5),
                  inset 0 2px 8px rgba(255,255,255,0.4),
                  inset 0 -2px 8px rgba(0,0,0,0.5);
    }
  }
  
  @keyframes disabledPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.7; }
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 10px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 5px 15px rgba(16,185,129,0.4);
  
  &:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BetControls = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 10px;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%);
  border-radius: 0;
  border: 4px solid #2a2a2a;
  border-top: 4px solid #444;
  box-shadow: 
    inset 0 4px 12px rgba(0,0,0,0.8),
    inset 0 -2px 4px rgba(255,255,255,0.05),
    0 6px 20px rgba(0,0,0,0.7);
  position: relative;
  width: fit-content;
  margin: 5px auto 0;
  
  /* Scratches and wear */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 20px,
        rgba(255,255,255,0.01) 20px,
        rgba(255,255,255,0.01) 21px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 30px,
        rgba(0,0,0,0.02) 30px,
        rgba(0,0,0,0.02) 31px
      );
    pointer-events: none;
  }
`;

const BetButton = styled.button`
  background: 
    linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.4) 100%),
    linear-gradient(135deg, #c9a227 0%, #8b7500 50%, #c9a227 100%);
  color: #000;
  border: 3px solid #555;
  border-top-color: #777;
  border-left-color: #777;
  border-bottom-color: #222;
  border-right-color: #222;
  padding: 12px 24px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 900;
  font-size: 1.1em;
  font-family: 'Arial Black', sans-serif;
  text-shadow: 
    1px 1px 0px rgba(255,255,255,0.3),
    -1px -1px 0px rgba(0,0,0,0.5);
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.3),
    inset 0 -2px 3px rgba(0,0,0,0.3),
    0 4px 8px rgba(0,0,0,0.6);
  transition: all 0.1s;
  
  &:hover {
    background: 
      linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%),
      linear-gradient(135deg, #d4af37 0%, #9d8420 50%, #d4af37 100%);
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.4),
      inset 0 -2px 3px rgba(0,0,0,0.3),
      0 4px 12px rgba(201,162,39,0.4);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 
      inset 0 2px 5px rgba(0,0,0,0.5),
      0 2px 4px rgba(0,0,0,0.4);
  }
`;

const BetDisplay = styled.div`
  font-size: 1.3em;
  font-weight: bold;
  padding: 10px 25px;
  background: #000;
  border-radius: 3px;
  color: #ff3300;
  border: 4px solid #333;
  border-top-color: #1a1a1a;
  border-left-color: #1a1a1a;
  border-bottom-color: #555;
  border-right-color: #555;
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
  text-shadow: 
    0 0 10px #ff3300,
    0 0 20px #ff3300,
    0 0 2px #fff;
  box-shadow: 
    inset 0 0 30px rgba(255,51,0,0.2),
    inset 0 4px 8px rgba(0,0,0,0.8),
    0 0 5px rgba(0,0,0,0.8);
  position: relative;
  
  /* Flickering LED effect */
  animation: flicker 3s infinite;
  
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.98; }
    51% { opacity: 1; }
  }
`;

const BalanceDisplay = styled.div`
  text-align: center;
  font-size: 1.3em;
  color: #ddd;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  
  span {
    color: #00ff00;
    font-weight: 900;
    font-family: 'Courier New', monospace;
    text-shadow: 
      0 0 8px #00ff00,
      0 0 15px #00ff00,
      1px 1px 2px rgba(0,0,0,0.8);
  }
`;

const WinMessage = styled.div<{ show: boolean }>`
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  color: #fbbf24;
  margin: 20px 0;
  opacity: ${props => props.show ? 1 : 0};
  transform: scale(${props => props.show ? 1.2 : 1});
  transition: all 0.3s;
`;

const BackButton = styled.button`
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const CabinetFacade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  
  /* Top decorative panel */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 80px;
    background: linear-gradient(180deg, 
      #8B4513 0%, 
      #654321 30%,
      transparent 100%
    );
    border-radius: 20px 20px 0 0;
    z-index: 11;
  }
  
  /* Bottom decorative panel */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 85%;
    height: 120px;
    background: linear-gradient(0deg, 
      #8B4513 0%, 
      #654321 40%,
      transparent 100%
    );
    border-radius: 0 0 25px 25px;
    z-index: 11;
  }
`;

const FacadeFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  border: 12px solid;
  border-image: linear-gradient(
    135deg,
    #FFD700 0%,
    #FFA500 25%,
    #FFD700 50%,
    #DAA520 75%,
    #FFD700 100%
  ) 1;
  border-radius: 20px;
  box-shadow: 
    inset 0 0 30px rgba(255,215,0,0.4),
    inset 0 0 60px rgba(255,215,0,0.2),
    0 0 40px rgba(255,215,0,0.3);
  pointer-events: none;
  z-index: 12;
  
  /* Corner decorations */
  &::before,
  &::after {
    content: '◆';
    position: absolute;
    font-size: 2em;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255,215,0,0.8);
  }
  
  &::before {
    top: -20px;
    left: -20px;
  }
  
  &::after {
    top: -20px;
    right: -20px;
  }
`;

const FacadeCornerBottom = styled.div`
  position: absolute;
  font-size: 2em;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,0.8);
  pointer-events: none;
  z-index: 13;
  
  &:first-child {
    bottom: -20px;
    left: -20px;
  }
  
  &:last-child {
    bottom: -20px;
    right: -20px;
  }
`;

const ReelWindow = styled.div`
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 
    inset 0 0 50px rgba(0,0,0,0.9),
    inset 0 0 100px rgba(0,0,0,0.5);
  overflow: hidden;
  
  /* Tinted glass effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(102,126,234,0.1) 0%,
      transparent 30%,
      transparent 70%,
      rgba(0,0,0,0.2) 100%
    );
    pointer-events: none;
    z-index: 5;
  }
  
  /* Glass reflection */
  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 5%;
    width: 30%;
    height: 40%;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.1) 0%,
      transparent 60%
    );
    border-radius: 50%;
    pointer-events: none;
    z-index: 6;
  }
`;

const SYMBOLS = ['🎓', '📚', '🏆', '⭐', '💎', '🔥', '🎯', '🎪'];

// Symbol keys matching our paytable
// 9 symbols Vegas-style (38 stops per reel)
const SYMBOL_KEYS = [
  'pencil', 'eraser', 'notebook', 'backpack', 'calculator',
  'trophy', 'diploma', 'gum_pile', 'flunks_logo'
];

// Map to slot images (9 symbols needed)
const SYMBOL_IMAGES: Record<string, string> = {
  pencil: '/slots/images/beetle.png',        // Common - 3x
  eraser: '/slots/images/spider.png',        // Common - 4x
  notebook: '/slots/images/bat.png',         // Common - 5x
  backpack: '/slots/images/ghost.png',       // Uncommon - 10x
  calculator: '/slots/images/goblin.png',    // Uncommon - 15x
  trophy: '/slots/images/skeleton.png',      // Rare - 30x
  diploma: '/slots/images/mummy.png',        // Rare - 50x
  gum_pile: '/slots/images/vampire.png',     // Epic - 150x
  flunks_logo: '/slots/images/werewolf.png'  // JACKPOT - 500x
};

export default function SlotsPlay() {
  const router = useRouter();
  const { gameId, gameName } = router.query;
  
  // GUM integration
  const { balance: gumBalance, refreshBalance, canAfford } = useGum();
  const { address: walletAddress } = useUnifiedWallet();
  
  // DEV MODE: Use a test wallet address when no wallet is connected
  const DEV_MODE = true; // Set to false for production
  const DEV_WALLET = '0xDEV_TEST_WALLET';
  const effectiveWallet = walletAddress || (DEV_MODE ? DEV_WALLET : null);
  
  // Dev mode GUM balance (starts at 500)
  const [devGumBalance, setDevGumBalance] = useState(500);
  const effectiveGumBalance = walletAddress ? gumBalance : devGumBalance;
  
  // Redirect to home if slot machine is disabled (live site)
  useEffect(() => {
    if (!isFeatureEnabled('showSlotMachine')) {
      router.push('/');
    }
  }, [router]);
  
  // Slot transaction helper
  const slotTransaction = async (type: 'bet' | 'win' | 'refund', amount: number, metadata?: any) => {
    // Dev mode: handle locally without API
    if (DEV_MODE && !walletAddress) {
      if (type === 'bet') {
        setDevGumBalance(prev => prev - amount);
      } else if (type === 'win' || type === 'refund') {
        setDevGumBalance(prev => prev + amount);
      }
      return { success: true, balance: devGumBalance };
    }
    
    if (!effectiveWallet) return { success: false, error: 'No wallet connected' };
    
    try {
      const response = await fetch('/api/slots/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: effectiveWallet, type, amount, metadata })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the GUM balance in context
        await refreshBalance();
      }
      
      return result;
    } catch (error) {
      console.error('Slot transaction error:', error);
      return { success: false, error: 'Transaction failed' };
    }
  };
  
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [reels, setReels] = useState<string[][]>([
    [SYMBOL_KEYS[0], SYMBOL_KEYS[1], SYMBOL_KEYS[2]], // Column 1 (3 rows)
    [SYMBOL_KEYS[3], SYMBOL_KEYS[4], SYMBOL_KEYS[5]], // Column 2
    [SYMBOL_KEYS[6], SYMBOL_KEYS[7], SYMBOL_KEYS[8]], // Column 3
  ]);
  const [numReels, setNumReels] = useState(3);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(15);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    // Set serverless mode message
    setMessage('Ready to spin! 🎰');
    setTimeout(() => setMessage(''), 2000);
  }, []);



  const spinReels = async () => {
    if (spinning) return;
    
    // Check if user can afford the bet (dev mode or real wallet)
    const canAffordBet = DEV_MODE && !walletAddress ? devGumBalance >= bet : canAfford(bet);
    if (!canAffordBet) {
      setMessage('Not enough GUM! 💔');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    if (!effectiveWallet) {
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
    
    // Animate reels - generate random 3x5 grid during spin
    const SYMBOL_KEYS = [
      'pencil', 'notebook', 'backpack', 'flunk_basic', 'diploma', 
      'trophy', 'flunk_evolved', 'gum_pile', 'golden_ticket', 
      'wild_flunk', 'flunks_logo', 'scatter_keyhole'
    ];
    
    const spinDuration = 1500;
    const spinInterval = setInterval(() => {
      const randomGrid = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => 
          SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)]
        )
      );
      setReels(randomGrid);
    }, 100);
    
    try {
      // Call serverless slot API
      const response = await fetch('/api/slots/spin-serverless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet, walletAddress: effectiveWallet }),
      });
      
      const result = await response.json();
      console.log('🎰 Spin result:', result);
      setLastResult(result);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        
        // Use result from serverless API (already has symbols as strings)
        const gridByRows = result.screen; // 3 rows x 3 columns of symbol keys
        
        // Transpose to columns for display
        const finalGrid: string[][] = Array(3).fill(null).map((_, col) => 
          Array(3).fill(null).map((_, row) => gridByRows[row][col])
        );
        
        // Reveal reels one by one from left to right
        const revealDelay = 300; // 300ms between each reel
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
        
        console.log('🎰 Final grid (by rows):', gridByRows);
        console.log('🎰 Final grid (by cols):', finalGrid);
        
        // Win calculation already done by serverless API
        const winResult = {
          totalWin: result.gain || 0,
          paylineWins: result.lines || [],
          scatterWin: result.scatter || null
        };
        
        console.log('💰 Win calculation:', {
          totalWin: winResult.totalWin,
          paylineWins: winResult.paylineWins,
          scatter: winResult.scatterWin
        });
        
        // Wait for all reels to reveal before showing win
        const totalRevealTime = finalGrid.length * revealDelay + 200;
        setTimeout(async () => {
          if (winResult.totalWin > 0 || winResult.scatterWin) {
            const totalGain = Math.floor(winResult.totalWin);
            setWinAmount(totalGain);
            setShowWin(true);
            setWinningLines(winResult.paylineWins.map((w: any) => w.payline));
            
            // Award GUM winnings
            if (totalGain > 0) {
              await slotTransaction('win', totalGain, { 
                win_amount: totalGain, 
                bet_amount: bet,
                multiplier: totalGain / bet 
              });
            }
            
            let msg = `🎉 WIN ${totalGain} GUM!`;
            if (winResult.paylineWins.length > 1) {
              msg += ` (${winResult.paylineWins.length} lines)`;
            }
            if (winResult.scatterWin) {
              msg += ` +${winResult.scatterWin.freeSpins} FREE SPINS!`;
              setFreeSpins(prev => prev + winResult.scatterWin.freeSpins);
            }
            
            setMessage(msg);
            
            setTimeout(() => {
              setShowWin(false);
              setMessage('');
              setWinningLines([]);
            }, 4000);
          } else {
            setMessage('Try again!');
            setWinningLines([]);
            setTimeout(() => setMessage(''), 2000);
          }
          
          setSpinning(false);
        }, totalRevealTime);
      }, spinDuration);
      
    } catch (error) {
      console.error('Spin error:', error);
      clearInterval(spinInterval);
      setSpinning(false);
      // Refund the bet on error
      await slotTransaction('refund', bet, { refund_amount: bet, reason: 'spin_error' });
      setMessage('Error spinning - bet refunded');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const adjustBet = (delta: number) => {
    setBet(prev => Math.max(1, Math.min(25, prev + delta)));
  };

  const setMaxBet = () => {
    setBet(25);
  };

  return (
    <>
      <Head>
        <title>🎰 Flunks Slot Machine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet" />
      </Head>
      
      <Container>
        <DraggableResizeableWindow
          windowsId="slot-machine"
          headerTitle="🎰 Flunks Slot Machine"
          onClose={() => router.push('/')}
          initialWidth="420px"
          initialHeight="720px"
          resizable={true}
          openCentered={false}
        >
          <SlotContent>
            {/* Main slot machine container with frame as background */}
            <div style={{ 
              position: 'relative', 
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '1741 / 2879',
              margin: '0 auto'
            }}>
              {/* Slot machine frame image */}
              <img 
                src="/slots/images/slot-machine.png" 
                alt="Slot Machine"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              />
              
              {/* Win announcement display - positioned at the very top brown area */}
              <div style={{
                position: 'absolute',
                top: '1%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '85%',
                height: '5%',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: showWin ? '#fbbf24' : 'transparent',
                fontFamily: "'Lilita One', cursive",
                fontSize: 'clamp(0.8em, 2.5vw, 1.4em)',
                fontWeight: 'normal',
                textShadow: showWin ? '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.5), 2px 2px 0 #b45309' : 'none',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}>
                {showWin && winAmount > 0 && (
                  <>
                    {winAmount >= bet * 10 ? 'BOOM GOES THE DYNAMITE!' :
                     winAmount >= bet * 7 ? 'HE\'S ON FIRE!' :
                     winAmount >= bet * 5 ? 'BOOMSHAKALAKA!' :
                     winAmount >= bet * 3 ? 'FROM DOWNTOWN!' :
                     winAmount >= bet * 2 ? 'TIGHT!' :
                     winAmount >= bet * 1.5 ? 'SICK!' :
                     winAmount >= bet ? 'FLY!' :
                     'DOPE!'} +{winAmount}
                  </>
                )}
              </div>
              
              {/* GUM Balance display - positioned in the dark pill area to the right of "GUM" */}
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
                fontSize: '1.8em',
                fontWeight: 'normal',
                textShadow: '0 0 5px rgba(251, 191, 36, 0.5), 1px 1px 0 #b45309'
              }}>
                {effectiveGumBalance}
              </div>
              
              {/* Bet amount display - positioned in the dark circle by character's head */}
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
                fontSize: '2em',
                fontWeight: 'normal',
                textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 2px 2px 0 #b45309'
              }}>
                {bet}
              </div>
              
              {/* Reels container - positioned to align with the 3 white windows */}
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
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '6px'
                    }}
                  >
                    {Array.isArray(column) ? column.map((symbolKey, rowIndex) => (
                      <img 
                        key={rowIndex} 
                        src={SYMBOL_IMAGES[symbolKey] || '/slots/images/beetle.png'}
                        alt={symbolKey}
                        style={{ 
                          width: '95%',
                          height: '32%',
                          objectFit: 'contain',
                          filter: spinning && !stoppedReels[colIndex] ? 'blur(3px)' : 'none',
                          transition: 'filter 0.3s'
                        }}
                      />
                    )) : (
                      <div style={{ fontSize: '2em' }}>{column}</div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* -5 Button - positioned over the frame's -5 button */}
              <button
                onClick={() => { console.log('🔽 -5 clicked'); adjustBet(-5); }}
                style={{
                  position: 'absolute',
                  top: '80%',
                  left: '7%',
                  width: '18%',
                  height: '9%',
                  zIndex: 10,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              
              {/* SPIN Button - positioned over the frame's SPIN WHEEL button */}
              <button
                onClick={() => { console.log('🎰 SPIN clicked'); spinReels(); }}
                disabled={spinning || (DEV_MODE && !walletAddress ? devGumBalance < bet : !canAfford(bet))}
                style={{
                  position: 'absolute',
                  top: '83%',
                  left: '14%',
                  width: '34%',
                  height: '11%',
                  zIndex: 10,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: spinning || effectiveGumBalance < bet ? 'not-allowed' : 'pointer',
                  opacity: spinning || effectiveGumBalance < bet ? 0.7 : 1,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!spinning) {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => { if (!spinning) e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              
              {/* +5 Button - positioned over the frame's +5 button */}
              <button
                onClick={() => { console.log('🔼 +5 clicked'); adjustBet(5); }}
                style={{
                  position: 'absolute',
                  top: '80%',
                  left: '25%',
                  width: '18%',
                  height: '9%',
                  zIndex: 10,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            
            {/* Win message */}
            <WinMessage show={showWin}>
              🎉 WIN! 🎉
            </WinMessage>

            {message && (
              <div style={{ textAlign: 'center', color: '#fbbf24', marginTop: '10px', fontSize: '0.9em' }}>
                {message}
              </div>
            )}
            
            {!effectiveWallet && (
              <div style={{ textAlign: 'center', color: '#ff6b6b', marginTop: '10px', fontSize: '0.85em' }}>
                Connect your wallet to play!
              </div>
            )}
            
            {DEV_MODE && !walletAddress && (
              <div style={{ textAlign: 'center', color: '#00ff00', marginTop: '5px', fontSize: '0.75em' }}>
                🛠️ DEV MODE: Using test wallet with {devGumBalance} GUM
              </div>
            )}
          </SlotContent>
        </DraggableResizeableWindow>
      </Container>
    </>
  );
}
