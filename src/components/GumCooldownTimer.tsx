import { useState, useEffect, useRef } from 'react';
import { checkGumCooldown } from '../utils/gumAPI';

interface GumCooldownTimerProps {
  walletAddress: string;
  source: string;
  onCanClaim: (canClaim: boolean) => void;
}

export const GumCooldownTimer: React.FC<GumCooldownTimerProps> = ({
  walletAddress,
  source,
  onCanClaim
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string>('');
  const lastCheckRef = useRef<number>(0);
  const checkingRef = useRef<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;

    const checkCooldown = async () => {
      if (!walletAddress || !mounted) return;
      
      // Prevent concurrent checks
      if (checkingRef.current) return;
      
      // Rate limit: minimum 30 seconds between checks
      const now = Date.now();
      if (now - lastCheckRef.current < 30000 && lastCheckRef.current > 0) {
        return;
      }
      
      checkingRef.current = true;
      lastCheckRef.current = now;

      try {
        const cooldownCheck = await checkGumCooldown(walletAddress, source);
        
        if (!mounted) return;
        
        console.log(`Cooldown check for ${source}:`, cooldownCheck);
        
        if (cooldownCheck.canEarn) {
          setCanClaim(true);
          setTimeRemaining(null);
          setReason('Ready to claim!');
          onCanClaim(true);
        } else if (cooldownCheck.cooldownMinutes && cooldownCheck.cooldownMinutes > 0) {
          setCanClaim(false);
          setTimeRemaining(cooldownCheck.cooldownMinutes * 60); // Convert to seconds
          setReason(cooldownCheck.reason || 'In cooldown');
          onCanClaim(false);
        } else {
          // Daily limit reached or other reason
          setCanClaim(false);
          setTimeRemaining(null);
          setReason(cooldownCheck.reason || 'Cannot claim');
          onCanClaim(false);
        }
      } catch (error) {
        console.error('Error checking cooldown:', error);
        if (mounted) {
          setCanClaim(false);
          setTimeRemaining(null);
          setReason('Error checking status');
          onCanClaim(false);
        }
      } finally {
        checkingRef.current = false;
        if (mounted) setLoading(false);
      }
    };

    // Initial check
    checkCooldown();

    // Set up countdown timer (only for displaying remaining time)
    interval = setInterval(() => {
      if (!mounted) return;
      
      setTimeRemaining(prev => {
        if (!prev || prev <= 0) {
          return null;
        }
        
        // When countdown reaches 0, schedule a recheck (but not immediately)
        if (prev === 1) {
          setTimeout(checkCooldown, 1000);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [walletAddress, source, onCanClaim]);

  if (loading) {
    return <span style={{ color: '#666', fontSize: '12px' }}>Checking status...</span>;
  }

  if (canClaim) {
    return <span style={{ color: '#00aa00', fontWeight: 'bold' }}>✅ Ready to claim!</span>;
  }

  if (timeRemaining && timeRemaining > 0) {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const formatTime = () => {
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    return (
      <div style={{ fontSize: '12px' }}>
        <div style={{ color: '#ff6600', fontFamily: 'monospace' }}>
          ⏰ Next claim in: <strong>{formatTime()}</strong>
        </div>
        {source === 'daily_login' && (
          <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
            Resets at midnight UTC
          </div>
        )}
      </div>
    );
  }

  return (
    <span style={{ color: '#666', fontSize: '12px' }}>
      ❌ {reason}
    </span>
  );
};
