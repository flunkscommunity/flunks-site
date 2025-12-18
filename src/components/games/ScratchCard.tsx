import { useState, useRef, useEffect, useCallback } from 'react';

interface ScratchCardProps {
  // The hidden image to reveal (winner or loser)
  revealImage?: string;
  // Cover image (the scratchable layer)
  coverImage?: string;
  // Callback when card is fully revealed
  onReveal?: (isWinner: boolean) => void;
  // Is this a winning card?
  isWinner?: boolean;
  // Prize description for winners
  prizeDescription?: string;
  // Width of the card
  width?: number;
  // Height of the card
  height?: number;
  // Scratch brush size
  brushSize?: number;
  // Percentage scratched to auto-reveal
  revealThreshold?: number;
  // GUM cost to buy
  gumCost?: number;
  // User's GUM balance
  gumBalance?: number;
  // Callback for GUM changes
  onGumChange?: (amount: number) => void;
  // Whether the card has been purchased
  isPurchased?: boolean;
  // Callback when card is purchased
  onPurchase?: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  revealImage = '/images/games/scratch-card-loser.png',
  coverImage = '/images/games/scratch-card-cover.png',
  onReveal,
  isWinner = false,
  prizeDescription = '100 GUM',
  width = 300,
  height = 200,
  brushSize = 40,
  revealThreshold = 60,
  gumCost = 25,
  gumBalance = 0,
  onGumChange,
  isPurchased = false,
  onPurchase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);
  const [purchased, setPurchased] = useState(isPurchased);
  
  // Audio refs
  const scratchSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize canvas with cover
  useEffect(() => {
    if (!purchased) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load cover image or create gradient
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = () => {
      // Fallback: Create a metallic scratch-off gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#c0c0c0');
      gradient.addColorStop(0.3, '#a8a8a8');
      gradient.addColorStop(0.5, '#d4d4d4');
      gradient.addColorStop(0.7, '#a0a0a0');
      gradient.addColorStop(1, '#b8b8b8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add some texture
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Add text
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCRATCH HERE!', width / 2, height / 2);
      
      // Add sparkles
      ctx.font = '16px Arial';
      ctx.fillText('✨ 🎰 ✨', width / 2, height / 2 + 30);
    };
    img.src = coverImage;
    
    // Initialize sounds
    scratchSoundRef.current = new Audio('/sounds/scratch.mp3');
    winSoundRef.current = new Audio('/sounds/jackpot.mp3');
    loseSoundRef.current = new Audio('/sounds/incorrect.mp3');
  }, [coverImage, width, height, purchased]);

  // Calculate percentage scratched
  const calculatePercentScratched = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    
    return (transparentPixels / (width * height)) * 100;
  }, [width, height]);

  // Scratch function
  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Check percentage
    const percent = calculatePercentScratched();
    setPercentScratched(percent);
    
    // Auto-reveal if threshold reached
    if (percent >= revealThreshold && !isRevealed) {
      handleReveal();
    }
  }, [brushSize, calculatePercentScratched, revealThreshold, isRevealed]);

  // Get position from event (works for both mouse and touch)
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  // Event handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!purchased || isRevealed) return;
    e.preventDefault();
    setIsScratching(true);
    setHasStartedScratching(true);
    const pos = getPosition(e);
    scratch(pos.x, pos.y);
    
    // Play scratch sound
    if (scratchSoundRef.current) {
      scratchSoundRef.current.currentTime = 0;
      scratchSoundRef.current.play().catch(() => {});
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || isRevealed) return;
    e.preventDefault();
    const pos = getPosition(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    setIsScratching(false);
    if (scratchSoundRef.current) {
      scratchSoundRef.current.pause();
    }
  };

  // Full reveal
  const handleReveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    setPercentScratched(100);
    
    // Clear the canvas completely
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    }
    
    // Play appropriate sound
    if (isWinner && winSoundRef.current) {
      winSoundRef.current.play().catch(() => {});
    } else if (!isWinner && loseSoundRef.current) {
      loseSoundRef.current.play().catch(() => {});
    }
    
    // Callback
    onReveal?.(isWinner);
  };

  // Purchase card
  const handlePurchase = () => {
    if (gumBalance < gumCost) return;
    onGumChange?.(-gumCost);
    setPurchased(true);
    onPurchase?.();
  };

  return (
    <div 
      className="flex flex-col items-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        minWidth: width + 40,
      }}
    >
      {/* Title */}
      <div 
        className="text-center mb-4"
        style={{
          fontFamily: 'Cooper Black, Georgia, serif',
          fontSize: '22px',
          color: '#ffd700',
          textShadow: '2px 2px 4px #000',
        }}
      >
        🎫 SCRATCH CARD 🎫
      </div>

      {/* Card Container */}
      <div
        style={{
          position: 'relative',
          width: width,
          height: height,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 3px #ffd700',
          background: '#000',
        }}
      >
        {/* Not Purchased State */}
        {!purchased && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4a0080 0%, #1a0030 100%)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
            <div style={{ 
              color: '#ffd700', 
              fontSize: '18px', 
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '8px',
            }}>
              SCRATCH CARD
            </div>
            <div style={{ color: '#fff', fontSize: '14px', marginBottom: '16px' }}>
              Cost: {gumCost} GUM
            </div>
            <button
              onClick={handlePurchase}
              disabled={gumBalance < gumCost}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: gumBalance >= gumCost 
                  ? 'linear-gradient(180deg, #ffd700 0%, #ff9500 100%)'
                  : '#555',
                border: '3px solid #fff',
                borderRadius: '8px',
                color: '#000',
                cursor: gumBalance >= gumCost ? 'pointer' : 'not-allowed',
                boxShadow: gumBalance >= gumCost ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => {
                if (gumBalance >= gumCost) e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🎰 BUY CARD
            </button>
          </div>
        )}

        {/* Reveal Image (underneath) */}
        {purchased && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: isWinner 
                ? 'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)'
                : 'linear-gradient(135deg, #333 0%, #111 100%)',
            }}
          >
            {isWinner ? (
              <div className="text-center p-4">
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉🏆🎉</div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#000',
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                }}>
                  WINNER!
                </div>
                <div style={{ fontSize: '18px', color: '#000', marginTop: '8px' }}>
                  {prizeDescription}
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>😢</div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#888',
                }}>
                  Sorry!
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  Try again next time
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scratch Canvas (on top) */}
        {purchased && (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              cursor: isRevealed ? 'default' : 'crosshair',
              touchAction: 'none', // Prevents scrolling while scratching
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>

      {/* Progress / Status */}
      {purchased && !isRevealed && (
        <div className="w-full mt-4">
          {/* Progress bar */}
          <div 
            style={{
              width: '100%',
              height: '8px',
              background: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentScratched}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ffd700 0%, #ff9500 100%)',
                transition: 'width 0.1s ease',
              }}
            />
          </div>
          <div 
            className="text-center mt-2"
            style={{ color: '#888', fontSize: '12px' }}
          >
            {Math.round(percentScratched)}% scratched
          </div>
        </div>
      )}

      {/* Reveal Button (fallback for accessibility) */}
      {purchased && hasStartedScratching && !isRevealed && percentScratched > 20 && (
        <button
          onClick={handleReveal}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)',
            border: '2px solid #fff',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          👆 REVEAL ALL
        </button>
      )}

      {/* Winner Celebration */}
      {isRevealed && isWinner && (
        <div 
          className="mt-4 text-center animate-bounce"
          style={{
            color: '#ffd700',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          }}
        >
          🎊 CONGRATULATIONS! 🎊
        </div>
      )}

      {/* Buy Another Button */}
      {isRevealed && (
        <button
          onClick={() => {
            setIsRevealed(false);
            setPurchased(false);
            setPercentScratched(0);
            setHasStartedScratching(false);
          }}
          style={{
            marginTop: '16px',
            padding: '12px 32px',
            background: 'linear-gradient(180deg, #2196F3 0%, #1565C0 100%)',
            border: '2px solid #fff',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          🎫 BUY ANOTHER
        </button>
      )}

      {/* GUM Balance */}
      <div 
        className="mt-4 text-center"
        style={{
          color: '#ffd700',
          fontFamily: 'monospace',
          fontSize: '14px',
        }}
      >
        💰 Balance: {gumBalance} GUM
      </div>
    </div>
  );
};

export default ScratchCard;
