import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';
import { getTotalWin, PAYLINES, FLUNKS_SYMBOLS } from '../lib/slots/flunksPaytable';

const Container = styled.div`
  min-height: 100vh;
  background: url('/slots/images/haunted_background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: white;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

const CabinetTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Screen = styled.div`
  display: flex;
  justify-content: center;
`;

const PayoutDisplay = styled.div`
  text-align: center;
  padding: 10px 20px;
  background: rgba(0,0,0,0.7);
  border-radius: 10px;
  
  h2 {
    color: #fbbf24;
    font-size: 1.3em;
    margin: 0;
  }
`;

const ReelsContainer = styled.div`
  display: flex;
  gap: 10px;
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
  width: 120px;
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

const SpinButton = styled.button`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, #FF4444 0%, #CC0000 50%, #AA0000 100%);
  border: 12px solid #FFD700;
  color: white;
  font-size: 1.8em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 
    0 10px 30px rgba(255,68,68,0.5),
    inset 0 5px 15px rgba(255,255,255,0.3),
    inset 0 -5px 15px rgba(0,0,0,0.5);
  position: relative;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 50px;
    background: linear-gradient(180deg, #8B4513 0%, #654321 100%);
    border-radius: 10px 10px 0 0;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
  }
  
  &:hover {
    background: radial-gradient(circle, #FF5555 0%, #DD0000 50%, #BB0000 100%);
    transform: scale(1.05);
    box-shadow: 
      0 15px 40px rgba(255,68,68,0.7),
      inset 0 5px 15px rgba(255,255,255,0.4),
      inset 0 -5px 15px rgba(0,0,0,0.5);
  }
  
  &:active {
    transform: scale(0.95) translateY(5px);
    box-shadow: 
      0 5px 20px rgba(255,68,68,0.5),
      inset 0 3px 10px rgba(0,0,0,0.7);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    animation: pulse 1s ease-in-out infinite;
  }
  
  @keyframes pulse {
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
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(0,0,0,0.7);
  border-radius: 10px;
`;

const BetButton = styled.button`
  background: #fbbf24;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: all 0.2s;
  
  &:hover {
    background: #f59e0b;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BetDisplay = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  padding: 10px 30px;
  background: rgba(0,0,0,0.5);
  border-radius: 8px;
  color: #fbbf24;
  border: 2px solid #fbbf24;
`;

const BalanceDisplay = styled.div`
  text-align: center;
  font-size: 1.2em;
  color: white;
  
  span {
    color: #10b981;
    font-weight: bold;
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
    [SYMBOL_KEYS[9], SYMBOL_KEYS[10], SYMBOL_KEYS[0]], // Column 4
    [SYMBOL_KEYS[1], SYMBOL_KEYS[2], SYMBOL_KEYS[3]], // Column 5
  ]);
  const [numReels, setNumReels] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([false, false, false, false, false]);

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
    setStoppedReels([false, false, false, false, false]);
    
    // Animate reels - generate random 3x5 grid during spin
    const SYMBOL_KEYS = [
      'pencil', 'notebook', 'backpack', 'flunk_basic', 'diploma', 
      'trophy', 'flunk_evolved', 'gum_pile', 'golden_ticket', 
      'wild_flunk', 'flunks_logo', 'scatter_keyhole'
    ];
    
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      const randomGrid = Array(5).fill(null).map(() => 
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
        const gridByRows = result.screen; // 3 rows x 5 columns of symbol keys
        
        // Transpose to columns for display
        const finalGrid: string[][] = Array(5).fill(null).map((_, col) => 
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
    setBet(prev => Math.max(1, Math.min(100, prev + delta)));
  };

  return (
    <>
      <Head>
        <title>🎰 Flunks Slot Machine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <Container>
        <BackButton onClick={() => router.push('/slot-api-preview.html')}>
          ← Back to Games
        </BackButton>
      
      <Header>
        <Title>🎰 {gameName || 'Slot Machine'}</Title>
        {gameInfo && (
          <div style={{ opacity: 0.8, marginTop: '10px' }}>
            <p>Game ID: {gameId} | Provider: {gameInfo.aliases[0]?.prov}</p>
            <p>RTP: {gameInfo.rtp?.[0]?.toFixed(2)}% | Reels: {gameInfo.sx}</p>
          </div>
        )}
      </Header>

      <GameInfo>
        <BalanceDisplay>
          Balance: <span>{balance} GUM</span>
        </BalanceDisplay>
        {message && <p style={{ textAlign: 'center', color: '#fbbf24' }}>{message}</p>}
        {lastResult && (
          <p style={{ textAlign: 'center', fontSize: '0.9em', opacity: 0.7 }}>
            Last spin: {lastResult.gain > 0 ? `WIN ${lastResult.gain.toFixed(2)}` : 'No win'} 
            {lastResult.lines && ` | Paylines: ${lastResult.lines.length}`}
          </p>
        )}
      </GameInfo>

      <SlotMachine>
        <CabinetTop>
          <PayoutDisplay>
            <h2>{winAmount > 0 ? `🎉 WIN: ${winAmount} GUM!` : '🎰 Spin to Win!'}</h2>
          </PayoutDisplay>
          
          <Screen>
            <ReelsContainer>
              {reels.map((column, colIndex) => (
                <Reel key={colIndex} spinning={spinning && !stoppedReels[colIndex]} stopped={stoppedReels[colIndex]}>
                  {Array.isArray(column) ? column.map((symbolKey, rowIndex) => (
                    <img 
                      key={rowIndex} 
                      src={SYMBOL_IMAGES[symbolKey] || '/slots/images/beetle.png'}
                      alt={symbolKey}
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        objectFit: 'contain',
                        filter: spinning ? 'blur(3px)' : 'none',
                        transition: 'filter 0.3s',
                        ...(typeof window !== 'undefined' && window.innerWidth <= 768 && { 
                          width: '50px',
                          height: '50px'
                        })
                      }}
                    />
                  )) : (
                    <div style={{ fontSize: '3em' }}>{column}</div>
                  )}
                </Reel>
              ))}
            </ReelsContainer>
          </Screen>
        </CabinetTop>

        <WinMessage show={showWin}>
          🎉 JACKPOT! 🎉
        </WinMessage>

        <BetControls>
          <BetButton onClick={() => adjustBet(-5)}>−5</BetButton>
          <BetButton onClick={() => adjustBet(-1)}>−1</BetButton>
          <BetDisplay>{bet} GUM</BetDisplay>
          <BetButton onClick={() => adjustBet(1)}>+1</BetButton>
          <BetButton onClick={() => adjustBet(5)}>+5</BetButton>
        </BetControls>

        <Controls>
          <SpinButton 
            onClick={spinReels} 
            disabled={spinning || balance < bet}
          >
            {spinning ? '🎰 SPINNING...' : 'SPIN'}
          </SpinButton>
        </Controls>
      </SlotMachine>
    </Container>
    </>
  );
}
