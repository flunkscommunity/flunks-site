import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px;
  overflow-y: auto;
  padding-bottom: 100px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #fbbf24;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const GameInfo = styled.div`
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 15px;
  max-width: 600px;
  margin: 0 auto 30px;
  backdrop-filter: blur(10px);
`;

const SlotMachine = styled.div`
  background: linear-gradient(180deg, #8B4513 0%, #654321 50%, #8B4513 100%);
  border-radius: 30px;
  padding: 60px 40px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 
    0 30px 80px rgba(0,0,0,0.7),
    inset 0 2px 10px rgba(255,215,0,0.3),
    inset 0 -2px 10px rgba(0,0,0,0.5);
  border: 8px solid #DAA520;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 40px;
    background: linear-gradient(180deg, #FFD700 0%, #DAA520 100%);
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -5px 15px rgba(255,215,0,0.5);
  }
  
  &::after {
    content: '🎰 FLUNKS CASINO 🎰';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    color: #8B4513;
    font-weight: bold;
    font-size: 1.2em;
    text-shadow: 0 1px 2px rgba(255,255,255,0.5);
  }
`;

const CabinetTop = styled.div`
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%);
  border-radius: 20px 20px 0 0;
  padding: 30px;
  margin: -20px -20px 20px -20px;
  border: 4px solid #FFD700;
  box-shadow: 
    inset 0 2px 10px rgba(255,215,0,0.2),
    0 5px 20px rgba(0,0,0,0.5);
`;

const Screen = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 15px;
  padding: 20px;
  border: 6px solid #2a2a3e;
  box-shadow: 
    inset 0 0 30px rgba(0,0,0,0.8),
    0 0 20px rgba(102,126,234,0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(255,255,255,0.1) 0%,
      transparent 50%,
      rgba(0,0,0,0.3) 100%
    );
    border-radius: 10px;
    pointer-events: none;
  }
`;

const PayoutDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  border-radius: 10px;
  box-shadow: 
    0 5px 15px rgba(255,215,0,0.5),
    inset 0 2px 5px rgba(255,255,255,0.3);
  
  h2 {
    color: #8B4513;
    font-size: 1.5em;
    text-shadow: 0 1px 2px rgba(255,255,255,0.5);
    margin: 0;
  }
`;

const ReelsContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
  padding: 30px 20px;
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 15px;
  border: 4px solid #FFD700;
  box-shadow: 
    inset 0 5px 20px rgba(0,0,0,0.8),
    0 0 30px rgba(255,215,0,0.3);
  position: relative;
  
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

const Reel = styled.div<{ spinning: boolean }>`
  width: 140px;
  height: 180px;
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5em;
  border: 4px solid #333;
  box-shadow: 
    inset 0 5px 15px rgba(0,0,0,0.2),
    0 8px 20px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
  animation: ${props => props.spinning ? 'spinReel 0.1s linear infinite' : 'none'};
  
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
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 15px;
  border: 3px solid #FFD700;
  box-shadow: 0 5px 20px rgba(0,0,0,0.5);
`;

const BetButton = styled.button`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B4513;
  border: 3px solid #DAA520;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1em;
  box-shadow: 0 4px 10px rgba(255,215,0,0.4);
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #FFA500, #FFD700);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255,215,0,0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BetDisplay = styled.div`
  font-size: 2em;
  font-weight: bold;
  padding: 15px 40px;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  border-radius: 12px;
  color: #FFD700;
  border: 3px solid #FFD700;
  box-shadow: 
    inset 0 2px 10px rgba(0,0,0,0.8),
    0 0 20px rgba(255,215,0,0.3);
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
`;

const BalanceDisplay = styled.div`
  text-align: center;
  font-size: 1.3em;
  margin: 20px 0;
  
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

const SYMBOLS = ['🎓', '📚', '🏆', '⭐', '💎', '🔥', '🎯', '🎪'];

export default function SlotsPlay() {
  const router = useRouter();
  const { gameId, gameName } = router.query;
  
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [reels, setReels] = useState(['🎓', '📚', '🏆']);
  const [numReels, setNumReels] = useState(3);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [token, setToken] = useState<string | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    // Load game info and sign in
    loadGameInfo();
    signInToSlotServer();
  }, [gameId]);

  const loadGameInfo = async () => {
    try {
      const response = await fetch('/api/slots/games');
      const games = await response.json();
      const game = games[Number(gameId) - 1]; // gameId is 1-indexed
      
      if (game) {
        setGameInfo(game);
        setNumReels(game.sx || 3);
        
        // Initialize reels based on game's reel count
        const initialReels = Array(game.sx || 3).fill('🎓');
        setReels(initialReels);
        
        setMessage(`Loaded: ${game.aliases[0]?.name} (${game.sx} reels)`);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error loading game info:', error);
    }
  };

  const signInToSlotServer = async () => {
    try {
      const response = await fetch('/api/slots/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'player1', password: 'test123' }),
      });
      
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setMessage('Connected to slot server!');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage('Error connecting to slot server');
    }
  };

  const spinReels = async () => {
    if (spinning || balance < bet || !token) return;
    
    setSpinning(true);
    setShowWin(false);
    setBalance(prev => prev - bet);
    
    // Animate reels
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
    }, 100);
    
    try {
      // Call real slot API with actual game
      const response = await fetch('/api/slots/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: gameId || 92,
          bet,
          token 
        }),
      });
      
      const result = await response.json();
      console.log('🎰 Spin result from server:', result);
      setLastResult(result);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        
        // Use ACTUAL game result from Slotopol
        if (result.screen && result.screen.length > 0) {
          // Map server symbol indices to our display symbols
          const serverReels = result.screen[0]; // First row of reels
          const finalReels = serverReels.slice(0, numReels).map((symIdx: number) => {
            // Map server symbol index to emoji (cycling through our SYMBOLS)
            return SYMBOLS[symIdx % SYMBOLS.length];
          });
          setReels(finalReels);
          
          console.log('Server symbols:', serverReels);
          console.log('Displayed as:', finalReels);
        } else {
          // Fallback simulation
          const finalReels = Array(numReels).fill(null).map(() => 
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          );
          setReels(finalReels);
        }
        
        // Check for wins (use server's gain calculation)
        const win = result.gain || 0;
        if (win > 0) {
          setWinAmount(win);
          setBalance(prev => prev + win);
          setShowWin(true);
          setMessage(`🎉 YOU WIN ${win.toFixed(2)} GUM!`);
          
          // Log win details
          console.log('💰 Win details:', {
            bet,
            gain: win,
            multiplier: (win / bet).toFixed(2) + 'x',
            lines: result.lines
          });
          
          setTimeout(() => {
            setShowWin(false);
            setMessage('');
          }, 3000);
        } else {
          setMessage('Try again!');
          setTimeout(() => setMessage(''), 2000);
        }
        
        setSpinning(false);
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
            <h2>💰 {winAmount > 0 ? `WIN: ${winAmount} GUM!` : 'Good Luck!'} 💰</h2>
          </PayoutDisplay>
          
          <Screen>
            <ReelsContainer>
              <WinLines />
              {reels.map((symbol, index) => (
                <Reel key={index} spinning={spinning}>
                  {symbol}
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
            disabled={spinning || balance < bet || !token}
          >
            {spinning ? '🎰' : 'SPIN'}
          </SpinButton>
        </Controls>
      </SlotMachine>
    </Container>
  );
}
