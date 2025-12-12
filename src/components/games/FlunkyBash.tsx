import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Game constants
const GRAVITY = 0.35;
const AIR_RESISTANCE = 0.995;
const GROUND_FRICTION = 0.92;
const BOUNCE_FACTOR = 0.5;
const MIN_VELOCITY = 0.5;

// Power-up types
type PowerUpType = 'banana' | 'trampoline' | 'ramp' | 'gum' | 'boost';

interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  used: boolean;
}

interface LeaderboardEntry {
  wallet: string;
  username: string;
  score: number;
  timestamp: string;
}

interface GameState {
  phase: 'title' | 'ready' | 'aiming' | 'flying' | 'rolling' | 'stopped';
  flunkX: number;
  flunkY: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  distance: number;
  maxDistance: number;
  swingAngle: number;
  swingPower: number;
  powerUps: PowerUp[];
  score: number;
  bestScore: number;
  attempts: number;
  credits: number;
}

interface FlunkyBashProps {
  onClose?: () => void;
  onScoreUpdate?: (score: number) => void;
}

const FlunkyBash: React.FC<FlunkyBashProps> = ({ onClose, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameLoopRef = useRef<boolean>(false);
  const titleAnimRef = useRef<number>(0);
  
  const { primaryWallet, user } = useDynamicContext();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'title',
    flunkX: 100,
    flunkY: 300,
    velocityX: 0,
    velocityY: 0,
    rotation: 0,
    distance: 0,
    maxDistance: 0,
    swingAngle: 0,
    swingPower: 0,
    powerUps: [],
    score: 0,
    bestScore: 0,
    attempts: 0,
    credits: 99,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/flunkybash-leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }, []);

  // Submit score
  const submitScore = useCallback(async (score: number) => {
    if (!primaryWallet?.address || score <= 0) return;
    
    setSubmittingScore(true);
    try {
      const response = await fetch('/api/flunkybash-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: primaryWallet.address,
          score,
          username: user?.username || user?.email?.split('@')[0] || 'Anonymous',
        }),
      });
      
      if (response.ok) {
        console.log('🎯 Score submitted:', score);
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setSubmittingScore(false);
    }
  }, [primaryWallet, user, fetchLeaderboard]);

  // Generate random power-ups
  const generatePowerUps = useCallback((): PowerUp[] => {
    const powerUps: PowerUp[] = [];
    const types: PowerUpType[] = ['banana', 'trampoline', 'ramp', 'gum', 'boost'];
    
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)] || 'banana';
      powerUps.push({
        id: i,
        type,
        x: 300 + Math.random() * 5000,
        y: type === 'trampoline' ? 380 : type === 'ramp' ? 370 : 300 + Math.random() * 80,
        width: type === 'ramp' ? 80 : 40,
        height: type === 'ramp' ? 40 : 40,
        used: false,
      });
    }
    
    return powerUps.sort((a, b) => a.x - b.x);
  }, []);

  // Initialize game
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      powerUps: generatePowerUps(),
    }));
    fetchLeaderboard();
  }, [generatePowerUps, fetchLeaderboard]);

  // Title screen animation
  useEffect(() => {
    if (gameState.phase === 'title') {
      const animLoop = () => {
        titleAnimRef.current += 0.05;
        // Force re-render for title animation
        setGameState(prev => ({ ...prev }));
        animationRef.current = requestAnimationFrame(animLoop);
      };
      animationRef.current = requestAnimationFrame(animLoop);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [gameState.phase]);

  // Swing animation
  useEffect(() => {
    if (gameState.phase === 'aiming') {
      const swingInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          swingAngle: prev.swingAngle + 0.08,
          swingPower: (Math.sin(prev.swingAngle) + 1) / 2,
        }));
      }, 16);
      return () => clearInterval(swingInterval);
    }
  }, [gameState.phase]);

  // Main game loop
  useEffect(() => {
    if (gameState.phase !== 'flying' && gameState.phase !== 'rolling') {
      return;
    }

    gameLoopRef.current = true;

    const gameLoop = () => {
      if (!gameLoopRef.current) return;

      setGameState(prev => {
        let { flunkX, flunkY, velocityX, velocityY, rotation, distance, powerUps, phase } = prev;
        const groundY = 380;

        velocityY += GRAVITY;
        velocityX *= AIR_RESISTANCE;
        velocityY *= AIR_RESISTANCE;

        flunkX += velocityX;
        flunkY += velocityY;
        rotation += velocityX * 0.02;

        // Check power-up collisions
        powerUps = powerUps.map(powerUp => {
          if (powerUp.used) return powerUp;
          
          const hitX = flunkX > powerUp.x - 20 && flunkX < powerUp.x + powerUp.width + 20;
          const hitY = flunkY > powerUp.y - 20 && flunkY < powerUp.y + powerUp.height + 20;
          
          if (hitX && hitY) {
            switch (powerUp.type) {
              case 'banana':
                velocityX *= 1.3;
                velocityY = -8;
                break;
              case 'trampoline':
                velocityY = -18;
                velocityX *= 1.1;
                break;
              case 'ramp':
                velocityY = -12;
                velocityX *= 1.2;
                break;
              case 'gum':
                velocityX *= 1.5;
                break;
              case 'boost':
                velocityX += 15;
                velocityY = -5;
                break;
            }
            return { ...powerUp, used: true };
          }
          return powerUp;
        });

        // Ground collision
        if (flunkY >= groundY) {
          flunkY = groundY;
          
          if (Math.abs(velocityY) > 2) {
            velocityY = -velocityY * BOUNCE_FACTOR;
          } else {
            velocityY = 0;
            phase = 'rolling';
          }
          
          velocityX *= GROUND_FRICTION;
        }

        distance = Math.max(distance, flunkX - 100);

        if (phase === 'rolling' && Math.abs(velocityX) < MIN_VELOCITY) {
          phase = 'stopped';
          gameLoopRef.current = false;
        }

        if (flunkX < 100) {
          flunkX = 100;
          velocityX = Math.abs(velocityX);
        }

        return {
          ...prev,
          flunkX,
          flunkY,
          velocityX,
          velocityY,
          rotation,
          distance,
          powerUps,
          phase,
          maxDistance: Math.max(prev.maxDistance, distance),
          score: Math.floor(distance),
          bestScore: Math.max(prev.bestScore, Math.floor(distance)),
        };
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      gameLoopRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.phase]);

  // Submit score when game ends
  useEffect(() => {
    if (gameState.phase === 'stopped' && gameState.score > 0) {
      submitScore(gameState.score);
    }
  }, [gameState.phase, gameState.score, submitScore]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { flunkX, flunkY, rotation, powerUps, phase, swingPower, distance, credits, bestScore, attempts } = gameState;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // === TITLE SCREEN ===
    if (phase === 'title') {
      // CRT scanline background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#1a1a3a');
      gradient.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

      // Arcade cabinet border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Animated title
      const bounce = Math.sin(titleAnimRef.current * 2) * 10;
      const glow = Math.abs(Math.sin(titleAnimRef.current * 3));
      
      ctx.save();
      ctx.translate(canvas.width / 2, 80 + bounce);
      
      // Title glow
      ctx.shadowColor = `rgba(255, 200, 0, ${glow})`;
      ctx.shadowBlur = 30;
      
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FLUNKY', 0, 0);
      
      ctx.fillStyle = '#FF6B00';
      ctx.fillText('BASH!', 0, 55);
      
      ctx.restore();

      // Animated Flunk character
      ctx.save();
      ctx.translate(canvas.width / 2, 200);
      ctx.rotate(Math.sin(titleAnimRef.current * 4) * 0.2);
      ctx.scale(1.5, 1.5);
      
      // Body
      ctx.fillStyle = '#FFB347';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-10, -8, 10, 0, Math.PI * 2);
      ctx.arc(10, -8, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-8, -8, 5, 0, Math.PI * 2);
      ctx.arc(12, -8, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Excited mouth
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 8, 12, 0, Math.PI);
      ctx.stroke();
      
      ctx.restore();

      // Credits display (arcade style)
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CREDITS: ${credits}`, canvas.width / 2, 290);

      // High score
      ctx.fillStyle = '#FF00FF';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(`HIGH SCORE: ${bestScore}m`, canvas.width / 2, 320);

      // Insert coin prompt (blinking)
      if (Math.floor(titleAnimRef.current * 2) % 2 === 0) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillText('CLICK TO INSERT COIN', canvas.width / 2, 370);
      }

      // Instructions
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('CLICK TO SWING • CLICK TO LAUNCH', canvas.width / 2, 410);
      ctx.fillText('HIT POWERUPS TO FLY FURTHER!', canvas.width / 2, 430);

      // Decorative corners
      const cornerSize = 20;
      ctx.fillStyle = '#FFD700';
      
      // Top left
      ctx.fillRect(25, 25, cornerSize, 5);
      ctx.fillRect(25, 25, 5, cornerSize);
      
      // Top right
      ctx.fillRect(canvas.width - 25 - cornerSize, 25, cornerSize, 5);
      ctx.fillRect(canvas.width - 30, 25, 5, cornerSize);
      
      // Bottom left
      ctx.fillRect(25, canvas.height - 30, cornerSize, 5);
      ctx.fillRect(25, canvas.height - 25 - cornerSize, 5, cornerSize);
      
      // Bottom right
      ctx.fillRect(canvas.width - 25 - cornerSize, canvas.height - 30, cornerSize, 5);
      ctx.fillRect(canvas.width - 30, canvas.height - 25 - cornerSize, 5, cornerSize);

      return;
    }

    // === GAMEPLAY ===
    const cameraX = Math.max(0, flunkX - 150);

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#1a1a3e');
    skyGradient.addColorStop(0.5, '#2d1f4e');
    skyGradient.addColorStop(1, '#4a3f6e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const starX = ((i * 137) % canvas.width) - (cameraX * 0.1) % canvas.width;
      const starY = (i * 73) % 200;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillRect(starX, starY, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#2d5a3d';
    ctx.fillRect(0, 400, canvas.width, 100);
    ctx.fillStyle = '#3d7a5d';
    ctx.fillRect(0, 400, canvas.width, 5);

    // Distance markers
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    for (let d = 0; d <= distance + 500; d += 100) {
      const markerX = 100 + d - cameraX;
      if (markerX > -50 && markerX < canvas.width + 50) {
        ctx.fillStyle = '#ffffff44';
        ctx.fillRect(markerX, 380, 2, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${d}m`, markerX - 15, 415);
      }
    }

    // Power-ups
    powerUps.forEach(powerUp => {
      if (powerUp.used) return;
      
      const drawX = powerUp.x - cameraX;
      if (drawX < -100 || drawX > canvas.width + 100) return;

      ctx.save();
      ctx.translate(drawX + powerUp.width / 2, powerUp.y + powerUp.height / 2);
      
      switch (powerUp.type) {
        case 'banana':
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = '20px Arial';
          ctx.fillText('🍌', -12, 8);
          break;
        case 'trampoline':
          ctx.fillStyle = '#FF4444';
          ctx.fillRect(-20, -5, 40, 10);
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(-18, 5, 5, 15);
          ctx.fillRect(13, 5, 5, 15);
          break;
        case 'ramp':
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.moveTo(-40, 20);
          ctx.lineTo(40, 20);
          ctx.lineTo(40, -10);
          ctx.closePath();
          ctx.fill();
          break;
        case 'gum':
          ctx.fillStyle = '#FF69B4';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFB6C1';
          ctx.beginPath();
          ctx.arc(-3, -3, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'boost':
          ctx.fillStyle = '#00FFFF';
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(10, 5);
          ctx.lineTo(3, 5);
          ctx.lineTo(3, 15);
          ctx.lineTo(-3, 15);
          ctx.lineTo(-3, 5);
          ctx.lineTo(-10, 5);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    });

    // Launcher platform
    const launcherX = 100 - cameraX;
    if (launcherX > -200 && launcherX < canvas.width) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(launcherX - 30, 350, 60, 50);
      ctx.fillStyle = '#654321';
      ctx.fillRect(launcherX - 25, 355, 50, 40);
      
      if (phase === 'aiming' || phase === 'ready') {
        ctx.save();
        ctx.translate(launcherX, 320);
        ctx.rotate(-Math.PI / 4 + (phase === 'aiming' ? swingPower * Math.PI / 2 : 0));
        ctx.fillStyle = '#654321';
        ctx.fillRect(-5, 0, 10, 80);
        ctx.restore();
      }
    }

    // Flunk character
    const flunkDrawX = flunkX - cameraX;
    ctx.save();
    ctx.translate(flunkDrawX, flunkY);
    ctx.rotate(rotation);
    
    ctx.fillStyle = '#FFB347';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-8, -5, 8, 0, Math.PI * 2);
    ctx.arc(8, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-6, -5, 4, 0, Math.PI * 2);
    ctx.arc(10, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (phase === 'flying') {
      ctx.arc(0, 5, 10, 0, Math.PI);
    } else if (phase === 'stopped') {
      ctx.moveTo(-8, 10);
      ctx.bezierCurveTo(-4, 15, 4, 5, 8, 10);
    } else {
      ctx.arc(0, 2, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    }
    ctx.stroke();
    
    ctx.restore();

    // Power meter
    if (phase === 'aiming') {
      ctx.fillStyle = '#333';
      ctx.fillRect(20, 20, 104, 24);
      
      const powerGradient = ctx.createLinearGradient(22, 0, 120, 0);
      powerGradient.addColorStop(0, '#00ff00');
      powerGradient.addColorStop(0.5, '#ffff00');
      powerGradient.addColorStop(1, '#ff0000');
      ctx.fillStyle = powerGradient;
      ctx.fillRect(22, 22, swingPower * 100, 20);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('POWER', 130, 38);
    }

    // HUD - Arcade style
    // Distance display
    ctx.fillStyle = '#000';
    ctx.fillRect(canvas.width - 180, 10, 170, 70);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 180, 10, 170, 70);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DISTANCE', canvas.width - 20, 32);
    
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillText(`${Math.floor(distance)}m`, canvas.width - 20, 60);
    
    ctx.textAlign = 'left';

    // Best score
    ctx.fillStyle = '#FF00FF';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`BEST: ${bestScore}m`, 20, canvas.height - 15);

    // Attempts
    ctx.fillStyle = '#00FFFF';
    ctx.fillText(`PLAYS: ${attempts}`, 150, canvas.height - 15);

    // Game over screen
    if (phase === 'stopped') {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 100, 320, 200);
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.strokeRect(canvas.width / 2 - 160, canvas.height / 2 - 100, 320, 200);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
      
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.fillText(`${Math.floor(distance)}m`, canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillStyle = distance >= bestScore ? '#FFFF00' : '#AAAAAA';
      ctx.fillText(distance >= bestScore ? '★ NEW RECORD! ★' : `BEST: ${bestScore}m`, canvas.width / 2, canvas.height / 2 + 15);
      
      if (submittingScore) {
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('SAVING SCORE...', canvas.width / 2, canvas.height / 2 + 45);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('CLICK TO CONTINUE', canvas.width / 2, canvas.height / 2 + 45);
      }
      
      ctx.fillStyle = '#FF69B4';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('VIEW LEADERBOARD ▶', canvas.width / 2, canvas.height / 2 + 75);
      
      ctx.textAlign = 'left';
    }

    // Ready phase
    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 40, 240, 80);
      
      ctx.fillStyle = '#FFFF00';
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GET READY!', canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('CLICK TO SWING', canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = 'left';
    }

  }, [gameState, submittingScore]);

  // Handle click
  const handleClick = useCallback(() => {
    setGameState(prev => {
      if (prev.phase === 'title') {
        return { 
          ...prev, 
          phase: 'ready',
          credits: prev.credits - 1,
        };
      }
      
      if (prev.phase === 'ready') {
        return { ...prev, phase: 'aiming', swingAngle: 0 };
      }
      
      if (prev.phase === 'aiming') {
        const power = prev.swingPower;
        const launchAngle = -Math.PI / 4;
        const baseVelocity = 15 + power * 20;
        
        return {
          ...prev,
          phase: 'flying',
          velocityX: baseVelocity * Math.cos(launchAngle),
          velocityY: baseVelocity * Math.sin(launchAngle),
          flunkY: 300,
        };
      }
      
      if (prev.phase === 'stopped') {
        return {
          ...prev,
          phase: 'ready',
          flunkX: 100,
          flunkY: 300,
          velocityX: 0,
          velocityY: 0,
          rotation: 0,
          distance: 0,
          swingAngle: 0,
          swingPower: 0,
          powerUps: generatePowerUps(),
          attempts: prev.attempts + 1,
        };
      }
      
      return prev;
    });
  }, [generatePowerUps]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-2"
      style={{ 
        background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a1a 100%)',
        minHeight: '520px',
      }}
    >
      {/* Arcade cabinet frame */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #2a1a0a 0%, #1a0a00 100%)',
          padding: '10px',
          borderRadius: '10px',
          border: '4px solid #FFD700',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          onClick={handleClick}
          style={{
            border: '3px solid #333',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'block',
            imageRendering: 'pixelated',
          }}
        />
      </div>
      
      {/* Control panel */}
      <div 
        className="mt-3 flex gap-4 items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
          padding: '10px 20px',
          borderRadius: '8px',
          border: '2px solid #555',
        }}
      >
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          style={{
            background: 'linear-gradient(180deg, #FF6B00 0%, #CC5500 100%)',
            border: '2px solid #FFD700',
            borderRadius: '5px',
            padding: '8px 16px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
          }}
        >
          🏆 SCORES
        </button>
        
        <div style={{ color: '#00FF00', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
          🍌 SLIP • 🔴 BOUNCE • 📐 RAMP • 🩷 GUM • ⚡ BOOST
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowLeaderboard(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #1a1a3a 0%, #0a0a1a 100%)',
              border: '4px solid #FFD700',
              borderRadius: '10px',
              padding: '20px',
              minWidth: '350px',
              maxHeight: '400px',
              overflow: 'auto',
            }}
          >
            <h2 style={{ 
              color: '#FFD700', 
              fontFamily: '"Press Start 2P", monospace', 
              fontSize: '16px',
              textAlign: 'center',
              marginBottom: '15px',
            }}>
              🏆 HIGH SCORES 🏆
            </h2>
            
            {leaderboard.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
                No scores yet!
              </p>
            ) : (
              <div>
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px',
                      borderBottom: '1px solid #333',
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '10px',
                    }}
                  >
                    <span style={{ color: index < 3 ? '#FFD700' : '#fff' }}>
                      {index + 1}. {entry.username?.slice(0, 10) || entry.wallet?.slice(0, 8)}
                    </span>
                    <span style={{ color: '#00FF00' }}>{entry.score}m</span>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowLeaderboard(false)}
              style={{
                marginTop: '15px',
                width: '100%',
                background: 'linear-gradient(180deg, #FF6B00 0%, #CC5500 100%)',
                border: '2px solid #FFD700',
                borderRadius: '5px',
                padding: '10px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlunkyBash;
