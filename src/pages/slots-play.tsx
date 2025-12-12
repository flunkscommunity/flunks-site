import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';
import { getTotalWin, PAYLINES, FLUNKS_SYMBOLS } from '../lib/slots/flunksPaytable';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';

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
  background: url('/slots/images/haunted_background.png');
  background-size: cover;
  background-position: center;
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
const SYMBOL_KEYS = [
  'pencil', 'notebook', 'backpack', 'flunk_basic', 'diploma', 
  'trophy', 'flunk_evolved', 'gum_pile', 'golden_ticket', 
  'wild_flunk', 'flunks_logo', 'scatter_keyhole'
];

// Map to actual haunted house images (you'll replace with Flunks assets later)
const SYMBOL_IMAGES: Record<string, string> = {
  pencil: '/slots/images/beetle.png',
  notebook: '/slots/images/spider.png',
  backpack: '/slots/images/bat.png',
  flunk_basic: '/slots/images/ghost.png',
  diploma: '/slots/images/goblin.png',
  trophy: '/slots/images/skeleton.png',
  flunk_evolved: '/slots/images/mummy.png',
  gum_pile: '/slots/images/vampire.png',
  golden_ticket: '/slots/images/werewolf.png',
  wild_flunk: '/slots/images/haunted_house.png',
  flunks_logo: '/slots/images/haunted_house.png',
  scatter_keyhole: '/slots/images/freespins.png'
};

export default function SlotsPlay() {
  const router = useRouter();
  const { gameId, gameName } = router.query;
  
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [reels, setReels] = useState<string[][]>([
    [SYMBOL_KEYS[0], SYMBOL_KEYS[1], SYMBOL_KEYS[2]], // Column 1 (3 rows)
    [SYMBOL_KEYS[3], SYMBOL_KEYS[4], SYMBOL_KEYS[5]], // Column 2
    [SYMBOL_KEYS[6], SYMBOL_KEYS[7], SYMBOL_KEYS[8]], // Column 3
  ]);
  const [numReels, setNumReels] = useState(3);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
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
    if (spinning || balance < bet) return;
    
    setSpinning(true);
    setShowWin(false);
    setBalance(prev => prev - bet);
    setStoppedReels([false, false, false]);
    
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
        body: JSON.stringify({ bet }),
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
        setTimeout(() => {
          if (winResult.totalWin > 0 || winResult.scatterWin) {
            const totalGain = winResult.totalWin;
            setWinAmount(totalGain);
            setBalance(prev => prev + totalGain);
            setShowWin(true);
            setWinningLines(winResult.paylineWins.map(w => w.payline));
            
            let msg = `🎉 WIN ${totalGain.toFixed(2)} GUM!`;
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
      setBalance(prev => prev + bet); // Refund on error
      setMessage('Error spinning - bet refunded');
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
      </Head>
      
      <Container>
        <DraggableResizeableWindow
          windowsId="slot-machine"
          headerTitle="🎰 Flunks Slot Machine"
          onClose={() => router.push('/')}
          initialWidth="650px"
          initialHeight="600px"
          resizable={true}
          openCentered={false}
        >
          <SlotContent>
            <CabinetTop>
              <Screen>
                <div style={{ position: 'relative' }}>
                  {/* Reels behind */}
                  <ReelsContainer style={{ position: 'relative', zIndex: 1 }}>
                    {reels.map((column, colIndex) => (
                      <Reel key={colIndex} spinning={spinning && !stoppedReels[colIndex]} stopped={stoppedReels[colIndex]}>
                        {Array.isArray(column) ? column.map((symbolKey, rowIndex) => (
                          <img 
                            key={rowIndex} 
                            src={SYMBOL_IMAGES[symbolKey] || '/slots/images/beetle.png'}
                            alt={symbolKey}
                            style={{ 
                              width: '75px', 
                              height: '75px', 
                              objectFit: 'contain',
                              filter: spinning ? 'blur(3px)' : 'none',
                              transition: 'filter 0.3s'
                            }}
                          />
                        )) : (
                          <div style={{ fontSize: '3em' }}>{column}</div>
                        )}
                      </Reel>
                    ))}
                  </ReelsContainer>
                  
                  {/* Slot machine frame overlay on top */}
                  <img 
                    src="/images/slot-machine.png" 
                    alt="Slot Machine Frame"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 2,
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </Screen>

              <WinMessage show={showWin}>
                🎉 JACKPOT! 🎉
              </WinMessage>

              <BetControls>
                <LeftControls>
                  <BetButton onClick={() => adjustBet(-5)}>−5</BetButton>
                </LeftControls>
                
                <CenterSection>
                  <BetDisplay style={{ marginBottom: '5px' }}>
                    BET: {bet} GUM
                  </BetDisplay>
                  <GumBump>{balance} GUM</GumBump>
                  <SpinButton 
                    onClick={spinReels} 
                    disabled={spinning || balance < bet}
                  >
                    {spinning ? '🎰 SPINNING...' : 'SPIN'}
                  </SpinButton>
                  <BetButton onClick={setMaxBet} style={{ marginTop: '5px', fontSize: '0.85em', padding: '6px 12px' }}>
                    MAX BET
                  </BetButton>
                </CenterSection>
                
                <RightControls>
                  <BetButton onClick={() => adjustBet(5)}>+5</BetButton>
                </RightControls>
              </BetControls>
            </CabinetTop>

            {message && (
              <div style={{ textAlign: 'center', color: '#fbbf24', marginTop: '15px', fontSize: '0.9em' }}>
                {message}
              </div>
            )}
          </SlotContent>
        </DraggableResizeableWindow>
      </Container>
    </>
  );
}
